// Pieces API, /users/me/pieces
// All endpoints require a SuperTokens session (auth header injected by the RN SDK).

import type { PieceVisibility } from '../types/pieces';
import { API_BASE_URL as API_BASE } from './index';

// ─── Backend types ────────────────────────────────────────────────────────────

/** Lifecycle status values accepted / returned by the backend. */
export type ApiPieceStatus =
  | 'idea'
  | 'forming'
  | 'drying'
  | 'bisque'
  | 'glazing'
  | 'glaze_firing'
  | 'done'
  | 'cemetery';

export type ApiGlazeOutcome = 'success' | 'crawling' | 'underfired' | 'crack';

export interface BackendPiece {
  id: string;           // UUID
  user_id: string;
  name: string;
  description: string | null;
  status: ApiPieceStatus;
  created_at: string;
  updated_at: string;
  client_ref?: string;
  is_deleted?: boolean;
  visibility?: PieceVisibility;
  glaze_id?: string | null;
  glaze_outcome?: ApiGlazeOutcome | null;
  local_stage?: string | null;
  timeline?: unknown[] | null;
  outcome_status?: string | null;
  metadata?: Record<string, unknown> | null;
  epitaph?: string | null;
  cause_of_death?: string | null;
  batch_client_ref?: string | null;
  batch_size?: number | null;
  pricing?: Record<string, unknown> | null;
}

/** Snapshot sent to POST /users/me/pieces/sync, identity is client_ref only. */
export interface PieceSyncSnapshot {
  client_ref: string;
  name: string;
  status?: ApiPieceStatus;
  description?: string;
  deleted?: boolean;
  glaze_id?: string | null;
  glaze_outcome?: ApiGlazeOutcome | null;
  local_stage?: string;
  timeline?: unknown[];
  outcome_status?: string;
  metadata?: Record<string, unknown>;
  epitaph?: string;
  cause_of_death?: string;
  batch_client_ref?: string;
  batch_size?: number;
  pricing?: Record<string, unknown>;
}

export interface SyncPiecesRequest {
  pieces: PieceSyncSnapshot[];
}

export interface SyncPiecesResponse {
  pieces: BackendPiece[];
  client_ref_map: Record<string, string>;
}

export interface BackendPieceAsset {
  id: string;           // UUID
  piece_id: string;
  /** Stable, content-versioned storage key. Cache/dedup on this, not on url. */
  object_key: string;
  /** Resolved link for this viewer: stable public URL, or a short-lived presigned URL
   *  for private/friends. Transient, a one-shot download ticket, never persist it. */
  url: string;
  status: ApiPieceStatus | null;
  local_stage?: string | null;
  description: string | null;
  created_at: string;
}

// ─── Request payloads ────────────────────────────────────────────────────────

export interface CreatePiecePayload {
  name: string;
  description?: string;
  status: ApiPieceStatus;
}

export interface UpdatePiecePayload {
  name?: string;
  description?: string;
  status?: ApiPieceStatus;
  glaze_id?: string | null;
  glaze_outcome?: ApiGlazeOutcome | null;
  local_stage?: string;
  timeline?: unknown[];
  outcome_status?: string;
  metadata?: Record<string, unknown>;
  epitaph?: string;
  cause_of_death?: string;
  batch_client_ref?: string;
  batch_size?: number;
  pricing?: Record<string, unknown>;
}

export interface UpdateAssetPayload {
  status?: ApiPieceStatus;
  local_stage?: string;
  description?: string;
  /** If provided, the asset image is replaced. */
  file?: { uri: string; name: string; type: string };
}

/** Maps a local glaze atlas id to the backend UUID for piece sync payloads. */
export function resolvePieceGlazeBackendId(
  localGlazeId: string | undefined,
  glazes: ReadonlyArray<{ id: string; backendId?: string }>,
): string | null | undefined {
  if (!localGlazeId?.trim()) return null;
  return glazes.find((g) => g.id === localGlazeId)?.backendId;
}

/** Build glaze link fields for piece sync / PUT payloads. */
export function pieceGlazeFieldsForApi(
  piece: { glazeId?: string; glazeOutcome?: ApiGlazeOutcome },
  glazes: ReadonlyArray<{ id: string; backendId?: string }>,
): Pick<UpdatePiecePayload, 'glaze_id' | 'glaze_outcome'> {
  if (!piece.glazeId?.trim()) {
    return {
      glaze_id: null,
      glaze_outcome: piece.glazeOutcome ?? null,
    };
  }
  const backendGlazeId = resolvePieceGlazeBackendId(piece.glazeId, glazes);
  if (!backendGlazeId) return {};
  return {
    glaze_id: backendGlazeId,
    glaze_outcome: piece.glazeOutcome ?? null,
  };
}

