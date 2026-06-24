// Community API, /users/me/feed, /users/me/posts
// All endpoints require an X-Session-Token header from Ory Kratos.

import { API_BASE_URL as API_BASE } from './index';

// ─── Backend types ────────────────────────────────────────────────────────────

export interface BackendPostAsset {
  id: string;
  url: string;
  created_at: string;
}

export interface BackendFeedPost {
  id: string;
  user_id: string;
  content: string;
  assets: BackendPostAsset[] | null;
  asset_ids: string[];
  created_at: string;
  reaction_count: number;
  comment_count: number;
  has_reacted: boolean;
  /** Server-side save count for glaze recipe posts (BE-8.5). */
  save_count?: number;
  user_name?: string | null;
  user_avatar_url?: string | null;
  user_cover_url?: string | null;
}

export interface FeedPage {
  items: BackendFeedPost[];
  posts: BackendFeedPost[]; // legacy alias, some endpoints may use either
  next_cursor: string | null;
}

export interface CommunityApiErrorResponse {
  error?: string;
  details?: string | null;
}

export class CommunityApiError extends Error {
  constructor(
    readonly status: number,
    readonly endpoint: string,
    readonly details: string | null = null,
  ) {
    super(`${endpoint} → ${status}${details ? `: ${details}` : ''}`);
    this.name = 'CommunityApiError';
  }
}

async function parseCommunityError(res: Response, endpoint: string): Promise<never> {
  let details: string | null = null;
  try {
    const body = (await res.json()) as CommunityApiErrorResponse;
    details = body.details ?? body.error ?? null;
  } catch {
    try {
      details = (await res.text()) || null;
    } catch {
      // ignore
    }
  }
  throw new CommunityApiError(res.status, endpoint, details);
}

// ─── Request payloads ────────────────────────────────────────────────────────

export interface CreatePostPayload {
  content: string;
  /** UUIDs of pre-uploaded assets to attach to the post. */
  asset_ids?: string[];
}

// ─── Internal helper ─────────────────────────────────────────────────────────

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

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /feed
 * Public discover feed — recent posts from opted-in public profiles.
 * Returns null when the endpoint is not deployed yet (404/501).
 *
 * Backend contract (v1):
 * - Paginated like FeedPage (`items`, `next_cursor`)
 * - Only posts from users with `profile_public = true`
 * - Sorted by `created_at` desc
 * - Exclude posts the viewer already sees via friends feed (optional dedupe server-side)
 */
export async function apiGetDiscoverFeed(
  sessionToken: string,
  opts?: { limit?: number; cursor?: string },
): Promise<FeedPage | null> {
  const params = new URLSearchParams();
  if (opts?.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts?.cursor) params.set('cursor', opts.cursor);
  const qs = params.size > 0 ? `?${params.toString()}` : '';
  try {
    const res = await authedFetch(sessionToken, `${API_BASE}/feed${qs}`);
    if (res.status === 404 || res.status === 501) return null;
    if (!res.ok) return null;
    return res.json() as Promise<FeedPage>;
  } catch {
    return null;
  }
}

/**
 * GET /users/me/feed
 * Returns posts from friends ordered by creation date desc.
 * Supports cursor pagination: `cursor` is an RFC3339Nano|post_uuid string.
 */
export async function apiGetFeed(
  sessionToken: string,
  opts?: { limit?: number; cursor?: string },
): Promise<FeedPage> {
  const params = new URLSearchParams();
  if (opts?.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts?.cursor) params.set('cursor', opts.cursor);
  const qs = params.size > 0 ? `?${params.toString()}` : '';
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/feed${qs}`);
  if (!res.ok) throw new Error(`GET /users/me/feed → ${res.status}`);
  return res.json() as Promise<FeedPage>;
}

/**
 * GET /users/me/posts
 * Lists the authenticated user's own posts, newest first.
 */
export async function apiListMyPosts(
  sessionToken: string,
  opts?: { limit?: number; cursor?: string },
): Promise<FeedPage> {
  const params = new URLSearchParams();
  if (opts?.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts?.cursor) params.set('cursor', opts.cursor);
  const qs = params.size > 0 ? `?${params.toString()}` : '';
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/posts${qs}`);
  if (!res.ok) await parseCommunityError(res, 'GET /users/me/posts');
  return res.json() as Promise<FeedPage>;
}

