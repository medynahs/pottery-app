// Kilns API, /me/kilns — doc-blob backup like pieces/firings.
// FE is the source of truth: the backend stores each kiln as an opaque `doc`
// keyed on client_ref, with no queryable projections.
// All endpoints require a SuperTokens session (auth header injected by the RN SDK).

import type { Kiln } from '../types/kiln';
import { API_BASE_URL as API_BASE } from './index';
import { apiErrorFromResponse } from './api';

export interface BackendKiln {
  id: string;           // UUID
  /** Device-local kiln id; sync upserts are keyed on it. */
  client_ref?: string;
  /** The device kiln document, stored verbatim. Legacy rows hold the old
   *  flat kiln blob; the owning device's next push replaces it. */
  doc?: Partial<Kiln> | null;
  is_deleted?: boolean;
  created_at: string;
  updated_at?: string;
}

/** Snapshot sent to POST /me/kilns/sync, identity is client_ref only. */
export interface KilnSyncSnapshot {
  client_ref: string;
  /** Re-links a kiln that synced before client_ref existed to its old row. */
  backend_id?: string;
  deleted?: boolean;
  doc?: Record<string, unknown>;
}

export interface SyncKilnsRequest {
  kilns: KilnSyncSnapshot[];
}

export interface SyncKilnsResponse {
  /** client_ref → backend UUID for every synced item, deleted ones included. */
  client_ref_map: Record<string, string>;
}

/** The synced kiln document: the local kiln verbatim minus sync-transient fields. */
export function docForBackend(kiln: Kiln): Record<string, unknown> {
  const { backendId, syncDirty, deleted, ...doc } = kiln;
  void backendId; void syncDirty; void deleted;
  return doc;
}

function authedFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

/** GET /me/kilns, list all kiln backups for the authenticated user. */
export async function apiListKilns(): Promise<BackendKiln[]> {
  const res = await authedFetch(`${API_BASE}/me/kilns`);
  if (!res.ok) {
    throw await apiErrorFromResponse(res, 'GET /me/kilns failed');
  }
  return res.json() as Promise<BackendKiln[]>;
}

/**
 * POST /me/kilns/sync — the ONE push path. Full snapshots of new,
 * edited and deleted kilns, keyed on client_ref; idempotent to retry.
 */
export async function apiSyncKilns(
  payload: SyncKilnsRequest,
): Promise<SyncKilnsResponse> {
  const res = await authedFetch(`${API_BASE}/me/kilns/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw await apiErrorFromResponse(res, 'POST /me/kilns/sync failed');
  }
  return res.json() as Promise<SyncKilnsResponse>;
}
