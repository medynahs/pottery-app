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
import type { Piece, PiecePhoto, TimelineEntry } from '@/src/types/pieces';
import { useIsFetching, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { canSyncPiecePhotoToCloud, isLocalMediaUri } from '@/src/utils/cloudStorage';
import {
  scheduleAllPendingPiecePhotoSync,
} from '@/src/utils/pieceAssetSync';
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
  pieceGlazeFieldsForApi,
  pieceGlazeFieldsSynced,
  resolveLocalGlazeIdFromBackend,
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

type BackendPhotoRef = { assetId?: string; uri?: string };

/**
 * The backend `timeline` JSON stores photos as stable `{ assetId }` refs, never
 * device-local uris. Photos still pending upload (no assetId) are omitted until
 * their upload fills the id and the piece re-syncs.
 */
function timelineForBackend(timeline: TimelineEntry[]): unknown[] {
  return timeline.map((entry) => ({
    ...entry,
    photos: (entry.photos ?? [])
      .filter((photo) => photo.assetId)
      .map((photo) => ({ assetId: photo.assetId })),
  }));
}

/**
 * Merge the backend timeline (photos as `{ assetId }` refs) into the local one:
 * recover each device's own local file by assetId, and keep local-only photos
 * that are still pending upload. Photos with no local file yet get an empty uri
 * and are filled in later by the asset hydrate/download pass.
 */
function mergeTimeline(
  backend: TimelineEntry[] | undefined,
  existing: TimelineEntry[] | undefined,
): TimelineEntry[] {
  if (!backend?.length) return existing ?? [];
  const local = existing ?? [];

  const localUriByAssetId = new Map<string, string>();
  for (const entry of local) {
    for (const photo of entry.photos ?? []) {
      if (photo.assetId && isLocalMediaUri(photo.uri)) {
        localUriByAssetId.set(photo.assetId, photo.uri);
      }
    }
  }

  const merged = backend.map((entry, i) => {
    const refs = ((entry as { photos?: BackendPhotoRef[] }).photos ?? [])
      .filter((ref) => ref.assetId)
      .map<PiecePhoto>((ref) => ({
        assetId: ref.assetId,
        uri: localUriByAssetId.get(ref.assetId!) ?? '',
      }));
    const pending = (local[i]?.photos ?? []).filter((photo) => !photo.assetId);
    return { ...entry, photos: [...refs, ...pending] };
  });

  // Keep locally-added entries the backend hasn't caught up with yet.
  return local.length > backend.length ? [...merged, ...local.slice(backend.length)] : merged;
}

function buildPieceMetadata(piece: Piece): Record<string, unknown> | undefined {
  const meta: Record<string, unknown> = {};
  if (piece.clay) meta.clay = piece.clay;
  if (piece.location) meta.location = piece.location;
  if (piece.formingMethod) meta.formingMethod = piece.formingMethod;
  if (piece.form) meta.form = piece.form;
  if (piece.weight) meta.weight = piece.weight;
  if (piece.dimensions) meta.dimensions = piece.dimensions;
  if (piece.bisqueTemp) meta.bisqueTemp = piece.bisqueTemp;
  if (piece.glazeTemp) meta.glazeTemp = piece.glazeTemp;
  if (piece.firingType) meta.firingType = piece.firingType;
  if (piece.decorations) meta.decorations = piece.decorations;
  if (piece.notes) meta.notes = piece.notes;
  if (piece.heightCm != null) meta.heightCm = piece.heightCm;
  if (piece.widthCm != null) meta.widthCm = piece.widthCm;
  if (piece.volumeCm3 != null) meta.volumeCm3 = piece.volumeCm3;
  if (piece.weightGrams != null) meta.weightGrams = piece.weightGrams;
  return Object.keys(meta).length > 0 ? meta : undefined;
}

function buildPiecePricing(piece: Piece): Record<string, unknown> | undefined {
  const p: Record<string, unknown> = {};
  const add = (k: string, v: unknown) => { if (v != null) p[k] = v; };
  add('pricingUserType', piece.pricingUserType);
  add('firingFeeMode', piece.firingFeeMode);
  add('salePriceMode', piece.salePriceMode);
  add('firingFee', piece.firingFee);
  add('firingFeeQuoteRequired', piece.firingFeeQuoteRequired);
  add('workHours', piece.workHours);
  add('adminHours', piece.adminHours);
  add('workMinutes', piece.workMinutes);
  add('adminMinutes', piece.adminMinutes);
  add('costClay', piece.costClay);
  add('costGlaze', piece.costGlaze);
  add('costEnergy', piece.costEnergy);
  add('costOther', piece.costOther);
  add('costClayOverride', piece.costClayOverride);
  add('costGlazeOverride', piece.costGlazeOverride);
  add('costEnergyOverride', piece.costEnergyOverride);
  add('materialCost', piece.materialCost);
  add('laborCost', piece.laborCost);
  add('adminCost', piece.adminCost);
  add('overheadCost', piece.overheadCost);
  add('sellingFeePct', piece.sellingFeePct);
  add('taxPct', piece.taxPct);
  add('sellingFeeAmount', piece.sellingFeeAmount);
  add('taxAmount', piece.taxAmount);
  add('profitAmount', piece.profitAmount);
  add('totalCost', piece.totalCost);
  add('markupPct', piece.markupPct);
  add('suggestedPrice', piece.suggestedPrice);
  add('wholesalePrice', piece.wholesalePrice);
  add('retailPriceTarget', piece.retailPriceTarget);
  add('wholesalePriceTarget', piece.wholesalePriceTarget);
  add('soldPrice', piece.soldPrice);
  add('price', piece.price);
  return Object.keys(p).length > 0 ? p : undefined;
}

function pieceToSnapshot(piece: Piece): PieceSyncSnapshot {
  const glazes = useAppStore.getState().glazes;
  const snapshot: PieceSyncSnapshot = {
    client_ref: String(piece.id),
    name: piece.name,
    status: localStageToApiStatus(piece.stage),
    local_stage: piece.stage,
    ...pieceGlazeFieldsForApi(piece, glazes),
  };
  if (piece.description) snapshot.description = piece.description;
  if (piece.deleted) snapshot.deleted = true;
  if (piece.status) snapshot.outcome_status = piece.status;
  if (piece.timeline?.length) snapshot.timeline = timelineForBackend(piece.timeline);
  const meta = buildPieceMetadata(piece);
  if (meta) snapshot.metadata = meta;
  if (piece.epitaph) snapshot.epitaph = piece.epitaph;
  if (piece.causeOfDeath) snapshot.cause_of_death = piece.causeOfDeath;
  if (piece.batchId) snapshot.batch_client_ref = piece.batchId;
  if (piece.batchSize != null) snapshot.batch_size = piece.batchSize;
  const pricing = buildPiecePricing(piece);
  if (pricing) snapshot.pricing = pricing;
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
  const glazes = useAppStore.getState().glazes;
  const collapsedStage = API_TO_LOCAL_STAGE[bp.status] ?? bp.status;
  const stage = bp.local_stage ?? collapsedStage;
  const parsedId = bp.client_ref ? Number(bp.client_ref) : NaN;
  const localId = existing?.id ?? (!Number.isNaN(parsedId) ? parsedId : Date.now() + Math.floor(Math.random() * 1_000));

  const meta = bp.metadata ?? undefined;
  const base: Piece = existing ?? {
    id: localId,
    name: bp.name,
    stage,
    createdAt: bp.created_at,
    updatedAt: bp.updated_at,
    timeline: [{ stage, timestamp: bp.created_at }],
    clay: (meta?.clay as string | undefined) ?? '',
  };

  const glazeId =
    bp.glaze_id !== undefined
      ? resolveLocalGlazeIdFromBackend(bp.glaze_id, glazes)
      : existing?.glazeId;
  const glazeOutcome =
    bp.glaze_outcome !== undefined
      ? (bp.glaze_outcome ?? undefined)
      : existing?.glazeOutcome;

  const pricing = bp.pricing ?? undefined;

  return {
    ...base,
    ...((pricing as object | undefined) ?? {}),
    backendId: bp.id,
    name: bp.name,
    stage,
    description: bp.description ?? undefined,
    status: bp.outcome_status ?? existing?.status ?? undefined,
    visibility: bp.visibility ?? existing?.visibility,
    timeline: mergeTimeline(bp.timeline as TimelineEntry[] | undefined, existing?.timeline),
    clay: (meta?.clay as string | undefined) ?? existing?.clay ?? '',
    location: (meta?.location as string | undefined) ?? existing?.location,
    formingMethod: (meta?.formingMethod as string | undefined) ?? existing?.formingMethod,
    form: (meta?.form as string | undefined) ?? existing?.form,
    weight: (meta?.weight as string | undefined) ?? existing?.weight,
    dimensions: (meta?.dimensions as string | undefined) ?? existing?.dimensions,
    bisqueTemp: (meta?.bisqueTemp as string | undefined) ?? existing?.bisqueTemp,
    glazeTemp: (meta?.glazeTemp as string | undefined) ?? existing?.glazeTemp,
    firingType: (meta?.firingType as string | undefined) ?? existing?.firingType,
    decorations: (meta?.decorations as string | undefined) ?? existing?.decorations,
    notes: (meta?.notes as string | undefined) ?? existing?.notes,
    heightCm: (meta?.heightCm as number | undefined) ?? existing?.heightCm,
    widthCm: (meta?.widthCm as number | undefined) ?? existing?.widthCm,
    volumeCm3: (meta?.volumeCm3 as number | undefined) ?? existing?.volumeCm3,
    weightGrams: (meta?.weightGrams as number | undefined) ?? existing?.weightGrams,
    epitaph: bp.epitaph ?? existing?.epitaph ?? undefined,
    causeOfDeath: bp.cause_of_death ?? existing?.causeOfDeath ?? undefined,
    batchId: bp.batch_client_ref ?? existing?.batchId ?? undefined,
    batchSize: bp.batch_size ?? existing?.batchSize ?? undefined,
    updatedAt: bp.updated_at,
    glazeId,
    glazeOutcome,
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

    const glazes = useAppStore.getState().glazes;
    const stageSynced = backendPiece.local_stage
      ? backendPiece.local_stage === piece.stage
      : apiStatusMatchesLocalStage(piece.stage, backendPiece.status);
    const glazeSynced = pieceGlazeFieldsSynced(piece, backendPiece, glazes);

    if (stageSynced && glazeSynced) {
      return {
        ...piece,
        syncDirty: false,
        updatedAt: backendPiece.updated_at,
      };
    }

    // Server response still reflects older data, keep local edits and retry sync.
    return piece;
  });
}