/** True when the server piece row reflects the local glaze link we intended to push. */
export function pieceGlazeFieldsSynced(
  piece: { glazeId?: string; glazeOutcome?: ApiGlazeOutcome },
  backendPiece: BackendPiece,
  glazes: ReadonlyArray<{ id: string; backendId?: string }>,
): boolean {
  const expected = pieceGlazeFieldsForApi(piece, glazes);
  if (piece.glazeId?.trim() && expected.glaze_id === undefined) {
    return false;
  }
  if (expected.glaze_id !== undefined) {
    return (
      expected.glaze_id === (backendPiece.glaze_id ?? null)
      && (expected.glaze_outcome ?? null) === (backendPiece.glaze_outcome ?? null)
    );
  }
  if (!piece.glazeId?.trim()) {
    return backendPiece.glaze_id == null;
  }
  return true;
}

/** Resolve backend glaze UUID to local atlas id when merging server pieces. */
export function resolveLocalGlazeIdFromBackend(
  backendGlazeId: string | null | undefined,
  glazes: ReadonlyArray<{ id: string; backendId?: string }>,
): string | undefined {
  if (!backendGlazeId) return undefined;
  return glazes.find((g) => g.backendId === backendGlazeId)?.id;
}

/**
 * Maps local stage IDs (which can be more granular) to the backend's status
 * vocabulary. Unmapped stages (e.g. leather-hard, bone-dry) are collapsed to
 * the closest API equivalent.
 */
export const LOCAL_STAGE_TO_API: Record<string, ApiPieceStatus> = {
  idea: 'idea',
  forming: 'forming',
  'leather-hard': 'forming',
  trimming: 'forming',
  drying: 'drying',
  'bone-dry': 'drying',
  bisque: 'bisque',
  glazing: 'glazing',
  'glaze-fired': 'glaze_firing',
  finished: 'done',
  cemetery: 'cemetery',
};

/** Maps backend status values back to local stage IDs. */
export const API_TO_LOCAL_STAGE: Record<ApiPieceStatus, string> = {
  idea: 'idea',
  forming: 'forming',
  drying: 'drying',
  bisque: 'bisque',
  glazing: 'glazing',
  glaze_firing: 'glaze-fired',
  done: 'finished',
  cemetery: 'cemetery',
};

// ─── Internal helper ─────────────────────────────────────────────────────────

