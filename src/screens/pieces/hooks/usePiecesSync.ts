/**
 * usePiecesSync — bridge between /users/me/pieces and the local Zustand store.
 *
 * FE is the source of truth; the backend keeps one opaque doc per piece.
 *
 * Push: ONE path — POST /users/me/pieces/sync with full snapshots of every
 * piece that is dirty, unlinked or tombstoned. The response is just a
 * client_ref → backend id map; a piece's dirty flag clears only if its store
 * object is still the exact one snapshotted (no edit landed mid-flight).
 *
 * Pull: GET /users/me/pieces on sign-in. Locally-dirty pieces are never
 * touched (whole-piece last-write-wins: their next push overwrites the row);
 * clean pieces are replaced wholesale from the doc, re-attaching this device's
 * photo files by assetId and keeping not-yet-uploaded photos.
 */

import { setPiecesIfChanged, useAppStore } from '@/src/store';
import type { Piece, PiecePhoto, TimelineEntry } from '@/src/types/pieces';
import { useIsFetching, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { isLocalMediaUri } from '@/src/utils/cloudStorage';
import { scheduleAllPendingPiecePhotoSync } from '@/src/utils/pieceAssetSync';
import {
  apiListPieces,
  apiSyncPieces,
  docForBackend,
  resolvePieceGlazeBackendId,
  type BackendPiece,
  type PieceSyncSnapshot,
} from '../../../services/pieces';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const PIECES_QUERY_KEY = ['pieces'] as const;
export const piecesQueryKey = (userId: string) =>
  [...PIECES_QUERY_KEY, userId] as const;

const SYNC_DEBOUNCE_MS = 800;
const MAX_SYNC_BATCH = 500;

// ─── Module-level push sync state ────────────────────────────────────────────

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight = false;
let initialPullMerged = false;
let lastMergedAt = 0;

// ─── Push ─────────────────────────────────────────────────────────────────────

/** Pieces that need to be included in the next push sync. */
export function piecesNeedingSync(pieces: Piece[]): Piece[] {
  return pieces.filter((p) => p.syncDirty || p.deleted || !p.backendId);
}

export function hasPendingPiecesSync(): boolean {
  return piecesNeedingSync(useAppStore.getState().pieces).length > 0;
}

function pieceToSnapshot(piece: Piece): PieceSyncSnapshot {
  const glazes = useAppStore.getState().glazes;
  return {
    client_ref: String(piece.id),
    name: piece.name,
    stage: piece.stage,
    glaze_id: resolvePieceGlazeBackendId(piece.glazeId, glazes),
    ...(piece.deleted ? { deleted: true } : {}),
    doc: docForBackend(piece),
  };
}

export async function flushPiecesSync(): Promise<boolean> {
  if (syncInFlight) return false;

  const { pieces, setIsSyncing, setLastSyncedAt, isSignedIn } =
    useAppStore.getState();
  if (!isSignedIn) return false;

  const toSync = piecesNeedingSync(pieces).slice(0, MAX_SYNC_BATCH);
  if (toSync.length === 0) return true;

  syncInFlight = true;
  setIsSyncing(true);

  try {
    if (__DEV__) console.log(`[pieces:sync] pushing ${toSync.length} snapshot(s)`);
    const { client_ref_map: refMap } = await apiSyncPieces({
      pieces: toSync.map(pieceToSnapshot),
    });

    // The exact objects we snapshotted: identity intact = no edit mid-flight.
    const pushed = new Map(toSync.map((p) => [p.id, p]));

    setPiecesIfChanged(
      useAppStore.getState().pieces
        .filter((p) => !(p.deleted && refMap[String(p.id)])) // acked deletes drop out
        .map((p) => {
          const backendId = refMap[String(p.id)] ?? p.backendId;
          const clearDirty = p.syncDirty === true && pushed.get(p.id) === p;
          if (backendId === p.backendId && !clearDirty) return p;
          return { ...p, backendId, ...(clearDirty ? { syncDirty: false } : {}) };
        }),
    );

    setLastSyncedAt(new Date().toISOString());

    // New backend links may unblock pending photo uploads.
    scheduleAllPendingPiecePhotoSync();
    return true;
  } catch (err) {
    if (__DEV__) console.warn('[pieces:sync] push failed:', err);
    useAppStore.getState().showToast('Could not sync pieces', 'error');
    return false;
  } finally {
    syncInFlight = false;
    setIsSyncing(false);
  }
}

/** Debounce a push sync, call after any local piece mutation. */
export function schedulePiecesSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void flushPiecesSync();
  }, SYNC_DEBOUNCE_MS);
}

// ─── Pull ─────────────────────────────────────────────────────────────────────

type BackendPhotoRef = { assetId?: string };