/**
 * POST /users/me/posts
 * Creates a new social post. `asset_ids` should reference UUIDs returned by
 * the presigned-upload endpoint before calling this.
 */
export async function apiCreatePost(
  sessionToken: string,
  payload: CreatePostPayload,
): Promise<BackendFeedPost> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /users/me/posts → ${res.status}`);
  return res.json() as Promise<BackendFeedPost>;
}

/**
 * POST /posts/{post_id}/reactions
 * Adds a like reaction to a post. Returns 201 on success.
 */
export async function apiAddReaction(
  sessionToken: string,
  postId: string,
): Promise<void> {
  const res = await authedFetch(sessionToken, `${API_BASE}/posts/${postId}/reactions`, {
    method: 'POST',
  });
  // 409 means already reacted, treat as success
  if (!res.ok && res.status !== 409) {
    throw new Error(`POST /posts/${postId}/reactions → ${res.status}`);
  }
}

/**
 * DELETE /posts/{post_id}/reactions
 * Removes the current user's reaction from a post. Returns 204 on success.
 */
export async function apiRemoveReaction(
  sessionToken: string,
  postId: string,
): Promise<void> {
  const res = await authedFetch(sessionToken, `${API_BASE}/posts/${postId}/reactions`, {
    method: 'DELETE',
  });
  // 404 means reaction didn't exist, treat as success
  if (!res.ok && res.status !== 404) {
    throw new Error(`DELETE /posts/${postId}/reactions → ${res.status}`);
  }
}

// ─── Hall of Fame (challenge winner archive) ───────────────────────────────────

export interface BackendHallOfFameWinner {
  id: string;
  track_id: string;
  track_title: string;
  artist_name: string;
  studio_name?: string | null;
  piece_title: string;
  process_note?: string | null;
  image_url: string;
  hero_image_url?: string | null;
  vote_count: number;
  won_at: string;
}

export interface BackendHallOfFameCycle {
  challenge_id: string;
  title: string;
  label?: string | null;
  emoji?: string | null;
  closed_at: string;
  winners: BackendHallOfFameWinner[];
}

export interface BackendHallOfFameResponse {
  cycles: BackendHallOfFameCycle[];
}

/** Legacy leaderboard row — kept for backwards compatibility with older API shapes. */
export interface BackendHallOfFameLeaderboardEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  piece_count: number;
  challenge_wins: number;
  survival_rate: number;
}

/**
 * GET /hall-of-fame
 * Winner archive: `{ cycles: [{ challenge_id, title, winners[] }] }`.
 * Returns null when the endpoint is missing or returns an unsupported shape.
 */
export async function apiGetHallOfFameArchive(
  sessionToken: string,
): Promise<BackendHallOfFameResponse | null> {
  const res = await authedFetch(sessionToken, `${API_BASE}/hall-of-fame`);
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data || typeof data !== 'object') return null;

  if (Array.isArray((data as BackendHallOfFameResponse).cycles)) {
    return data as BackendHallOfFameResponse;
  }

  return null;
}

// ─── Polls ────────────────────────────────────────────────────────────────────

export interface BackendPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface BackendPoll {
  id: string;
  question: string;
  options: BackendPollOption[];
  total_votes: number;
  voted_option_id: string | null; // null = not yet voted
  created_at: string;
}

/**
 * GET /polls
 * Returns active polls for the community.
 */
export async function apiGetPolls(sessionToken: string): Promise<BackendPoll[]> {
  const res = await authedFetch(sessionToken, `${API_BASE}/polls`);
  if (!res.ok) throw new Error(`GET /polls → ${res.status}`);
  return res.json() as Promise<BackendPoll[]>;
}

/**
 * POST /polls/{poll_id}/vote
 * Casts one vote for the given option. Returns updated poll state.
 * 409 = already voted.
 */
export async function apiVotePoll(
  sessionToken: string,
  pollId: string,
  optionId: string,
): Promise<BackendPoll> {
  const res = await authedFetch(sessionToken, `${API_BASE}/polls/${pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option_id: optionId }),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`POST /polls/${pollId}/vote → ${res.status}`);
  }
  return res.json() as Promise<BackendPoll>;
}
