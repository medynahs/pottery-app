/**
 * usePiecesSync, React Query hooks that bridge the backend /users/me/pieces
 * endpoints with the local Zustand store.
 *
 * Pull: GET /users/me/pieces on sign-in, merged into the store by client_ref /
 * backendId.
 * Push: PUT /users/me/pieces/{id} for backend-linked edits (including stage),
 * POST /users/me/pieces/sync for new local-only pieces (debounced).
 */

import { setPiecesIfChanged, useAppStore } from '@/src/store';
import type { Piece } from '@/src/types/pieces';
import { useIsFetching, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import {
  API_TO_LOCAL_STAGE,
  LOCAL_STAGE_TO_API,
  apiDeletePiece,
  apiDeletePieceAsset,
  apiListPieces,
  apiSyncPieces,
  apiUpdatePiece,
  apiUpdatePieceAsset,
  apiUploadPieceAsset,
  type ApiPieceStatus,
  type BackendPiece,
  type PieceSyncSnapshot,
  type SyncPiecesResponse,
  type UpdateAssetPayload,
} from '../../../services/pieces';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const PIECES_QUERY_KEY = ['pieces'] as const;
export const piecesQueryKey = (userId: string) =>
  [...PIECES_QUERY_KEY, userId] as const;
export const pieceAssetsQueryKey = (pieceId: string) =>
  ['piece-assets', pieceId] as const;

const SYNC_DEBOUNCE_MS = 800;
const MAX_SYNC_BATCH = 500;

// ─── Module-level push sync state ────────────────────────────────────────────

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight = false;
let initialPullMerged = false;
let lastMergedAt = 0;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function localStageToApiStatus(stage: string): ApiPieceStatus {
  return LOCAL_STAGE_TO_API[stage] ?? 'idea';
}

function apiStatusMatchesLocalStage(localStage: string, apiStatus: ApiPieceStatus | string): boolean {
  return localStageToApiStatus(localStage) === apiStatus;
}

function pieceToSnapshot(piece: Piece): PieceSyncSnapshot {
  const snapshot: PieceSyncSnapshot = {
    client_ref: String(piece.id),
    name: piece.name,
    status: localStageToApiStatus(piece.stage),
  };
  if (piece.description) snapshot.description = piece.description;
  if (piece.deleted) snapshot.deleted = true;
  return snapshot;
}

function preferPieceOnDuplicate(a: Piece, b: Piece): Piece {
  if (a.syncDirty && !b.syncDirty) return a;
  if (b.syncDirty && !a.syncDirty) return b;
  if (a.timeline.length !== b.timeline.length) {
    return a.timeline.length > b.timeline.length ? a : b;
  }
  return a;
}

function dedupePiecesByBackendId(pieces: Piece[]): Piece[] {
  const withoutBackend: Piece[] = [];
  const byBackendId = new Map<string, Piece>();

  for (const piece of pieces) {
    if (!piece.backendId) {
      withoutBackend.push(piece);
      continue;
    }
    const existing = byBackendId.get(piece.backendId);
    byBackendId.set(
      piece.backendId,
      existing ? preferPieceOnDuplicate(existing, piece) : piece,
    );
  }

  return [...withoutBackend, ...byBackendId.values()];
}

/** Pieces that need to be included in the next push sync. */
export function piecesNeedingSync(pieces: Piece[]): Piece[] {
  return pieces.filter((p) => p.syncDirty || p.deleted || !p.backendId);
}

export function hasPendingPiecesSync(): boolean {
  return piecesNeedingSync(useAppStore.getState().pieces).length > 0;
}

function backendToLocalPatch(bp: BackendPiece, existing?: Piece): Piece {
  const stage = API_TO_LOCAL_STAGE[bp.status] ?? bp.status;
  const parsedId = bp.client_ref ? Number(bp.client_ref) : NaN;
  const localId = existing?.id ?? (!Number.isNaN(parsedId) ? parsedId : Date.now() + Math.floor(Math.random() * 1_000));

  const base: Piece = existing ?? {
    id: localId,
    name: bp.name,
    stage,
    createdAt: bp.created_at,
    updatedAt: bp.updated_at,
    timeline: [{ stage, timestamp: bp.created_at }],
    clay: '',
  };

  return {
    ...base,
    backendId: bp.id,
    name: bp.name,
    stage,
    description: bp.description ?? undefined,
    updatedAt: bp.updated_at,
  };
}

function mergeBackendPiecesIntoLocal(
  backendPieces: BackendPiece[],
  localPieces: Piece[],
): Piece[] {
  const byBackendId = new Map(
    localPieces.filter((p) => p.backendId).map((p) => [p.backendId!, p]),
  );
  const byClientRef = new Map(localPieces.map((p) => [String(p.id), p]));

  const updatedByBackendId = new Map<string, Piece>();
  const newPieces: Piece[] = [];

  for (const bp of backendPieces) {
    const existing =
      (bp.client_ref ? byClientRef.get(bp.client_ref) : undefined) ??
      byBackendId.get(bp.id);

    // Never clobber unpushed local edits, server pull must not revert stage advances.
    if (existing?.syncDirty) {
      updatedByBackendId.set(bp.id, {
        ...existing,
        backendId: bp.id,
        updatedAt: bp.updated_at,
      });
      continue;
    }

    const merged = backendToLocalPatch(bp, existing);
    if (existing) {
      updatedByBackendId.set(bp.id, merged);
    } else {
      newPieces.push(merged);
    }
  }

  const retained = localPieces.map((p) =>
    p.backendId ? (updatedByBackendId.get(p.backendId) ?? p) : p,
  );

  return dedupePiecesByBackendId([...newPieces, ...retained]);
}

function applySyncResponse(localPieces: Piece[], response: SyncPiecesResponse): Piece[] {
  const { client_ref_map, pieces: backendPieces } = response;

  let working = localPieces.filter(
    (p) => !(p.deleted && client_ref_map[String(p.id)]),
  );

  // Attach backend IDs but keep syncDirty until the server confirms the local stage.
  working = working.map((p) => {
    const backendId = client_ref_map[String(p.id)];
    if (!backendId) return p;
    return { ...p, backendId };
  });

  const merged = mergeBackendPiecesIntoLocal(backendPieces, working);
  const backendById = new Map(backendPieces.map((bp) => [bp.id, bp]));

  return merged.map((piece) => {
    if (!piece.syncDirty || !piece.backendId) return piece;

    const backendPiece = backendById.get(piece.backendId);
    if (!backendPiece) return piece;

    if (apiStatusMatchesLocalStage(piece.stage, backendPiece.status)) {
      return {
        ...piece,
        syncDirty: false,
        updatedAt: backendPiece.updated_at,
      };
    }

    // Server response still reflects an older stage, keep local advance and retry sync.
    return piece;
  });
}

function applyBackendAckToLocalPiece(localId: number, backendPiece: BackendPiece): void {
  setPiecesIfChanged(
    useAppStore.getState().pieces.map((piece) => {
      if (piece.id !== localId) return piece;

      if (apiStatusMatchesLocalStage(piece.stage, backendPiece.status)) {
        return {
          ...piece,
          backendId: backendPiece.id,
          syncDirty: false,
          updatedAt: backendPiece.updated_at,
        };
      }

      return {
        ...piece,
        backendId: backendPiece.id,
        updatedAt: backendPiece.updated_at,
      };
    }),
  );
}

async function pushDirtyBackendPiece(
  sessionToken: string,
  piece: Piece,
): Promise<'updated' | 'deleted' | 'failed'> {
  if (!piece.backendId) return 'failed';

  try {
    if (piece.deleted) {
      await apiDeletePiece(sessionToken, piece.backendId);
      setPiecesIfChanged(useAppStore.getState().pieces.filter((p) => p.id !== piece.id));
      return 'deleted';
    }

    const backendPiece = await apiUpdatePiece(sessionToken, piece.backendId, {
      name: piece.name,
      status: localStageToApiStatus(piece.stage),
      description: piece.description,
    });
    applyBackendAckToLocalPiece(piece.id, backendPiece);
    return 'updated';
  } catch (err) {
    if (__DEV__) console.warn(`[pieces:sync] PUT failed for ${piece.backendId}:`, err);
    return 'failed';
  }
}

function mergePiecesIntoStore(backendPieces: BackendPiece[], localPieces: Piece[]) {
  setPiecesIfChanged(mergeBackendPiecesIntoLocal(backendPieces, localPieces));
}

// ─── Imperative push sync ─────────────────────────────────────────────────────

export async function flushPiecesSync(): Promise<boolean> {
  if (syncInFlight) return false;

  const { sessionToken, pieces, setIsSyncing, setLastSyncedAt } =
    useAppStore.getState();
  if (!sessionToken) return false;

  const toSync = piecesNeedingSync(pieces);
  if (toSync.length === 0) return true;

  syncInFlight = true;
  setIsSyncing(true);

  try {
    const backendLinked = toSync.filter((piece) => piece.backendId);
    const needsBulkSync = toSync.filter((piece) => !piece.backendId);

    for (const piece of backendLinked) {
      const result = await pushDirtyBackendPiece(sessionToken, piece);
      if (result === 'failed') {
        useAppStore.getState().showToast('Could not sync piece changes', 'error');
        return false;
      }
    }

    if (needsBulkSync.length > 0) {
      const snapshots = needsBulkSync.slice(0, MAX_SYNC_BATCH).map(pieceToSnapshot);
      if (__DEV__) console.log(`[pieces:sync] bulk pushing ${snapshots.length} snapshot(s)`);

      const response = await apiSyncPieces(sessionToken, { pieces: snapshots });
      setPiecesIfChanged(applySyncResponse(useAppStore.getState().pieces, response));
    }

    setLastSyncedAt(new Date().toISOString());

    if (__DEV__) {
      console.log(
        `[pieces:sync] ok, ${backendLinked.length} PUT, ${needsBulkSync.length} bulk`,
      );
    }
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

// ─── Main hook (mount once at app root) ───────────────────────────────────────

/**
 * Loads pieces from the backend whenever the user is authenticated, merges
 * into the store, and schedules a push sync for any local-only changes.
 */
export function usePiecesSync() {
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
    queryKey: piecesQueryKey(oryIdentityId ?? ''),
    queryFn: () => apiListPieces(sessionToken!),
    enabled: !!sessionToken && !!oryIdentityId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (!query.data) return;
    if (query.dataUpdatedAt === lastMergedAt) return;

    lastMergedAt = query.dataUpdatedAt;
    if (__DEV__) console.log(`[pieces:sync] fetched ${query.data.length} piece(s) from backend`);
    const { pieces } = useAppStore.getState();
    mergePiecesIntoStore(query.data, pieces);

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
  const oryIdentityId = useAppStore((s) => s.oryIdentityId);
  const isFetching = useIsFetching({ queryKey: piecesQueryKey(oryIdentityId ?? '') }) > 0;
  const queryClient = useQueryClient();

  const refetchPieces = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: piecesQueryKey(oryIdentityId ?? '') });
    if (hasPendingPiecesSync()) schedulePiecesSync();
  }, [queryClient, oryIdentityId]);

  return {
    isSyncing: isFetching || isSyncing,
    refetchPieces,
  };
}

