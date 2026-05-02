// Community API — /users/me/feed, /users/me/posts
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
}

export interface FeedPage {
  items: BackendFeedPost[];
  posts: BackendFeedPost[]; // legacy alias — some endpoints may use either
  next_cursor: string | null;
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
  if (!res.ok) throw new Error(`GET /users/me/posts → ${res.status}`);
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
  // 409 means already reacted — treat as success
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
  // 404 means reaction didn't exist — treat as success
  if (!res.ok && res.status !== 404) {
    throw new Error(`DELETE /posts/${postId}/reactions → ${res.status}`);
  }
}

// ─── Hall of Fame ─────────────────────────────────────────────────────────────

export interface BackendHallOfFameEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  piece_count: number;
  challenge_wins: number;
  survival_rate: number; // 0–100, server-computed
}

/**
 * GET /hall-of-fame
 * Returns top potters sorted by challenge wins. Updated daily server-side.
 */
export async function apiGetHallOfFame(
  sessionToken: string,
): Promise<BackendHallOfFameEntry[]> {
  const res = await authedFetch(sessionToken, `${API_BASE}/hall-of-fame`);
  if (!res.ok) throw new Error(`GET /hall-of-fame → ${res.status}`);
  return res.json() as Promise<BackendHallOfFameEntry[]>;
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
