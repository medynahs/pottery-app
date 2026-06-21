// Firings API, /users/me/firings
// All endpoints require an X-Session-Token header from Ory Kratos.

import { API_BASE_URL as API_BASE } from './index';

export type BackendFiringState =
  | 'scheduled'
  | 'loading'
  | 'firing'
  | 'cooling'
  | 'unloading'
  | 'completed';

export interface BackendFiring {
  id: string;
  kiln_id?: string | null;
  studio_id?: string | null;
  name: string;
  type: string;
  cone: string;
  state: BackendFiringState;
  notes?: string | null;
  scheduled_date?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateFiringPayload {
  kiln_id?: string;
  studio_id?: string;
  name: string;
  type: string;
  cone: string;
  state?: BackendFiringState;
  notes?: string;
  scheduled_date?: string;
}

export interface UpdateFiringPayload {
  kiln_id?: string;
  studio_id?: string;
  name?: string;
  type?: string;
  cone?: string;
  state?: BackendFiringState;
  notes?: string;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
}

function authedFetch(
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

/** GET /users/me/firings */
export async function apiListFirings(sessionToken: string): Promise<BackendFiring[]> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/firings`);
  if (!res.ok) {
    throw new Error(`GET /users/me/firings -> ${res.status}`);
  }
  return res.json() as Promise<BackendFiring[]>;
}

/** POST /users/me/firings */
export async function apiCreateFiring(
  sessionToken: string,
  payload: CreateFiringPayload,
): Promise<BackendFiring> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/firings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`POST /users/me/firings -> ${res.status}`);
  }
  return res.json() as Promise<BackendFiring>;
}

/** GET /users/me/firings/{id} */
export async function apiGetFiring(
  sessionToken: string,
  firingId: string,
): Promise<BackendFiring> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/firings/${firingId}`);
  if (!res.ok) {
    throw new Error(`GET /users/me/firings/${firingId} -> ${res.status}`);
  }
  return res.json() as Promise<BackendFiring>;
}

/** PATCH /users/me/firings/{id} */
export async function apiUpdateFiring(
  sessionToken: string,
  firingId: string,
  payload: UpdateFiringPayload,
): Promise<BackendFiring> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/firings/${firingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`PATCH /users/me/firings/${firingId} -> ${res.status}`);
  }
  return res.json() as Promise<BackendFiring>;
}

/** DELETE /users/me/firings/{id} */
export async function apiDeleteFiring(
  sessionToken: string,
  firingId: string,
): Promise<void> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/firings/${firingId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`DELETE /users/me/firings/${firingId} -> ${res.status}`);
  }
}
