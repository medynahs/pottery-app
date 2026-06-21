// Pieces API, /users/me/pieces
// All endpoints require an X-Session-Token header from Ory Kratos.

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
}

/** Snapshot sent to POST /users/me/pieces/sync, identity is client_ref only. */
export interface PieceSyncSnapshot {
  client_ref: string;
  name: string;
  status?: ApiPieceStatus;
  description?: string;
  deleted?: boolean;
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
  path: string;
  url: string;
  status: ApiPieceStatus | null;
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
}

export interface UpdateAssetPayload {
  status?: ApiPieceStatus;
  description?: string;
  /** If provided, the asset image is replaced. */
  file?: { uri: string; name: string; type: string };
}

// ─── Stage mapping ────────────────────────────────────────────────────────────

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

async function authedFetch(
  sessionToken: string,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
      'X-Session-Token': sessionToken,
      ...(init?.headers ?? {}),
    },
  });
}

// ─── Piece CRUD ───────────────────────────────────────────────────────────────

/** GET /users/me/pieces, list all pieces for the authenticated user. */
export async function apiListPieces(sessionToken: string): Promise<BackendPiece[]> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/pieces`);
  if (!res.ok) throw new Error(`listPieces failed (${res.status})`);
  return res.json() as Promise<BackendPiece[]>;
}

/**
 * POST /users/me/pieces/sync, push local snapshots; server returns the
 * authoritative alive list plus a client_ref → backend id map.
 */
export async function apiSyncPieces(
  sessionToken: string,
  payload: SyncPiecesRequest,
): Promise<SyncPiecesResponse> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/pieces/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`syncPieces failed (${res.status})`);
  return res.json() as Promise<SyncPiecesResponse>;
}

/** DELETE /users/me/pieces/{piece_id}, permanently remove a piece. */
export async function apiDeletePiece(
  sessionToken: string,
  pieceId: string,
): Promise<void> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/pieces/${pieceId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`deletePiece failed (${res.status})`);
}

/** POST /users/me/pieces, create a new piece.  */
export async function apiCreatePiece(
  sessionToken: string,
  payload: CreatePiecePayload,
): Promise<BackendPiece> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/pieces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createPiece failed (${res.status})`);
  return res.json() as Promise<BackendPiece>;
}

/** PUT /users/me/pieces/{piece_id}, update name, description or status. */
export async function apiUpdatePiece(
  sessionToken: string,
  pieceId: string,
  payload: UpdatePiecePayload,
): Promise<BackendPiece> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/pieces/${pieceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`updatePiece failed (${res.status})`);
  return res.json() as Promise<BackendPiece>;
}

// ─── Piece assets ─────────────────────────────────────────────────────────────

/** GET /users/me/pieces/{piece_id}/assets, list all assets for a piece. */
export async function apiListPieceAssets(
  sessionToken: string,
  pieceId: string,
): Promise<BackendPieceAsset[]> {
  const res = await authedFetch(
    sessionToken,
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
  sessionToken: string,
  pieceId: string,
  file: { uri: string; name: string; type: string },
  status?: ApiPieceStatus,
  description?: string,
): Promise<BackendPieceAsset> {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  if (status) form.append('status', status);
  if (description) form.append('description', description);

  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/pieces/${pieceId}/assets`, {
    method: 'POST',
    // Do NOT set Content-Type, let fetch inject the multipart boundary.
    body: form as unknown as BodyInit_,
  });
  if (!res.ok) throw new Error(`uploadPieceAsset failed (${res.status})`);
  return res.json() as Promise<BackendPieceAsset>;
}

/** DELETE /users/me/pieces/{piece_id}/assets/{asset_id}, permanently remove an asset. */
export async function apiDeletePieceAsset(
  sessionToken: string,
  pieceId: string,
  assetId: string,
): Promise<void> {
  const res = await authedFetch(
    sessionToken,
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
  sessionToken: string,
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
    if (payload.description) form.append('description', payload.description);

    const res = await authedFetch(
      sessionToken,
      `${API_BASE}/users/me/pieces/${pieceId}/assets/${assetId}`,
      { method: 'PUT', body: form as unknown as BodyInit_ },
    );
    if (!res.ok) throw new Error(`updatePieceAsset failed (${res.status})`);
    return res.json() as Promise<BackendPieceAsset>;
  }

  // Metadata-only update, JSON body
  const jsonPayload: { status?: ApiPieceStatus; description?: string } = {};
  if (payload.status) jsonPayload.status = payload.status;
  if (payload.description !== undefined) jsonPayload.description = payload.description;

  const res = await authedFetch(
    sessionToken,
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
