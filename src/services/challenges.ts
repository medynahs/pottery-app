// Challenges API, /challenges
// All endpoints require an X-Session-Token header from Ory Kratos.

import { API_BASE_URL as API_BASE } from './index';

export type ChallengeStatus = 'open' | 'voting' | 'closed';

export interface BackendChallengeTrack {
  id: string;
  title: string;
  summary?: string;
  participant_count?: number;
}

export interface BackendChallengeWinner {
  id: string;
  track_id: string;
  track_title: string;
  user_id?: string;
  artist_name: string;
  studio_name?: string | null;
  piece_title: string;
  process_note?: string | null;
  image_url: string;
  hero_image_url?: string | null;
  vote_count: number;
  won_at: string;
}

export interface BackendChallenge {
  id: string;
  name: string;
  description: string;
  status?: ChallengeStatus | null;
  start_date?: string | null;
  end_date?: string | null;
  submission_deadline?: string | null;
  voting_ends_at?: string | null;
  winners_display_until?: string | null;
  next_challenge_starts_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
  participant_count?: number;
  tracks?: BackendChallengeTrack[];
  winners?: BackendChallengeWinner[];
  hero_image_url?: string | null;
  /** Join state — returned on challenge detail or list when authenticated. */
  is_joined?: boolean;
  track_id?: string | null;
  my_entry_id?: string | null;
  has_submitted?: boolean;
}

export interface BackendChallengeEntry {
  id: string;
  challenge_id: string;
  track_id?: string | null;
  user_id?: string;
  artist_name?: string | null;
  studio_name?: string | null;
  piece_title?: string | null;
  process_note?: string | null;
  image_url?: string | null;
  piece_id?: string | null;
  note?: string | null;
  vote_count?: number;
  rank?: number;
  my_vote?: boolean;
  created_at?: string;
}

export interface BackendChallengeLeaderboardEntry {
  user_id: string;
  user_name?: string;
  score: number;
  rank?: number;
  wins?: number;
}

export interface SubmitChallengeEntryPayload {
  track_id?: string;
  piece_id?: string;
  note?: string;
  post_id?: string;
}

export interface VoteChallengePayload {
  entry_id: string;
}

/** Display name for UI (API field is `name`, not legacy `title`). */
export function challengeDisplayName(
  challenge: Pick<BackendChallenge, 'name'>,
): string {
  return challenge.name?.trim() || 'Community Challenge';
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

function toJsonOrNull<T>(res: Response): Promise<T | null> {
  return res
    .json()
    .then((data) => data as T)
    .catch(() => null);
}

/** GET /challenges */
export async function apiListChallenges(
  ): Promise<BackendChallenge[]> {
  const res = await authedFetch(`${API_BASE}/challenges`);
  if (!res.ok) {
    console.warn(`[challenges] GET /challenges -> HTTP ${res.status}`);
    throw new Error(`GET /challenges -> ${res.status}`);
  }
  const data = await toJsonOrNull<BackendChallenge[] | { items?: BackendChallenge[] }>(res);
  if (!data) {
    console.warn('[challenges] GET /challenges -> 200 but response body was empty/unparseable');
    return [];
  }
  const items = Array.isArray(data) ? data : (data.items ?? []);
  if (items.length === 0) {
    console.warn('[challenges] GET /challenges -> 200 but list is empty (no active challenges in DB)');
  }
  return items;
}

/** GET /challenges/{id} */
export async function apiGetChallenge(
    challengeId: string,
): Promise<BackendChallenge> {
  const res = await authedFetch(`${API_BASE}/challenges/${challengeId}`);
  if (!res.ok) {
    throw new Error(`GET /challenges/${challengeId} -> ${res.status}`);
  }
  return res.json() as Promise<BackendChallenge>;
}

/** POST /challenges/{id}/entries */
export async function apiSubmitChallengeEntry(
    challengeId: string,
  payload: SubmitChallengeEntryPayload,
): Promise<BackendChallengeEntry> {
  const res = await authedFetch(`${API_BASE}/challenges/${challengeId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`POST /challenges/${challengeId}/entries -> ${res.status}`);
  }
  return res.json() as Promise<BackendChallengeEntry>;
}

/** DELETE /challenges/{id}/entries/{entryId} */
export async function apiWithdrawChallengeEntry(
    challengeId: string,
  entryId: string,
): Promise<void> {
  const res = await authedFetch(
    `${API_BASE}/challenges/${challengeId}/entries/${entryId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    throw new Error(`DELETE /challenges/${challengeId}/entries/${entryId} -> ${res.status}`);
  }
}

/** GET /challenges/{id}/entries */
export async function apiGetChallengeEntries(
    challengeId: string,
  trackId?: string,
): Promise<BackendChallengeEntry[]> {
  const query = trackId ? `?track_id=${encodeURIComponent(trackId)}` : '';
  const res = await authedFetch(
    `${API_BASE}/challenges/${challengeId}/entries${query}`,
  );
  if (!res.ok) {
    throw new Error(`GET /challenges/${challengeId}/entries -> ${res.status}`);
  }

  const data = await toJsonOrNull<BackendChallengeEntry[] | { items?: BackendChallengeEntry[]; entries?: BackendChallengeEntry[] }>(res);
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items ?? data.entries ?? [];
}

/** POST /challenges/{id}/votes */
export async function apiVoteChallengeEntry(
    challengeId: string,
  entryId: string,
): Promise<void> {
  const res = await authedFetch(`${API_BASE}/challenges/${challengeId}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry_id: entryId } satisfies VoteChallengePayload),
  });
  if (!res.ok) {
    throw new Error(`POST /challenges/${challengeId}/votes -> ${res.status}`);
  }
}

/** GET /challenges/{id}/leaderboard */
export async function apiGetChallengeLeaderboard(
    challengeId: string,
): Promise<BackendChallengeLeaderboardEntry[]> {
  const res = await authedFetch(`${API_BASE}/challenges/${challengeId}/leaderboard`);
  if (!res.ok) {
    throw new Error(`GET /challenges/${challengeId}/leaderboard -> ${res.status}`);
  }

  const data = await toJsonOrNull<BackendChallengeLeaderboardEntry[] | { entries?: BackendChallengeLeaderboardEntry[] }>(res);
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.entries ?? [];
}