function applyBackendAckToLocalPiece(localId: number, backendPiece: BackendPiece): void {
  const glazes = useAppStore.getState().glazes;
  setPiecesIfChanged(
    useAppStore.getState().pieces.map((piece) => {
      if (piece.id !== localId) return piece;

      const glazeId =
        backendPiece.glaze_id !== undefined
          ? resolveLocalGlazeIdFromBackend(backendPiece.glaze_id, glazes)
          : piece.glazeId;
      const glazeOutcome =
        backendPiece.glaze_outcome !== undefined
          ? (backendPiece.glaze_outcome ?? undefined)
          : piece.glazeOutcome;

      const next = {
        ...piece,
        backendId: backendPiece.id,
        updatedAt: backendPiece.updated_at,
        glazeId,
        glazeOutcome,
      };

      const stageSynced = backendPiece.local_stage
        ? backendPiece.local_stage === piece.stage
        : apiStatusMatchesLocalStage(piece.stage, backendPiece.status);
      if (stageSynced && pieceGlazeFieldsSynced(piece, backendPiece, glazes)) {
        return { ...next, syncDirty: false };
      }

      return next;
    }),
  );
}

async function pushDirtyBackendPiece(
  piece: Piece,
): Promise<'updated' | 'deleted' | 'failed'> {
  if (!piece.backendId) return 'failed';

  try {
    if (piece.deleted) {
      await apiDeletePiece(piece.backendId);
      setPiecesIfChanged(useAppStore.getState().pieces.filter((p) => p.id !== piece.id));
      return 'deleted';
    }

    const glazes = useAppStore.getState().glazes;
    const meta = buildPieceMetadata(piece);
    const pricing = buildPiecePricing(piece);
    const backendPiece = await apiUpdatePiece(piece.backendId, {
      name: piece.name,
      status: localStageToApiStatus(piece.stage),
      local_stage: piece.stage,
      description: piece.description,
      outcome_status: piece.status,
      timeline: piece.timeline?.length ? timelineForBackend(piece.timeline) : undefined,
      metadata: meta,
      epitaph: piece.epitaph,
      cause_of_death: piece.causeOfDeath,
      batch_client_ref: piece.batchId,
      batch_size: piece.batchSize,
      pricing,
      ...pieceGlazeFieldsForApi(piece, glazes),
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

  const { pieces, setIsSyncing, setLastSyncedAt, isSignedIn } =
    useAppStore.getState();
  if (!isSignedIn) return false;

  const toSync = piecesNeedingSync(pieces);
  if (toSync.length === 0) return true;

  syncInFlight = true;
  setIsSyncing(true);

  try {
    const backendLinked = toSync.filter((piece) => piece.backendId);
    const needsBulkSync = toSync.filter((piece) => !piece.backendId);

    for (const piece of backendLinked) {
      const result = await pushDirtyBackendPiece(piece);
      if (result === 'failed') {
        useAppStore.getState().showToast('Could not sync piece changes', 'error');
        return false;
      }
    }

    if (needsBulkSync.length > 0) {
      const snapshots = needsBulkSync.slice(0, MAX_SYNC_BATCH).map(pieceToSnapshot);
      if (__DEV__) console.log(`[pieces:sync] bulk pushing ${snapshots.length} snapshot(s)`);

      const response = await apiSyncPieces({ pieces: snapshots });
      setPiecesIfChanged(applySyncResponse(useAppStore.getState().pieces, response));
    }

    setLastSyncedAt(new Date().toISOString());

    scheduleAllPendingPiecePhotoSync();

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
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  
  const prevUserId = useRef('me');

  useEffect(() => {
    if (false) {
      prevUserId.current = 'me';
      initialPullMerged = false;
      lastMergedAt = 0;
    }
  }, ['me']);

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
    const { pieces } = useAppStore.getState();
    mergePiecesIntoStore(query.data, pieces);

    void scheduleAllPendingPiecePhotoSync();

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
  }, [queryClient, 'me']);

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
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pieceBackendId, assetId }: DeletePieceAssetOptions) => {
      if (!isSignedIn) throw new Error('Not signed in');
      if (__DEV__) console.log(`[pieces:asset:delete] DELETE asset ${assetId} on piece ${pieceBackendId}`);
      await apiDeletePieceAsset(pieceBackendId, assetId);
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
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pieceBackendId, file, stage, description }: UploadPieceAssetOptions) => {
      if (!isSignedIn) throw new Error('Not signed in');
      const piece = useAppStore.getState().pieces.find((p) => p.backendId === pieceBackendId);
      if (piece && !canSyncPiecePhotoToCloud(piece, false)) {
        throw new Error('Cloud backup limit reached');
      }
      const apiStatus: ApiPieceStatus | undefined = stage
        ? (LOCAL_STAGE_TO_API[stage] ?? undefined)
        : undefined;
      return apiUploadPieceAsset(pieceBackendId, file, apiStatus, description);
    },
    onSuccess: (_, { pieceBackendId }) => {
      void queryClient.invalidateQueries({ queryKey: pieceAssetsQueryKey(pieceBackendId) });
      useAppStore.getState().showToast('Photo uploaded', 'success');
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('Cloud backup limit')) {
        useAppStore.getState().showToast('Photo saved on device · Premium backs up to the cloud', 'success');
        return;
      }
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
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pieceBackendId, assetId, payload }: UpdatePieceAssetOptions) => {
      if (!isSignedIn) throw new Error('Not signed in');
      return apiUpdatePieceAsset(pieceBackendId, assetId, payload);
    },
    onSuccess: (_, { pieceBackendId }) => {
      void queryClient.invalidateQueries({ queryKey: pieceAssetsQueryKey(pieceBackendId) });
    },
  });
}
