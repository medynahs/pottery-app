// Challenges API, /challenges
// All endpoints require an X-Session-Token header from Ory Kratos.

import { API_BASE_URL as API_BASE } from './index';

export interface BackendChallenge {
  id: string;
  title: string;
  description: string;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
  participant_count?: number;
}

export interface BackendChallengeEntry {
  id: string;
  challenge_id: string;
  user_id?: string;
  piece_id?: string | null;
  note?: string | null;
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
  piece_id?: string;
  note?: string;
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

function toJsonOrNull<T>(res: Response): Promise<T | null> {
  return res
    .json()
    .then((data) => data as T)
    .catch(() => null);
}

/** GET /challenges */
export async function apiListChallenges(
  sessionToken: string,
): Promise<BackendChallenge[]> {
  const res = await authedFetch(sessionToken, `${API_BASE}/challenges`);
  if (!res.ok) {
    throw new Error(`GET /challenges -> ${res.status}`);
  }
  return res.json() as Promise<BackendChallenge[]>;
}

/** POST /challenges/{id}/entries */
export async function apiSubmitChallengeEntry(
  sessionToken: string,
  challengeId: string,
  payload: SubmitChallengeEntryPayload,
): Promise<BackendChallengeEntry> {
  const res = await authedFetch(sessionToken, `${API_BASE}/challenges/${challengeId}/entries`, {
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
  sessionToken: string,
  challengeId: string,
  entryId: string,
): Promise<void> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/challenges/${challengeId}/entries/${entryId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    throw new Error(`DELETE /challenges/${challengeId}/entries/${entryId} -> ${res.status}`);
  }
}

/** GET /challenges/{id}/leaderboard */
export async function apiGetChallengeLeaderboard(
  sessionToken: string,
  challengeId: string,
): Promise<BackendChallengeLeaderboardEntry[]> {
  const res = await authedFetch(sessionToken, `${API_BASE}/challenges/${challengeId}/leaderboard`);
  if (!res.ok) {
    throw new Error(`GET /challenges/${challengeId}/leaderboard -> ${res.status}`);
  }

  const data = await toJsonOrNull<BackendChallengeLeaderboardEntry[] | { entries?: BackendChallengeLeaderboardEntry[] }>(res);
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.entries ?? [];
}
