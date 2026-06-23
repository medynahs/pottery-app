/**
 * useGlazesSync, React Query hooks bridging /users/me/glazes with the local
 * Zustand store, following the same offline-first model as usePiecesSync.
 *
 * Pull: GET /users/me/glazes (+ /tests) on sign-in, merged by client_ref /
 * backendId.
 * Push: POST /users/me/glazes/sync with device snapshots of dirty glazes/tests
 * and any parked deletions (debounced).
 * Images are uploaded separately through the image mutations.
 */

import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import { canUploadGlazeMedia } from '@/src/utils/cloudStorage';
import {
  apiDeleteGlazeImage,
  apiListGlazeTests,
  apiListGlazes,
  apiSyncGlazes,
  apiUploadGlazeImage,
  backendGlazeToLocal,
  backendTestToLocal,
  localGlazeToSyncItem,
  localTestToSyncItem,
  type BackendGlaze,
  type BackendGlazeTest,
  type GlazeImageType,
  type SyncGlazesResponse,
} from '@/src/services/glazes';
import { useAppStore } from '@/src/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const GLAZES_QUERY_KEY = ['glazes'] as const;
export const glazesQueryKey = (userId: string) => [...GLAZES_QUERY_KEY, userId] as const;

const SYNC_DEBOUNCE_MS = 800;
const MAX_SYNC_BATCH = 500;

// ─── Module-level push sync state ────────────────────────────────────────────

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight = false;
let initialPullMerged = false;
let lastMergedAt = 0;

// ─── Dirty selectors ──────────────────────────────────────────────────────────

function glazesNeedingSync(glazes: GlazeLibraryItem[]): GlazeLibraryItem[] {
  return glazes.filter((g) => g.syncDirty || !g.backendId);
}

function testsNeedingSync(tests: GlazeTestTile[]): GlazeTestTile[] {
  return tests.filter((t) => t.syncDirty || !t.backendId);
}

export function hasPendingGlazesSync(): boolean {
  const { glazes, glazeTests, pendingGlazeDeletions, pendingGlazeTestDeletions } =
    useAppStore.getState();
  return (
    glazesNeedingSync(glazes).length > 0 ||
    testsNeedingSync(glazeTests).length > 0 ||
    pendingGlazeDeletions.length > 0 ||
    pendingGlazeTestDeletions.length > 0
  );
}

// ─── Pull merge ─────────────────────────────────────────────────────────────

function mergeGlazes(backend: BackendGlaze[], local: GlazeLibraryItem[]): GlazeLibraryItem[] {
  const byBackendId = new Map(local.filter((g) => g.backendId).map((g) => [g.backendId!, g]));
  const byClientRef = new Map(local.map((g) => [String(g.id), g]));

  const updatedByBackendId = new Map<string, GlazeLibraryItem>();
  const newOnes: GlazeLibraryItem[] = [];

  for (const b of backend) {
    const existing = (b.clientRef ? byClientRef.get(b.clientRef) : undefined) ?? byBackendId.get(b.id);
    // Don't clobber local edits that haven't been pushed yet, just stamp the id.
    if (existing?.syncDirty) {
      updatedByBackendId.set(b.id, { ...existing, backendId: b.id });
      continue;
    }
    const merged = backendGlazeToLocal(b, existing);
    if (existing) updatedByBackendId.set(b.id, merged);
    else newOnes.push(merged);
  }

  const retained = local.map((g) => (g.backendId ? updatedByBackendId.get(g.backendId) ?? g : g));
  return [...newOnes, ...retained];
}

function mergeTests(backend: BackendGlazeTest[], local: GlazeTestTile[]): GlazeTestTile[] {
  const byBackendId = new Map(local.filter((t) => t.backendId).map((t) => [t.backendId!, t]));
  const byClientRef = new Map(local.map((t) => [String(t.id), t]));

  const updatedByBackendId = new Map<string, GlazeTestTile>();
  const newOnes: GlazeTestTile[] = [];

  for (const b of backend) {
    const existing = (b.clientRef ? byClientRef.get(b.clientRef) : undefined) ?? byBackendId.get(b.id);
    if (existing?.syncDirty) {
      updatedByBackendId.set(b.id, { ...existing, backendId: b.id });
      continue;
    }
    const merged = backendTestToLocal(b, existing);
    if (existing) updatedByBackendId.set(b.id, merged);
    else newOnes.push(merged);
  }

  const retained = local.map((t) => (t.backendId ? updatedByBackendId.get(t.backendId) ?? t : t));
  return [...newOnes, ...retained];
}

// ─── Push apply ───────────────────────────────────────────────────────────────

