// Friends API, /me/friends
// All endpoints require Authorization: Bearer <token> (SuperTokens session token).

import { API_BASE_URL as API_BASE } from './index';

// ─── Backend types ────────────────────────────────────────────────────────────

// Cross-user projection: the API's PublicUser. Email/auth_id/role only exist
// on the /me payload (BackendProfile).
export interface BackendUser {
  id: string;
  name: string;
  avatar_url?: string | null;
  studio_name?: string | null;
  location?: string | null;
  bio?: string | null;
}

// A request only exists while pending: responding (accept/decline/cancel)
// deletes it server-side, so there is no status field.
export interface BackendFriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  created_at: string;
}

export interface ErrorResponse {
  error: string;
  details: string | null;
}

// ─── API error ────────────────────────────────────────────────────────────────

export class FriendsApiError extends Error {
  constructor(
    readonly status: number,
    readonly endpoint: string,
    readonly details: string | null = null,
  ) {
    super(`${endpoint} → ${status}${details ? `: ${details}` : ''}`);
    this.name = 'FriendsApiError';
  }
}

// ─── Internal helper ──────────────────────────────────────────────────────────

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

async function parseError(res: Response, endpoint: string): Promise<never> {
  let details: string | null = null;
  try {
    const body = (await res.json()) as ErrorResponse;
    details = body.details ?? body.error ?? null;
  } catch {
    // ignore parse failure
  }
  throw new FriendsApiError(res.status, endpoint, details);
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /me/friends
 * Returns the current user's confirmed friends.
 */
export async function apiListFriends(
    ): Promise<BackendUser[]> {
  const res = await authedFetch(`${API_BASE}/me/friends`);
  if (!res.ok) return parseError(res, 'GET /me/friends');
  return res.json() as Promise<BackendUser[]>;
}

/**
 * DELETE /me/friends/{friend_id}
 * Removes a friend. Returns 204 on success.
 */
export async function apiRemoveFriend(
    friendId: string,
): Promise<void> {
  const res = await authedFetch(
    `${API_BASE}/me/friends/${friendId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) return parseError(res, `DELETE /me/friends/${friendId}`);
}

/**
 * POST /me/friends/requests
 * Sends a friend request to another user.
 */
export async function apiSendFriendRequest(
    userId: string,
): Promise<BackendFriendRequest> {
  const res = await authedFetch(`${API_BASE}/me/friends/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) return parseError(res, 'POST /me/friends/requests');
  return res.json() as Promise<BackendFriendRequest>;
}

/**
 * GET /me/friends/requests/incoming
 * Lists pending friend requests received by the current user.
 */
export async function apiListIncomingFriendRequests(
  ): Promise<BackendFriendRequest[]> {
  const res = await authedFetch(
    `${API_BASE}/me/friends/requests/incoming`,
  );
  if (!res.ok) return parseError(res, 'GET /me/friends/requests/incoming');
  return res.json() as Promise<BackendFriendRequest[]>;
}

/**
 * GET /me/friends/requests/outgoing
 * Lists pending friend requests sent by the current user.
 */
export async function apiListOutgoingFriendRequests(
  ): Promise<BackendFriendRequest[]> {
  const res = await authedFetch(
    `${API_BASE}/me/friends/requests/outgoing`,
  );
  if (!res.ok) return parseError(res, 'GET /me/friends/requests/outgoing');
  return res.json() as Promise<BackendFriendRequest[]>;
}

/**
 * POST /me/friends/requests/{request_id}/accept
 * Accepts an incoming friend request (204; the request row is deleted).
 */
export async function apiAcceptFriendRequest(
    requestId: string,
): Promise<void> {
  const res = await authedFetch(
    `${API_BASE}/me/friends/requests/${requestId}/accept`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /me/friends/requests/${requestId}/accept`);
}

/**
 * POST /me/friends/requests/{request_id}/decline
 * Declines an incoming friend request (204; the request row is deleted).
 */
export async function apiDeclineFriendRequest(
    requestId: string,
): Promise<void> {
  const res = await authedFetch(
    `${API_BASE}/me/friends/requests/${requestId}/decline`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /me/friends/requests/${requestId}/decline`);
}

/**
 * POST /me/friends/requests/{request_id}/cancel
 * Cancels an outgoing friend request (204; the request row is deleted).
 */
export async function apiCancelFriendRequest(
    requestId: string,
): Promise<void> {
  const res = await authedFetch(
    `${API_BASE}/me/friends/requests/${requestId}/cancel`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /me/friends/requests/${requestId}/cancel`);
}
