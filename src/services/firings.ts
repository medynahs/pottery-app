// Firings API, /me/firings — doc-blob backup like pieces.
// FE is the source of truth: the backend stores each firing as an opaque `doc`
// keyed on client_ref, with no queryable projections.
// All endpoints require a SuperTokens session (auth header injected by the RN SDK).

import type { Firing } from '../types/kiln';
import { API_BASE_URL as API_BASE } from './index';
import { apiErrorFromResponse } from './api';

export interface BackendFiring {
  id: string;           // UUID
  /** Device-local firing id; sync upserts are keyed on it. */
  client_ref?: string;
  /** The device firing document, stored verbatim. Empty for rows that predate
   *  doc sync; the owning device's next push fills it. */
  doc?: Partial<Firing> | null;
  is_deleted?: boolean;
  created_at: string;
  updated_at?: string;
}

/** Snapshot sent to POST /me/firings/sync, identity is client_ref only. */
export interface FiringSyncSnapshot {
  client_ref: string;
  deleted?: boolean;
  doc?: Record<string, unknown>;
}

export interface SyncFiringsRequest {
  firings: FiringSyncSnapshot[];
}

export interface SyncFiringsResponse {
  /** client_ref → backend UUID for every synced item, deleted ones included. */
  client_ref_map: Record<string, string>;
}

/** The synced firing document: the local firing verbatim minus the backend link. */
export function docForBackend(firing: Firing): Record<string, unknown> {
  const { backendId, ...doc } = firing;
  void backendId;
  return doc;
}

function authedFetch(url: string,
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

/** GET /me/firings, list all firing backups for the authenticated user. */
export async function apiListFirings(): Promise<BackendFiring[]> {
  const res = await authedFetch(`${API_BASE}/me/firings`);
  if (!res.ok) {
    throw await apiErrorFromResponse(res, 'GET /me/firings failed');
  }
  return res.json() as Promise<BackendFiring[]>;
}

/**
 * POST /me/firings/sync — the ONE push path. Full snapshots of new,
 * edited and deleted firings, keyed on client_ref; idempotent to retry.
 */
export async function apiSyncFirings(
    payload: SyncFiringsRequest,
): Promise<SyncFiringsResponse> {
  const res = await authedFetch(`${API_BASE}/me/firings/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw await apiErrorFromResponse(res, 'POST /me/firings/sync failed');
  }
  return res.json() as Promise<SyncFiringsResponse>;
}
