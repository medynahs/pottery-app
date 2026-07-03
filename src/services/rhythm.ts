import type { StudioRhythm } from '@/src/screens/overview/studioRythm/studioRhythm';
import { apiErrorFromResponse } from './api';
import { API_BASE_URL } from './index';

export async function fetchRhythm(): Promise<StudioRhythm | null> {
  const res = await fetch(`${API_BASE_URL}/me/rhythm`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await apiErrorFromResponse(res, 'fetchRhythm failed');
  return res.json() as Promise<StudioRhythm | null>;
}

// sprint/freeform rhythms are premium-gated server-side — expect a 403 for non-premium.
export async function upsertRhythm(rhythm: StudioRhythm): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/me/rhythm`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(rhythm),
  });
  if (!res.ok) throw await apiErrorFromResponse(res, 'upsertRhythm failed');
}
