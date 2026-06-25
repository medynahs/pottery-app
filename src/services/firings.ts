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
  fired_date?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  peak_temp_c?: number | null;
  hold_time_minutes?: number | null;
  photo_uri?: string | null;
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
  fired_date?: string;
  started_at?: string;
  completed_at?: string;
  peak_temp_c?: number;
  hold_time_minutes?: number;
  photo_uri?: string;
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
  fired_date?: string;
  started_at?: string;
  completed_at?: string;
  peak_temp_c?: number | null;
  hold_time_minutes?: number | null;
  photo_uri?: string | null;
}

/** Map local firing log journal fields to API snake_case payload. */
export function firingLogFieldsForApi(firing: {
  firedDate?: string;
  submissionDate?: string;
  scheduledDate?: string;
  peakTempC?: number;
  holdTimeMinutes?: number;
  photoUri?: string;
}): Pick<
  UpdateFiringPayload,
  'fired_date' | 'peak_temp_c' | 'hold_time_minutes' | 'photo_uri' | 'scheduled_date'
> {
  const payload: Pick<
    UpdateFiringPayload,
    'fired_date' | 'peak_temp_c' | 'hold_time_minutes' | 'photo_uri' | 'scheduled_date'
  > = {};

  const firedDate = firing.firedDate ?? firing.submissionDate ?? firing.scheduledDate;
  if (firedDate) payload.fired_date = firedDate;
  if (firing.peakTempC != null) payload.peak_temp_c = firing.peakTempC;
  if (firing.holdTimeMinutes != null) payload.hold_time_minutes = firing.holdTimeMinutes;
  if (firing.photoUri) payload.photo_uri = firing.photoUri;

  return payload;
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
