/**
 * usePiecesSync — React Query hooks that bridge the backend /users/me/pieces
 * endpoints with the local Zustand store.
 *
 * Responsibilities:
 *   - Fetch the user's pieces from the backend on mount (when signed in).
 *   - Merge backend pieces into the store (using backendId as the key).
 *   - Expose typed mutations for create, update, and asset operations that
 *     optimistically update the store and then sync to the API.
 */

import { useAppStore } from '@/src/store';
import type { Piece } from '@/src/types/pieces';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  API_TO_LOCAL_STAGE,
  LOCAL_STAGE_TO_API,
  apiCreatePiece,
  apiDeletePiece,
  apiListPieces,
  apiUpdatePiece,
  apiUpdatePieceAsset,
  apiUploadPieceAsset,
  type ApiPieceStatus,
  type BackendPiece,
  type CreatePiecePayload,
  type UpdateAssetPayload,
} from '../../../services/pieces';

// ─── Query keys ───────────────────────────────────────────────────────────────

/** Base key — used for prefix invalidation (matches all user-scoped entries). */
export const PIECES_QUERY_KEY = ['pieces'] as const;
/** Scoped key — unique per user so different accounts never share a cache entry. */
export const piecesQueryKey = (userId: string) =>
  [...PIECES_QUERY_KEY, userId] as const;
export const pieceAssetsQueryKey = (pieceId: string) =>
  ['piece-assets', pieceId] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a backend piece into the minimal fields needed to upsert into the
 * local store. We do not overwrite rich local-only fields (clay, formingMethod,
 * etc.) — those are preserved from the existing local record if one exists.
 */
function backendToLocalPatch(
  bp: BackendPiece,
  existing?: Piece,
): Piece {
  const base: Piece = existing ?? {
    id: Date.now() + Math.floor(Math.random() * 1_000),
    name: bp.name,
    stage: API_TO_LOCAL_STAGE[bp.status] ?? bp.status,
    createdAt: bp.created_at,
    updatedAt: bp.updated_at,
    timeline: [{ stage: API_TO_LOCAL_STAGE[bp.status] ?? bp.status, timestamp: bp.created_at }],
    clay: '',
  };

  return {
    ...base,
    backendId: bp.id,
    name: bp.name,
    stage: API_TO_LOCAL_STAGE[bp.status] ?? bp.status,
    description: bp.description ?? undefined,
    updatedAt: bp.updated_at,
  };
}

/**
 * Merge backend pieces into the local store.
 * - If a local piece already has a matching `backendId`, update it in place.
 * - If no match, prepend a new local record.
 */
function mergePiecesIntoStore(
  backendPieces: BackendPiece[],
  localPieces: Piece[],
  setPieces: (pieces: Piece[]) => void,
) {
  const byBackendId = new Map(
    localPieces.filter(p => p.backendId).map(p => [p.backendId!, p]),
  );

  const updatedByBackendId = new Map<string, Piece>();
  const newPieces: Piece[] = [];

  for (const bp of backendPieces) {
    const existing = byBackendId.get(bp.id);
    const merged = backendToLocalPatch(bp, existing);
    if (existing) {
      updatedByBackendId.set(bp.id, merged);
    } else {
      newPieces.push(merged);
    }
  }

  const retained = localPieces.map(p =>
    p.backendId ? (updatedByBackendId.get(p.backendId) ?? p) : p,
  );

  setPieces([...newPieces, ...retained]);
}

// ─── Main hook ────────────────────────────────────────────────────────────────

/**
 * Loads pieces from the backend whenever the user is authenticated.
 * The result is merged into the Zustand store so all existing UI continues
 * to work without changes.
 */
export function usePiecesSync() {
  const sessionToken = useAppStore(s => s.sessionToken);
  const oryIdentityId = useAppStore(s => s.oryIdentityId);

  useEffect(() => {
    if (__DEV__) console.log('[pieces:sync] sessionToken present:', !!sessionToken);
  }, [sessionToken]);

  const query = useQuery({
    queryKey: piecesQueryKey(oryIdentityId ?? ''),
    queryFn: () => apiListPieces(sessionToken!),
    enabled: !!sessionToken && !!oryIdentityId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (!query.data) return;
    if (__DEV__) console.log(`[pieces:sync] fetched ${query.data.length} piece(s) from backend`);
    const { pieces, setPieces } = useAppStore.getState();
    mergePiecesIntoStore(query.data, pieces, setPieces);
  }, [query.data]);

  return query;
}

// ─── Create mutation ─────────────────────────────────────────────────────────

export interface CreatePieceOptions {
  /** local piece that was already added optimistically via addPieces */
  localPiece: Piece;
}

/**
 * After calling `store.addPieces([localPiece])` optimistically, call this
 * mutation to persist to the backend and stamp the returned UUID as backendId.
 */