/**
 * Rebuild a local piece from its backend doc. Timeline photo refs get this
 * device's local file uri back by assetId (hydrate downloads the rest), and
 * photos still pending upload (no assetId) are kept by entry index. Returns
 * null for an empty/legacy doc — unrestorable; the owning device's next push
 * refills it.
 */
function pieceFromDoc(bp: BackendPiece, existing?: Piece): Piece | null {
  const doc = bp.doc;
  if (!doc || typeof doc.id !== 'number' || !doc.name || !Array.isArray(doc.timeline)) {
    return null;
  }

  const localUriByAssetId = new Map<string, string>();
  for (const entry of existing?.timeline ?? []) {
    for (const photo of entry.photos ?? []) {
      if (photo.assetId && isLocalMediaUri(photo.uri)) {
        localUriByAssetId.set(photo.assetId, photo.uri);
      }
    }
  }

  const timeline: TimelineEntry[] = (doc.timeline as TimelineEntry[]).map((entry, i) => {
    const refs = ((entry.photos ?? []) as BackendPhotoRef[])
      .filter((ref) => ref.assetId)
      .map<PiecePhoto>((ref) => ({
        assetId: ref.assetId,
        uri: localUriByAssetId.get(ref.assetId!) ?? '',
      }));
    const pending = (existing?.timeline[i]?.photos ?? []).filter((photo) => !photo.assetId);
    return { ...entry, photos: [...refs, ...pending] };
  });

  const piece: Piece = {
    ...(doc as Piece),
    id: existing?.id ?? doc.id,
    backendId: bp.id,
    visibility: bp.visibility ?? existing?.visibility,
    timeline,
  };

  // Keep this device's local cover file; hydrate downloads it (by the doc's
  // coverAssetId) when there is none.
  const existingCover = existing?.photo ?? existing?.imgUrl;
  if (existingCover && isLocalMediaUri(existingCover)) {
    piece.photo = existing?.photo;
    piece.imgUrl = existing?.imgUrl;
  }

  return piece;
}

function mergeBackendPiecesIntoLocal(
  backendPieces: BackendPiece[],
  localPieces: Piece[],
): Piece[] {
  const byClientRef = new Map(localPieces.map((p) => [String(p.id), p]));
  const byBackendId = new Map(
    localPieces.filter((p) => p.backendId).map((p) => [p.backendId!, p]),
  );

  const replaced = new Map<number, Piece>();
  const added: Piece[] = [];

  for (const bp of backendPieces) {
    const existing =
      (bp.client_ref ? byClientRef.get(bp.client_ref) : undefined) ??
      byBackendId.get(bp.id);

    // Local edits and pending deletes win whole-piece; their push overwrites the row.
    if (existing && (existing.syncDirty || existing.deleted)) {
      if (!existing.backendId) {
        replaced.set(existing.id, { ...existing, backendId: bp.id });
      }
      continue;
    }

    const merged = pieceFromDoc(bp, existing);
    if (!merged) continue;
    if (existing) replaced.set(existing.id, merged);
    else added.push(merged);
  }

  return [...added, ...localPieces.map((p) => replaced.get(p.id) ?? p)];
}

// ─── Main hook (mount once at app root) ───────────────────────────────────────

/**
 * Loads pieces from the backend whenever the user is authenticated, merges
 * into the store, and schedules a push sync for any local-only changes.
 */
export function usePiecesSync() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const query = useQuery({
    queryKey: piecesQueryKey('me'),
    queryFn: () => apiListPieces(),
    enabled: isSignedIn,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (!query.data) return;
    if (query.dataUpdatedAt === lastMergedAt) return;

    lastMergedAt = query.dataUpdatedAt;
    if (__DEV__) console.log(`[pieces:sync] fetched ${query.data.length} piece(s) from backend`);
    setPiecesIfChanged(
      mergeBackendPiecesIntoLocal(query.data, useAppStore.getState().pieces),
    );

    scheduleAllPendingPiecePhotoSync();

    if (!initialPullMerged) {
      initialPullMerged = true;
      schedulePiecesSync();
    }
  }, [query.data, query.dataUpdatedAt]);

  return query;
}

/** Sync status + manual refetch for the Pieces screen (no duplicate query hook). */
export function usePiecesSyncStatus() {
  const isSyncing = useAppStore((s) => s.isSyncing);

  const isFetching = useIsFetching({ queryKey: piecesQueryKey('me') }) > 0;
  const queryClient = useQueryClient();

  const refetchPieces = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: piecesQueryKey('me') });
    if (hasPendingPiecesSync()) schedulePiecesSync();
  }, [queryClient]);

  return {
    isSyncing: isFetching || isSyncing,
    refetchPieces,
  };
}
