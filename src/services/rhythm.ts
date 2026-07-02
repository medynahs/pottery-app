import type { StudioRhythm } from '@/src/screens/overview/studioRythm/studioRhythm';
import { API_BASE_URL } from './index';
import { ApiError, apiErrorFromResponse } from './api';

export interface BackendRhythmRow {
  id: string;
  user_id: string;
  rhythm: string;
  created_at: string;
  updated_at?: string | null;
}

/** GET /me/rhythm — returns zero or more rhythm rows. */
export async function fetchRhythm(): Promise<BackendRhythmRow[]> {
  const res = await fetch(`${API_BASE_URL}/me/rhythm`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await apiErrorFromResponse(res, 'fetchRhythm failed');
  return res.json() as Promise<BackendRhythmRow[]>;
}

/** POST /me/rhythm — upserts studio rhythm JSON. Sprint/freeform require premium. */
export async function upsertRhythm(rhythm: StudioRhythm): Promise<BackendRhythmRow> {
  const res = await fetch(`${API_BASE_URL}/me/rhythm`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(rhythm),
  });
  if (!res.ok) throw await apiErrorFromResponse(res, 'upsertRhythm failed');
  return res.json() as Promise<BackendRhythmRow>;
}

export function parseStudioRhythmFromRow(row: BackendRhythmRow): StudioRhythm | null {
  try {
    return JSON.parse(row.rhythm) as StudioRhythm;
  } catch {
    return null;
  }
}

export { ApiError };