export function useCreatePieceMutation() {
  const sessionToken = useAppStore(s => s.sessionToken);
  const updatePiece = useAppStore(s => s.updatePiece);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      localPiece,
    }: CreatePieceOptions) => {
      if (!sessionToken) throw new Error('Not signed in');

      const apiStatus: ApiPieceStatus =
        LOCAL_STAGE_TO_API[localPiece.stage] ?? 'idea';

      const payload: CreatePiecePayload = {
        name: localPiece.name,
        status: apiStatus,
        ...(localPiece.description ? { description: localPiece.description } : {}),
      };

      const bp = await apiCreatePiece(sessionToken, payload);
      return { bp, localPiece };
    },
    onSuccess: ({ bp, localPiece }) => {
      if (__DEV__) console.log(`[pieces:create] "${localPiece.name}" → backendId ${bp.id}`);
      // Read the latest version of the piece from the store — the user may have
      // edited it while the create request was in flight, so we must not clobber
      // those changes with the stale localPiece snapshot.
      const latest = useAppStore.getState().pieces.find(p => p.id === localPiece.id);
      if (latest) updatePiece({ ...latest, backendId: bp.id });
      void queryClient.invalidateQueries({ queryKey: PIECES_QUERY_KEY });
    },
    onError: (err, { localPiece }) => {
      if (__DEV__) {
        console.warn(
          `[pieces:create] FAILED for "${localPiece.name}":`,
          err,
        );
      }
    },
  });
}

// ─── Update mutation ─────────────────────────────────────────────────────────

/**
 * Syncs a locally-updated piece to the backend.
 * The store should already be updated optimistically before calling this.
 */
export function useUpdatePieceMutation() {
  const sessionToken = useAppStore(s => s.sessionToken);

  return useMutation({
    mutationFn: async (piece: Piece) => {
      if (!sessionToken) throw new Error('Not signed in');
      if (!piece.backendId) {
        if (__DEV__) console.log(`[pieces:update] "${piece.name}" skipped (no backendId yet)`);
        return;
      }
      if (__DEV__) console.log(`[pieces:update] PUT ${piece.backendId} — stage: ${piece.stage}`);

      const apiStatus: ApiPieceStatus =
        LOCAL_STAGE_TO_API[piece.stage] ?? 'idea';

      await apiUpdatePiece(sessionToken, piece.backendId, {
        name: piece.name,
        status: apiStatus,
        ...(piece.description !== undefined ? { description: piece.description } : {}),
      });
    },
    // No invalidation here — the store is already up to date from the optimistic
    // update in usePiecesScreen, so triggering a refetch would just re-merge
    // unchanged data.
    onError: (err, piece) => {
      if (__DEV__) {
        console.warn(
          `[pieces:update] FAILED for "${piece.name}":`,
          err,
        );
      }
    },
  });
}

// ─── Delete mutation ─────────────────────────────────────────────────────────

/**
 * Deletes a piece on the backend. The store should already have the piece
 * removed optimistically before this is called.
 */
export function useDeletePieceMutation() {
  const sessionToken = useAppStore(s => s.sessionToken);

  return useMutation({
    mutationFn: async (piece: Piece) => {
      if (!sessionToken) throw new Error('Not signed in');
      if (!piece.backendId) {
        if (__DEV__) console.log(`[pieces:delete] "${piece.name}" skipped (no backendId — local only)`);
        return;
      }
      if (__DEV__) console.log(`[pieces:delete] DELETE ${piece.backendId}`);
      await apiDeletePiece(sessionToken, piece.backendId);
    },
    onError: (err, piece) => {
      if (__DEV__) {
        console.warn(
          `[pieces:delete] FAILED for "${piece.name}":`,
          err,
        );
      }
    },
  });
}

// ─── Asset upload mutation ────────────────────────────────────────────────────

export interface UploadPieceAssetOptions {
  pieceBackendId: string;
  file: { uri: string; name: string; type: string };
  stage?: string;
  description?: string;
}

export function useUploadPieceAssetMutation() {
  const sessionToken = useAppStore(s => s.sessionToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pieceBackendId,
      file,
      stage,
      description,
    }: UploadPieceAssetOptions) => {
      if (!sessionToken) throw new Error('Not signed in');

      const apiStatus: ApiPieceStatus | undefined = stage
        ? (LOCAL_STAGE_TO_API[stage] ?? undefined)
        : undefined;

      return apiUploadPieceAsset(
        sessionToken,
        pieceBackendId,
        file,
        apiStatus,
        description,
      );
    },
    onSuccess: (_, { pieceBackendId }) => {
      void queryClient.invalidateQueries({
        queryKey: pieceAssetsQueryKey(pieceBackendId),
      });
    },
  });
}

// ─── Asset update mutation ────────────────────────────────────────────────────

export interface UpdatePieceAssetOptions {
  pieceBackendId: string;
  assetId: string;
  payload: UpdateAssetPayload;
}

export function useUpdatePieceAssetMutation() {
  const sessionToken = useAppStore(s => s.sessionToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pieceBackendId,
      assetId,
      payload,
    }: UpdatePieceAssetOptions) => {
      if (!sessionToken) throw new Error('Not signed in');
      return apiUpdatePieceAsset(sessionToken, pieceBackendId, assetId, payload);
    },
    onSuccess: (_, { pieceBackendId }) => {
      void queryClient.invalidateQueries({
        queryKey: pieceAssetsQueryKey(pieceBackendId),
      });
    },
  });
}