function applyGlazeSyncResponse(response: SyncGlazesResponse) {
  const { clientRefMap, glazes: backendGlazes, tests: backendTests } = response;
  const state = useAppStore.getState();

  // Stamp backendId + clear dirty on items the server just acknowledged.
  const stampedGlazes = state.glazes.map((g) => {
    const backendId = clientRefMap[String(g.id)];
    return backendId ? { ...g, backendId, syncDirty: false } : g;
  });
  const stampedTests = state.glazeTests.map((t) => {
    const backendId = clientRefMap[String(t.id)];
    return backendId ? { ...t, backendId, syncDirty: false } : t;
  });

  useAppStore.setState({
    glazes: mergeGlazes(backendGlazes, stampedGlazes),
    glazeTests: mergeTests(backendTests, stampedTests),
    // Drop deletions the server confirmed (their client_ref came back mapped).
    pendingGlazeDeletions: state.pendingGlazeDeletions.filter((g) => !clientRefMap[String(g.id)]),
    pendingGlazeTestDeletions: state.pendingGlazeTestDeletions.filter((t) => !clientRefMap[String(t.id)]),
  });
}

// ─── Image reconciliation ────────────────────────────────────────────────────
//
// Glaze photos are picked as local device URIs before the glaze has a backendId,
// and images aren't part of the text sync. This pass uploads any local (non-http)
// photo to storage once its glaze has a backendId, then swaps the local URI for
// the returned public URL. Failures keep the local URI for a later retry.

let imageReconcileInFlight = false;

function isLocalUri(uri: string): boolean {
  return !/^https?:\/\//i.test(uri);
}

function fileFromUri(uri: string, kind: GlazeImageType): { uri: string; name: string; type: string } {
  const clean = uri.split('?')[0].split('#')[0];
  const ext = (clean.split('.').pop() || 'jpg').toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return { uri, name: `${kind}-${Date.now()}.${ext}`, type };
}

/** Swap a local photo URI for its uploaded public URL, reading fresh state so a
 *  concurrent edit isn't clobbered. */
function replaceGlazePhotoUri(glazeId: string, oldUri: string, newUrl: string) {
  const { glazes } = useAppStore.getState();
  useAppStore.setState({
    glazes: glazes.map((g) =>
      g.id === glazeId
        ? {
            ...g,
            bucketPhotoUri: g.bucketPhotoUri === oldUri ? newUrl : g.bucketPhotoUri,
            testTilePhotoUris: g.testTilePhotoUris.map((u) => (u === oldUri ? newUrl : u)),
            finishedPiecePhotoUris: g.finishedPiecePhotoUris.map((u) => (u === oldUri ? newUrl : u)),
            accidentPhotoUris: g.accidentPhotoUris.map((u) => (u === oldUri ? newUrl : u)),
          }
        : g,
    ),
  });
}

export async function reconcileGlazeImages(): Promise<void> {
  if (imageReconcileInFlight) return;
  const { sessionToken } = useAppStore.getState();
  if (!sessionToken) return;

  imageReconcileInFlight = true;
  try {
    for (const glaze of useAppStore.getState().glazes) {
      if (!glaze.backendId) continue;

      const pending: { type: GlazeImageType; uri: string }[] = [];
      if (glaze.bucketPhotoUri && isLocalUri(glaze.bucketPhotoUri)) {
        pending.push({ type: 'bucket', uri: glaze.bucketPhotoUri });
      }
      for (const uri of glaze.testTilePhotoUris) if (isLocalUri(uri)) pending.push({ type: 'test-tile', uri });
      for (const uri of glaze.finishedPiecePhotoUris) if (isLocalUri(uri)) pending.push({ type: 'finished-piece', uri });
      for (const uri of glaze.accidentPhotoUris) if (isLocalUri(uri)) pending.push({ type: 'accident', uri });

      for (const { type, uri } of pending) {
        if (!canUploadGlazeMedia()) {
          if (__DEV__) console.warn(`[glazes:image] cloud quota reached, skipping upload for glaze ${glaze.id}`);
          continue;
        }
        try {
          const res = await apiUploadGlazeImage(sessionToken, glaze.backendId, fileFromUri(uri, type), type);
          replaceGlazePhotoUri(glaze.id, uri, res.image.url);
        } catch (err) {
          if (__DEV__) console.warn(`[glazes:image] upload failed for glaze ${glaze.id}:`, err);
          // Leave the local URI in place; retried on the next reconcile pass.
        }
      }
    }
  } finally {
    imageReconcileInFlight = false;
  }
}

// ─── Imperative push sync ─────────────────────────────────────────────────────