async function authedFetch(url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

// ─── Piece CRUD ───────────────────────────────────────────────────────────────

/** GET /users/me/pieces, list all pieces for the authenticated user. */
export async function apiListPieces(
    ): Promise<BackendPiece[]> {
  const res = await authedFetch(`${API_BASE}/users/me/pieces`);
  if (!res.ok) throw new Error(`listPieces failed (${res.status})`);
  return res.json() as Promise<BackendPiece[]>;
}

/**
 * POST /users/me/pieces/sync, push local snapshots; server returns the
 * authoritative alive list plus a client_ref → backend id map.
 */
export async function apiSyncPieces(
    payload: SyncPiecesRequest,
): Promise<SyncPiecesResponse> {
  const res = await authedFetch(`${API_BASE}/users/me/pieces/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`syncPieces failed (${res.status})`);
  return res.json() as Promise<SyncPiecesResponse>;
}

/** DELETE /users/me/pieces/{piece_id}, permanently remove a piece. */
export async function apiDeletePiece(
    pieceId: string,
): Promise<void> {
  const res = await authedFetch(`${API_BASE}/users/me/pieces/${pieceId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`deletePiece failed (${res.status})`);
}

/** POST /users/me/pieces, create a new piece.  */
export async function apiCreatePiece(
    payload: CreatePiecePayload,
): Promise<BackendPiece> {
  const res = await authedFetch(`${API_BASE}/users/me/pieces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createPiece failed (${res.status})`);
  return res.json() as Promise<BackendPiece>;
}

/** PUT /users/me/pieces/{piece_id}, update name, description or status. */
export async function apiUpdatePiece(
    pieceId: string,
  payload: UpdatePiecePayload,
): Promise<BackendPiece> {
  const res = await authedFetch(`${API_BASE}/users/me/pieces/${pieceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`updatePiece failed (${res.status})`);
  return res.json() as Promise<BackendPiece>;
}

/**
 * PUT /users/me/pieces/{piece_id}/visibility, change a piece's sharing scope. The server
 * reconciles the public-bucket mirror (publish/revoke) before committing, so this needs
 * connectivity, it is not part of the offline sync.
 */
export async function apiSetPieceVisibility(
    pieceId: string,
  visibility: PieceVisibility,
): Promise<BackendPiece> {
  const res = await authedFetch(`${API_BASE}/users/me/pieces/${pieceId}/visibility`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visibility }),
  });
  if (!res.ok) throw new Error(`setPieceVisibility failed (${res.status})`);
  return res.json() as Promise<BackendPiece>;
}

// ─── Piece assets ─────────────────────────────────────────────────────────────

/** GET /users/me/pieces/{piece_id}/assets, list all assets for a piece. */
export async function apiListPieceAssets(
    pieceId: string,
): Promise<BackendPieceAsset[]> {
  const res = await authedFetch(
    `${API_BASE}/users/me/pieces/${pieceId}/assets`,
  );
  if (!res.ok) throw new Error(`listPieceAssets failed (${res.status})`);
  return res.json() as Promise<BackendPieceAsset[]>;
}

/**
 * POST /users/me/pieces/{piece_id}, upload an image asset for a piece stage.
 * The file must be a local URI (e.g. from expo-image-picker).
 */
export async function apiUploadPieceAsset(
    pieceId: string,
  file: { uri: string; name: string; type: string },
  status?: ApiPieceStatus,
  localStage?: string,
  description?: string,
): Promise<BackendPieceAsset> {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  if (status) form.append('status', status);
  if (localStage) form.append('local_stage', localStage);
  if (description) form.append('description', description);

  const res = await authedFetch(`${API_BASE}/users/me/pieces/${pieceId}/assets`, {
    method: 'POST',
    // Do NOT set Content-Type, let fetch inject the multipart boundary.
    body: form as unknown as BodyInit_,
  });
  if (!res.ok) throw new Error(`uploadPieceAsset failed (${res.status})`);
  return res.json() as Promise<BackendPieceAsset>;
}

/** DELETE /users/me/pieces/{piece_id}/assets/{asset_id}, permanently remove an asset. */
export async function apiDeletePieceAsset(
    pieceId: string,
  assetId: string,
): Promise<void> {
  const res = await authedFetch(
    `${API_BASE}/users/me/pieces/${pieceId}/assets/${assetId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error(`deletePieceAsset failed (${res.status})`);
}

/**
 * PUT /users/me/pieces/{piece_id}/assets/{asset_id}, update status,
 * description, and/or replace the image for an asset.
 */
export async function apiUpdatePieceAsset(
    pieceId: string,
  assetId: string,
  payload: UpdateAssetPayload,
): Promise<BackendPieceAsset> {
  if (payload.file) {
    // File replacement, must use multipart FormData
    const form = new FormData();
    form.append('file', {
      uri: payload.file.uri,
      name: payload.file.name,
      type: payload.file.type,
    } as unknown as Blob);
    if (payload.status) form.append('status', payload.status);
    if (payload.local_stage) form.append('local_stage', payload.local_stage);
    if (payload.description) form.append('description', payload.description);

    const res = await authedFetch(
    `${API_BASE}/users/me/pieces/${pieceId}/assets/${assetId}`,
      { method: 'PUT', body: form as unknown as BodyInit_ },
    );
    if (!res.ok) throw new Error(`updatePieceAsset failed (${res.status})`);
    return res.json() as Promise<BackendPieceAsset>;
  }

  // Metadata-only update, JSON body
  const jsonPayload: { status?: ApiPieceStatus; local_stage?: string; description?: string } = {};
  if (payload.status) jsonPayload.status = payload.status;
  if (payload.local_stage) jsonPayload.local_stage = payload.local_stage;
  if (payload.description !== undefined) jsonPayload.description = payload.description;

  const res = await authedFetch(
    `${API_BASE}/users/me/pieces/${pieceId}/assets/${assetId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonPayload),
    },
  );
  if (!res.ok) throw new Error(`updatePieceAsset failed (${res.status})`);
  return res.json() as Promise<BackendPieceAsset>;
}