// ─── Asset mutations (unchanged, still per-op) ───────────────────────────────

export interface DeletePieceAssetOptions {
  pieceBackendId: string;
  assetId: string;
}

export function useDeletePieceAssetMutation() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pieceBackendId, assetId }: DeletePieceAssetOptions) => {
      if (!sessionToken) throw new Error('Not signed in');
      if (__DEV__) console.log(`[pieces:asset:delete] DELETE asset ${assetId} on piece ${pieceBackendId}`);
      await apiDeletePieceAsset(sessionToken, pieceBackendId, assetId);
    },
    onSuccess: (_, { pieceBackendId }) => {
      void queryClient.invalidateQueries({ queryKey: pieceAssetsQueryKey(pieceBackendId) });
      useAppStore.getState().showToast('Photo removed', 'success');
    },
    onError: (err, { assetId }) => {
      if (__DEV__) console.warn(`[pieces:asset:delete] FAILED for asset ${assetId}:`, err);
      useAppStore.getState().showToast('Could not remove photo', 'error');
    },
  });
}

export interface UploadPieceAssetOptions {
  pieceBackendId: string;
  file: { uri: string; name: string; type: string };
  stage?: string;
  description?: string;
}

export function useUploadPieceAssetMutation() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pieceBackendId, file, stage, description }: UploadPieceAssetOptions) => {
      if (!sessionToken) throw new Error('Not signed in');
      const apiStatus: ApiPieceStatus | undefined = stage
        ? (LOCAL_STAGE_TO_API[stage] ?? undefined)
        : undefined;
      return apiUploadPieceAsset(sessionToken, pieceBackendId, file, apiStatus, description);
    },
    onSuccess: (_, { pieceBackendId }) => {
      void queryClient.invalidateQueries({ queryKey: pieceAssetsQueryKey(pieceBackendId) });
      useAppStore.getState().showToast('Photo uploaded', 'success');
    },
    onError: () => {
      useAppStore.getState().showToast('Could not upload photo', 'error');
    },
  });
}

export interface UpdatePieceAssetOptions {
  pieceBackendId: string;
  assetId: string;
  payload: UpdateAssetPayload;
}

export function useUpdatePieceAssetMutation() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pieceBackendId, assetId, payload }: UpdatePieceAssetOptions) => {
      if (!sessionToken) throw new Error('Not signed in');
      return apiUpdatePieceAsset(sessionToken, pieceBackendId, assetId, payload);
    },
    onSuccess: (_, { pieceBackendId }) => {
      void queryClient.invalidateQueries({ queryKey: pieceAssetsQueryKey(pieceBackendId) });
    },
  });
}
