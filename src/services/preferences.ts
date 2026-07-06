import { API_BASE_URL } from './index';
import { ApiError, apiErrorFromResponse } from './api';
import type { PreferencesBlob } from './preferencesMapper';

/** GET /me/preferences — returns {} when never written. */
export async function fetchPreferences(): Promise<PreferencesBlob> {
  const res = await fetch(`${API_BASE_URL}/me/preferences`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await apiErrorFromResponse(res, 'fetchPreferences failed');
  return res.json() as Promise<PreferencesBlob>;
}

/** PUT /me/preferences — full-replace; body must include `version`. */
export async function updatePreferences(blob: PreferencesBlob): Promise<PreferencesBlob> {
  const res = await fetch(`${API_BASE_URL}/me/preferences`, {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(blob),
  });
  if (!res.ok) throw await apiErrorFromResponse(res, 'updatePreferences failed');
  return res.json() as Promise<PreferencesBlob>;
}

export { ApiError };
