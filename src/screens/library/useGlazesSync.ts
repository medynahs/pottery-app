/**
 * useGlazesSync — bridge between /me/glazes (+ /tests) and the local Zustand
 * store, built on the shared doc-sync engine primitives. Glazes stay
 * structured (the backend queries their fields for community/discover), but
 * the sync contract is the same as pieces: client_ref identity, syncDirty /
 * deleted flags, dirty-wins pull merge, batched push, tombstones dropped on
 * ack. Glazes and tests ride in one request so a new glaze and its tests can
 * land together.
 *
 * Images are uploaded separately through the image mutations; a local (non
 * http) photo uri means "on this device only", swapped for the public URL
 * once uploaded.
 */

import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import { flushPiecesSync } from '@/src/screens/pieces/hooks/usePiecesSync';
import { applySyncAck, beginSyncing, endSyncing, mergeBackendRows } from '@/src/sync/docSync';
import { pendingRecords } from '@/src/sync/syncState';
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
  type GlazeImageType,
} from '@/src/services/glazes';
import { useAppStore } from '@/src/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

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

export function hasPendingGlazesSync(): boolean {
  const { glazes, glazeTests } = useAppStore.getState();
  return pendingRecords(glazes).length > 0 || pendingRecords(glazeTests).length > 0;
}

// ─── Pull merge ─────────────────────────────────────────────────────────────

const testFromBackend = backendTestToLocal;

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
  const isSignedIn = useAppStore.getState().isSignedIn;
  if (!isSignedIn) return;

  imageReconcileInFlight = true;
  try {
    for (const glaze of useAppStore.getState().glazes) {
      if (!glaze.backendId || glaze.deleted) continue;

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
          const res = await apiUploadGlazeImage(glaze.backendId, fileFromUri(uri, type), type);
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

  const isSignedIn = useAppStore.getState().isSignedIn;
  if (!isSignedIn) return false;
  if (!hasPendingGlazesSync()) return true;

  syncInFlight = true;
  beginSyncing();
  try {
    const state = useAppStore.getState();
    const glazesToSync = pendingRecords(state.glazes).slice(0, MAX_SYNC_BATCH);
    const testsToSync = pendingRecords(state.glazeTests).slice(0, MAX_SYNC_BATCH);

    if (__DEV__) console.log(`[glazes:sync] pushing ${glazesToSync.length} glaze(s), ${testsToSync.length} test(s)`);

    const { client_ref_map: refMap } = await apiSyncGlazes({
      glazes: glazesToSync.map((g) => localGlazeToSyncItem(g, g.deleted === true)),
      tests: testsToSync.map((t) => localTestToSyncItem(t, String(t.glazeId), t.deleted === true)),
    });

    const pushedGlazes = new Map(glazesToSync.map((g) => [g.id, g]));
    const pushedTests = new Map(testsToSync.map((t) => [t.id, t]));
    const fresh = useAppStore.getState();

    // A piece synced before its glaze had a backendId pushed glaze_id = null.
    // Now that these glazes are mapped, re-dirty their pieces so the queryable
    // glaze_id projection catches up (the flushPiecesSync below picks it up).
    const newlyMapped = new Set(
      glazesToSync.filter((g) => !g.backendId && !g.deleted && refMap[String(g.id)]).map((g) => g.id),
    );

    useAppStore.setState({
      glazes: applySyncAck(fresh.glazes, refMap, pushedGlazes),
      glazeTests: applySyncAck(fresh.glazeTests, refMap, pushedTests),
      ...(newlyMapped.size > 0
        ? {
            pieces: fresh.pieces.map((p) =>
              p.glazeId && newlyMapped.has(p.glazeId) && !p.syncDirty && !p.deleted
                ? { ...p, syncDirty: true }
                : p,
            ),
          }
        : {}),
    });

    useAppStore.getState().setLastSyncedAt(new Date().toISOString());

    // Pieces may be waiting on glaze backend IDs before glaze_id can push.
    void flushPiecesSync();
    // Fire-and-forget: glazes now have backendIds, so any local photos can upload.
    void reconcileGlazeImages();
    return true;
  } catch (err) {
    if (__DEV__) console.warn('[glazes:sync] push failed:', err);
    useAppStore.getState().showToast('Could not sync glazes', 'error');
    return false;
  } finally {
    syncInFlight = false;
    endSyncing();
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
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const query = useQuery({
    queryKey: glazesQueryKey('me'),
    queryFn: async () => {
      const [glazes, tests] = await Promise.all([
        apiListGlazes(),
        apiListGlazeTests(),
      ]);
      return { glazes, tests };
    },
    enabled: isSignedIn,
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
    const localIdByBackendId = new Map(
      query.data.glazes.map((g) => [g.id, String(g.client_ref ?? g.id)]),
    );
    useAppStore.setState({
      glazes: mergeBackendRows(query.data.glazes, glazes, (row, existing) =>
        backendGlazeToLocal(row, existing, localIdByBackendId),
      ),
      glazeTests: mergeBackendRows(query.data.tests, glazeTests, testFromBackend),
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
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ glazeBackendId, file, imageType }: UploadGlazeImageOptions) => {
      if (!isSignedIn) throw new Error('Not signed in');
      return apiUploadGlazeImage(glazeBackendId, file, imageType);
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
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ glazeBackendId, imageId }: DeleteGlazeImageOptions) => {
      if (!isSignedIn) throw new Error('Not signed in');
      await apiDeleteGlazeImage(glazeBackendId, imageId);
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
