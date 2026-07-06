/**
 * usePiecesSync — bridge between /me/pieces and the local Zustand store,
 * built on the shared doc-sync engine (pieces are its reference domain).
 *
 * FE is the source of truth; the backend keeps one opaque doc per piece.
 * Push: ONE path — POST /me/pieces/sync with full snapshots of everything
 * that needsPush. Pull: GET /me/pieces on sign-in, merged dirty-wins;
 * clean pieces are replaced wholesale from the doc, re-attaching this
 * device's photo files by assetId and keeping not-yet-uploaded photos.
 */

import { setPiecesIfChanged, useAppStore } from '@/src/store';
import type { Piece, PiecePhoto, TimelineEntry } from '@/src/types/pieces';
import { useIsFetching, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { isLocalMediaUri } from '@/src/utils/cloudStorage';
import { scheduleAllPendingPiecePhotoSync } from '@/src/utils/pieceAssetSync';
import { createDocSyncDomain, mergeBackendRows } from '@/src/sync/docSync';
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

let initialPullMerged = false;
let lastMergedAt = 0;

// ─── Push ─────────────────────────────────────────────────────────────────────

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

const piecesDomain = createDocSyncDomain<Piece, PieceSyncSnapshot>({
  label: 'pieces',
  errorToast: 'Could not sync pieces',
  select: (state) => state.pieces,
  write: setPiecesIfChanged,
  toSnapshot: pieceToSnapshot,
  push: async (snapshots) =>
    (await apiSyncPieces({ pieces: snapshots })).client_ref_map,
  // New backend links may unblock pending photo uploads.
  onPushed: scheduleAllPendingPiecePhotoSync,
});

export const flushPiecesSync = piecesDomain.flush;
export const schedulePiecesSync = piecesDomain.schedule;
export const hasPendingPiecesSync = piecesDomain.hasPending;

// ─── Pull ─────────────────────────────────────────────────────────────────────

type BackendPhotoRef = { assetId?: string };

/**
 * Rebuild a local piece from its backend doc. Timeline photo refs get this
 * device's local file uri back by assetId (hydrate downloads the rest), and
 * photos still pending upload (no assetId) are kept by entry index. Returns
 * null for an empty/legacy doc — unrestorable; the owning device's next push
 * refills it.
 */
function pieceFromBackend(bp: BackendPiece, existing?: Piece): Piece | null {
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
    const existingPhotos = existing?.timeline[i]?.photos ?? [];
    const pendingByIndex = new Map<number, PiecePhoto>();
    existingPhotos.forEach((ph, idx) => { if (!ph.assetId) pendingByIndex.set(idx, ph); });

    const refs = ((entry.photos ?? []) as BackendPhotoRef[])
      .filter((ref) => ref.assetId)
      .map<PiecePhoto>((ref) => ({
        assetId: ref.assetId,
        uri: localUriByAssetId.get(ref.assetId!) ?? '',
      }));

    const photos: PiecePhoto[] = [];
    let ri = 0;
    const max = Math.max(existingPhotos.length, refs.length);
    for (let idx = 0; idx < max; idx += 1) {
      const p = pendingByIndex.get(idx) ?? refs[ri++];
      if (p) photos[idx] = p;
    }
    while (ri < refs.length) photos.push(refs[ri++]);

    return { ...entry, photos };
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
      mergeBackendRows(query.data, useAppStore.getState().pieces, pieceFromBackend),
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