export async function flushGlazesSync(): Promise<boolean> {
  if (syncInFlight) return false;

  const { sessionToken } = useAppStore.getState();
  if (!sessionToken) return false;
  if (!hasPendingGlazesSync()) return true;

  syncInFlight = true;
  try {
    const state = useAppStore.getState();
    const glazes = [
      ...glazesNeedingSync(state.glazes).map((g) => localGlazeToSyncItem(g)),
      ...state.pendingGlazeDeletions.map((g) => localGlazeToSyncItem(g, true)),
    ].slice(0, MAX_SYNC_BATCH);
    const tests = [
      ...testsNeedingSync(state.glazeTests).map((t) => localTestToSyncItem(t, String(t.glazeId))),
      ...state.pendingGlazeTestDeletions.map((t) => localTestToSyncItem(t, String(t.glazeId), true)),
    ].slice(0, MAX_SYNC_BATCH);

    if (__DEV__) console.log(`[glazes:sync] pushing ${glazes.length} glaze(s), ${tests.length} test(s)`);

    const response = await apiSyncGlazes(sessionToken, { glazes, tests });
    applyGlazeSyncResponse(response);
    // Fire-and-forget: glazes now have backendIds, so any local photos can upload.
    void reconcileGlazeImages();
    return true;
  } catch (err) {
    if (__DEV__) console.warn('[glazes:sync] push failed:', err);
    useAppStore.getState().showToast('Could not sync glazes', 'error');
    return false;
  } finally {
    syncInFlight = false;
  }
}

/** Debounce a push sync, call after any local glaze/test mutation. */
export function scheduleGlazesSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void flushGlazesSync();
  }, SYNC_DEBOUNCE_MS);
}

// ─── Main hook (mount once at app root) ───────────────────────────────────────

export function useGlazesSync() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const oryIdentityId = useAppStore((s) => s.oryIdentityId);
  const prevUserId = useRef(oryIdentityId);

  useEffect(() => {
    if (prevUserId.current !== oryIdentityId) {
      prevUserId.current = oryIdentityId;
      initialPullMerged = false;
      lastMergedAt = 0;
    }
  }, [oryIdentityId]);

  const query = useQuery({
    queryKey: glazesQueryKey(oryIdentityId ?? ''),
    queryFn: async () => {
      const [glazes, tests] = await Promise.all([
        apiListGlazes(sessionToken!),
        apiListGlazeTests(sessionToken!),
      ]);
      return { glazes, tests };
    },
    enabled: !!sessionToken && !!oryIdentityId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (!query.data) return;
    if (query.dataUpdatedAt === lastMergedAt) return;
    lastMergedAt = query.dataUpdatedAt;

    if (__DEV__) {
      console.log(
        `[glazes:sync] fetched ${query.data.glazes.length} glaze(s), ${query.data.tests.length} test(s)`,
      );
    }
    const { glazes, glazeTests } = useAppStore.getState();
    useAppStore.setState({
      glazes: mergeGlazes(query.data.glazes, glazes),
      glazeTests: mergeTests(query.data.tests, glazeTests),
    });
    // Upload any photos left local from a previous session (glaze already synced).
    void reconcileGlazeImages();

    if (!initialPullMerged) {
      initialPullMerged = true;
      scheduleGlazesSync();
    }
  }, [query.data, query.dataUpdatedAt]);

  return query;
}

// ─── Image mutations ──────────────────────────────────────────────────────────

export interface UploadGlazeImageOptions {
  glazeBackendId: string;
  file: { uri: string; name: string; type: string };
  imageType: GlazeImageType;
}

export function useUploadGlazeImageMutation() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ glazeBackendId, file, imageType }: UploadGlazeImageOptions) => {
      if (!sessionToken) throw new Error('Not signed in');
      return apiUploadGlazeImage(sessionToken, glazeBackendId, file, imageType);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GLAZES_QUERY_KEY });
      useAppStore.getState().showToast('Photo uploaded', 'success');
    },
    onError: () => {
      useAppStore.getState().showToast('Could not upload photo', 'error');
    },
  });
}

export interface DeleteGlazeImageOptions {
  glazeBackendId: string;
  imageId: string;
}

export function useDeleteGlazeImageMutation() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ glazeBackendId, imageId }: DeleteGlazeImageOptions) => {
      if (!sessionToken) throw new Error('Not signed in');
      await apiDeleteGlazeImage(sessionToken, glazeBackendId, imageId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GLAZES_QUERY_KEY });
      useAppStore.getState().showToast('Photo removed', 'success');
    },
    onError: () => {
      useAppStore.getState().showToast('Could not remove photo', 'error');
    },
  });
}
