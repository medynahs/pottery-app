// Community API, /me/feed, /me/posts
// All endpoints require a SuperTokens session (auth header injected by the RN SDK).

import type { PieceVisibility } from '../types/pieces';
import { API_BASE_URL as API_BASE } from './index';
import { isNetworkFailure, networkFailureMessage } from '@/src/utils/networkErrors';

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
  /** Wrapped journal piece, when the post is a shared piece rather than a standalone post. */
  piece_id?: string | null;
  title?: string | null;
  visibility?: PieceVisibility;
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
  /** Optional now, a post can be a piece and/or images with no text. */
  content?: string;
  /** UUIDs returned by POST /uploads before creating the post. */
  asset_ids?: string[];
  /** Wrap a journal piece; the post inherits the piece's visibility. */
  piece_id?: string;
  title?: string;
  /** Standalone-post visibility (ignored by the server when piece_id is set). */
  visibility?: PieceVisibility;
}

function normalizePostAsset(raw: unknown): BackendPostAsset | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id =
    typeof record.id === 'string'
      ? record.id
      : typeof record.asset_id === 'string'
        ? record.asset_id
        : null;
  const url =
    typeof record.url === 'string'
      ? record.url
      : typeof record.public_url === 'string'
        ? record.public_url
        : null;
  if (!id || !url) return null;
  return {
    id,
    url,
    created_at:
      typeof record.created_at === 'string' ? record.created_at : new Date().toISOString(),
  };
}

/** Normalize feed post assets so UI always receives `{ id, url }`. */
export function normalizeFeedPost(post: BackendFeedPost): BackendFeedPost {
  const rawAssets = Array.isArray(post.assets) ? post.assets : [];
  const assets = rawAssets
    .map((asset) => normalizePostAsset(asset))
    .filter((asset): asset is BackendPostAsset => asset != null);

  return {
    ...post,
    assets: assets.length > 0 ? assets : post.assets,
    asset_ids: Array.isArray(post.asset_ids) ? post.asset_ids : [],
  };
}

function normalizeFeedPage(page: FeedPage): FeedPage {
  const items = (page.items ?? page.posts ?? []).map(normalizeFeedPost);
  return { ...page, items, posts: items };
}

/** Merge create-post response with a just-uploaded asset when the API omits assets[]. */
export function hydrateCreatedPost(
  post: BackendFeedPost,
  uploaded: { assetId: string; publicUrl?: string } | null,
  assetIds: string[],
): BackendFeedPost {
  const normalized = normalizeFeedPost(post);
  if (normalized.assets?.length) return normalized;
  if (!uploaded?.publicUrl) return normalized;

  return {
    ...normalized,
    assets: [
      {
        id: uploaded.assetId,
        url: uploaded.publicUrl,
        created_at: normalized.created_at,
      },
    ],
    asset_ids: normalized.asset_ids.length > 0 ? normalized.asset_ids : assetIds,
  };
}

// ─── Internal helper ─────────────────────────────────────────────────────────

