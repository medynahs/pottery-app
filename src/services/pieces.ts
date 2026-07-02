// Pieces API, /me/pieces — the "notebook + shoebox" sync surface.
// FE is the source of truth: the backend stores each piece as an opaque `doc`
// backup plus a few queryable projections (name, stage, glaze_id, visibility),
// and piece assets as a dumb blob registry keyed by asset UUID.
// All endpoints require a SuperTokens session (auth header injected by the RN SDK).

import type { Piece, PieceVisibility, TimelineEntry } from '../types/pieces';
import { API_BASE_URL as API_BASE } from './index';

// ─── Backend types ────────────────────────────────────────────────────────────

export interface BackendPiece {
  id: string;           // UUID
  /** Device-local piece id; sync upserts are keyed on it. */
  client_ref?: string;
  name: string;
  /** Piece stage, single vocabulary — the local Stage ids verbatim. */
  stage: string;
  glaze_id?: string | null;
  visibility?: PieceVisibility;
  /** The device piece document, stored verbatim. Empty for rows that predate
   *  doc sync; the owning device's next push fills it. */
  doc?: Partial<Piece> | null;
  is_deleted?: boolean;
  created_at: string;
  updated_at?: string;
}

/** Snapshot sent to POST /me/pieces/sync, identity is client_ref only. */
export interface PieceSyncSnapshot {
  client_ref: string;
  name: string;
  stage: string;
  glaze_id?: string | null;
  deleted?: boolean;
  doc?: Record<string, unknown>;
}

export interface SyncPiecesRequest {
  pieces: PieceSyncSnapshot[];
}

export interface SyncPiecesResponse {
  /** client_ref → backend UUID for every synced item, deleted ones included.
   *  Authoritative state is pulled separately via GET /me/pieces. */
  client_ref_map: Record<string, string>;
}

export interface BackendPieceAsset {
  id: string;           // UUID
  piece_id: string;
  /** Stable storage key. Cache/dedup on this, not on url. */
  object_key: string;
  /** Resolved link for this viewer: stable public URL, or a short-lived presigned URL
   *  for private/friends. Transient, a one-shot download ticket, never persist it. */
  url: string;
  created_at: string;
}

// ─── Doc building ─────────────────────────────────────────────────────────────

/**
 * The backend timeline stores photos as stable `{ assetId }` refs, never
 * device-local uris. Photos still pending upload (no assetId) are omitted until
 * their upload fills the id and the piece re-syncs.
 */
export function timelineForBackend(timeline: TimelineEntry[]): unknown[] {
  return timeline.map((entry) => ({
    ...entry,
    photos: (entry.photos ?? [])
      .filter((photo) => photo.assetId)
      .map((photo) => ({ assetId: photo.assetId })),
  }));
}

/**
 * The synced piece document: the local piece verbatim, minus device-transient
 * fields (sync flags, local file uris, the backend-owned visibility).
 * `coverAssetId` stays in — it's how a fresh device knows which asset is the
 * cover. New Piece fields sync with zero changes here.
 */
export function docForBackend(piece: Piece): Record<string, unknown> {
  const { backendId, syncDirty, deleted, photo, imgUrl, visibility, ...doc } = piece;
  void backendId; void syncDirty; void deleted; void photo; void imgUrl; void visibility;
  return { ...doc, timeline: timelineForBackend(piece.timeline) };
}

/**
 * Local glaze atlas id → backend UUID for the piece's queryable glaze_id
 * projection. Unmapped (glaze not yet synced) → null; useGlazesSync re-dirties
 * the piece once the glaze gets its backend id. The local glazeId itself
 * round-trips inside the doc regardless.
 */
export function resolvePieceGlazeBackendId(
  localGlazeId: string | undefined,
  glazes: ReadonlyArray<{ id: string; backendId?: string }>,
): string | null {
  if (!localGlazeId?.trim()) return null;
  return glazes.find((g) => g.id === localGlazeId)?.backendId ?? null;
}

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

// ─── Pieces ───────────────────────────────────────────────────────────────────

/** GET /me/pieces, list all piece backups for the authenticated user. */
export async function apiListPieces(
    ): Promise<BackendPiece[]> {
  const res = await authedFetch(`${API_BASE}/me/pieces`);
  if (!res.ok) throw new Error(`listPieces failed (${res.status})`);
  return res.json() as Promise<BackendPiece[]>;
}

/**
 * POST /me/pieces/sync — the ONE push path. Full snapshots of new,
 * edited and deleted pieces, keyed on client_ref; idempotent to retry.
 */
export async function apiSyncPieces(
    payload: SyncPiecesRequest,
): Promise<SyncPiecesResponse> {
  const res = await authedFetch(`${API_BASE}/me/pieces/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`syncPieces failed (${res.status})`);
  return res.json() as Promise<SyncPiecesResponse>;
}

/**
 * PUT /me/pieces/{piece_id}/visibility, change a piece's sharing scope. The server
 * reconciles the public-bucket mirror (publish/revoke) before committing, so this needs
 * connectivity, it is not part of the offline sync.
 */
export async function apiSetPieceVisibility(
    pieceId: string,
  visibility: PieceVisibility,
): Promise<BackendPiece> {
  const res = await authedFetch(`${API_BASE}/me/pieces/${pieceId}/visibility`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visibility }),
  });
  if (!res.ok) throw new Error(`setPieceVisibility failed (${res.status})`);
  return res.json() as Promise<BackendPiece>;
}

// ─── Piece assets ─────────────────────────────────────────────────────────────

/**
 * GET /me/piece-assets, every asset across all the user's pieces in one
 * call. Used by hydrate (fresh-device restore) and orphan reconcile.
 */
export async function apiListAllPieceAssets(
    ): Promise<BackendPieceAsset[]> {
  const res = await authedFetch(`${API_BASE}/me/piece-assets`);
  if (!res.ok) throw new Error(`listAllPieceAssets failed (${res.status})`);
  return res.json() as Promise<BackendPieceAsset[]>;
}

/**
 * POST /me/pieces/{piece_id}/assets, upload an image blob. Which entry
 * (or the cover slot) it belongs to lives in the piece doc as an assetId ref.
 * The file must be a local URI (e.g. from expo-image-picker).
 */
export async function apiUploadPieceAsset(
    pieceId: string,
  file: { uri: string; name: string; type: string },
): Promise<BackendPieceAsset> {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);

  const res = await authedFetch(`${API_BASE}/me/pieces/${pieceId}/assets`, {
    method: 'POST',
    // Do NOT set Content-Type, let fetch inject the multipart boundary.
    body: form as unknown as BodyInit_,
  });
  if (!res.ok) throw new Error(`uploadPieceAsset failed (${res.status})`);
  return res.json() as Promise<BackendPieceAsset>;
}

/** DELETE /me/pieces/{piece_id}/assets/{asset_id}, permanently remove an asset. */
export async function apiDeletePieceAsset(
    pieceId: string,
  assetId: string,
): Promise<void> {
  const res = await authedFetch(
    `${API_BASE}/me/pieces/${pieceId}/assets/${assetId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error(`deletePieceAsset failed (${res.status})`);
}