function authedFetch(url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  }).catch((error) => {
    if (isNetworkFailure(error)) {
      throw new CommunityApiError(0, url, networkFailureMessage('post'));
    }
    throw error;
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
    opts?: { limit?: number; cursor?: string },
): Promise<FeedPage | null> {
  const params = new URLSearchParams();
  if (opts?.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts?.cursor) params.set('cursor', opts.cursor);
  const qs = params.size > 0 ? `?${params.toString()}` : '';
  try {
    const res = await authedFetch(`${API_BASE}/feed${qs}`);
    if (res.status === 404 || res.status === 501) return null;
    if (!res.ok) return null;
    const page = (await res.json()) as FeedPage;
    return normalizeFeedPage(page);
  } catch {
    return null;
  }
}

/**
 * GET /me/feed
 * Returns posts from friends ordered by creation date desc.
 * Supports cursor pagination: `cursor` is an RFC3339Nano|post_uuid string.
 */
export async function apiGetFeed(
    opts?: { limit?: number; cursor?: string },
): Promise<FeedPage> {
  const params = new URLSearchParams();
  if (opts?.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts?.cursor) params.set('cursor', opts.cursor);
  const qs = params.size > 0 ? `?${params.toString()}` : '';
  const res = await authedFetch(`${API_BASE}/me/feed${qs}`);
  if (!res.ok) throw new Error(`GET /me/feed → ${res.status}`);
  const page = (await res.json()) as FeedPage;
  return normalizeFeedPage(page);
}

/**
 * GET /me/posts
 * Lists the authenticated user's own posts, newest first.
 */
export async function apiListMyPosts(
    opts?: { limit?: number; cursor?: string },
): Promise<FeedPage> {
  const params = new URLSearchParams();
  if (opts?.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts?.cursor) params.set('cursor', opts.cursor);
  const qs = params.size > 0 ? `?${params.toString()}` : '';
  const res = await authedFetch(`${API_BASE}/me/posts${qs}`);
  if (!res.ok) await parseCommunityError(res, 'GET /me/posts');
  const page = (await res.json()) as FeedPage;
  return normalizeFeedPage(page);
}

/**
 * POST /me/posts
 * Creates a new social post. Upload photos first via POST /uploads, then pass asset_ids.
 */
export async function apiCreatePost(
    payload: CreatePostPayload,
): Promise<BackendFeedPost> {
  const res = await authedFetch(`${API_BASE}/me/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseCommunityError(res, 'POST /me/posts');
  const post = (await res.json()) as BackendFeedPost;
  return normalizeFeedPost(post);
}

/**
 * DELETE /posts/{post_id}
 * Permanently deletes the authenticated user's own post. Returns 204 on success.
 */
export async function apiDeletePost(
    postId: string,
): Promise<void> {
  const res = await authedFetch(`${API_BASE}/posts/${postId}`, {
    method: 'DELETE',
  });
  // 404 means already gone, treat as success
  if (!res.ok && res.status !== 404) {
    throw new CommunityApiError(res.status, `DELETE /posts/${postId}`);
  }
}

/**
 * POST /posts/{post_id}/reactions
 * Adds a like reaction to a post. Returns 201 on success.
 */
export async function apiAddReaction(
    postId: string,
): Promise<void> {
  const res = await authedFetch(`${API_BASE}/posts/${postId}/reactions`, {
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
    postId: string,
): Promise<void> {
  const res = await authedFetch(`${API_BASE}/posts/${postId}/reactions`, {
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
  artist_name?: string | null;
  studio_name?: string | null;
  piece_title: string;
  process_note?: string | null;
  image_url?: string | null;
  hero_image_url?: string | null;
  vote_count: number;
  won_at: string;
  user_deleted?: boolean;
}

export interface BackendHallOfFameWinnerDetail extends BackendHallOfFameWinner {
  challenge_id: string;
  challenge_title: string;
  challenge_description?: string | null;
  challenge_label?: string | null;
  challenge_emoji?: string | null;
  closed_at?: string | null;
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
 * GET /public/hall-of-fame
 * Winner archive: `{ cycles: [{ challenge_id, title, winners[] }] }`.
 * Returns null when the endpoint is missing or returns an unsupported shape.
 */
export async function apiGetHallOfFameArchive(
  ): Promise<BackendHallOfFameResponse> {
  const res = await authedFetch(`${API_BASE}/public/hall-of-fame`);
  if (!res.ok) {
    throw new Error(`Hall of Fame request failed (${res.status})`);
  }

  const data = await res.json().catch(() => null);
  if (!data || typeof data !== 'object') {
    throw new Error('Hall of Fame returned an invalid response');
  }

  if (Array.isArray((data as BackendHallOfFameResponse).cycles)) {
    return data as BackendHallOfFameResponse;
  }

  throw new Error('Hall of Fame returned an unsupported shape');
}

/**
 * GET /public/hall-of-fame/winners/:id
 * Winner detail for deep links from Hall of Fame cards.
 */
export async function apiGetHallOfFameWinner(
    winnerId: string,
): Promise<BackendHallOfFameWinnerDetail | null> {
  const res = await authedFetch(`${API_BASE}/public/hall-of-fame/winners/${winnerId}`);
  if (res.status === 404) return null;
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data || typeof data !== 'object' || typeof (data as BackendHallOfFameWinnerDetail).id !== 'string') {
    return null;
  }
  return data as BackendHallOfFameWinnerDetail;
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
 * GET /public/polls
 * Returns active polls for the community.
 */
export async function apiGetPolls(
    ): Promise<BackendPoll[]> {
  const res = await authedFetch(`${API_BASE}/public/polls`);
  if (!res.ok) throw new Error(`GET /public/polls → ${res.status}`);
  return res.json() as Promise<BackendPoll[]>;
}

/**
 * POST /polls/{poll_id}/vote
 * Casts one vote for the given option. Returns updated poll state.
 * 409 = already voted.
 */
export async function apiVotePoll(
    pollId: string,
  optionId: string,
): Promise<BackendPoll> {
  const res = await authedFetch(`${API_BASE}/polls/${pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option_id: optionId }),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`POST /polls/${pollId}/vote → ${res.status}`);
  }
  return res.json() as Promise<BackendPoll>;
}
