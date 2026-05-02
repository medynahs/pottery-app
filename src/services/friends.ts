// Friends API — /users/me/friends
// All endpoints require Authorization: Bearer <token> (Ory session token).

import { API_BASE_URL as API_BASE } from './index';

// ─── Backend types ────────────────────────────────────────────────────────────

export interface BackendUser {
  id: string;
  ory_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string | null;
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'canceled';

export interface BackendFriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendRequestStatus;
  created_at: string;
  responded_at: string | null;
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
 * GET /users/me/friends
 * Returns the current user's confirmed friends.
 */
export async function apiListFriends(sessionToken: string): Promise<BackendUser[]> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/friends`);
  if (!res.ok) return parseError(res, 'GET /users/me/friends');
  return res.json() as Promise<BackendUser[]>;
}

/**
 * DELETE /users/me/friends/{friend_id}
 * Removes a friend. Returns 204 on success.
 */
export async function apiRemoveFriend(
  sessionToken: string,
  friendId: string,
): Promise<void> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/friends/${friendId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) return parseError(res, `DELETE /users/me/friends/${friendId}`);
}

/**
 * POST /users/me/friends/requests
 * Sends a friend request to another user.
 */
export async function apiSendFriendRequest(
  sessionToken: string,
  userId: string,
): Promise<BackendFriendRequest> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/friends/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) return parseError(res, 'POST /users/me/friends/requests');
  return res.json() as Promise<BackendFriendRequest>;
}

/**
 * GET /users/me/friends/requests/incoming
 * Lists pending friend requests received by the current user.
 */
export async function apiListIncomingFriendRequests(
  sessionToken: string,
): Promise<BackendFriendRequest[]> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/friends/requests/incoming`,
  );
  if (!res.ok) return parseError(res, 'GET /users/me/friends/requests/incoming');
  return res.json() as Promise<BackendFriendRequest[]>;
}

/**
 * GET /users/me/friends/requests/outgoing
 * Lists pending friend requests sent by the current user.
 */
export async function apiListOutgoingFriendRequests(
  sessionToken: string,
): Promise<BackendFriendRequest[]> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/friends/requests/outgoing`,
  );
  if (!res.ok) return parseError(res, 'GET /users/me/friends/requests/outgoing');
  return res.json() as Promise<BackendFriendRequest[]>;
}

/**
 * POST /users/me/friends/requests/{request_id}/accept
 * Accepts an incoming friend request. Only the addressee may call this.
 */
export async function apiAcceptFriendRequest(
  sessionToken: string,
  requestId: string,
): Promise<BackendFriendRequest> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/friends/requests/${requestId}/accept`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /users/me/friends/requests/${requestId}/accept`);
  return res.json() as Promise<BackendFriendRequest>;
}

/**
 * POST /users/me/friends/requests/{request_id}/decline
 * Declines an incoming friend request. Only the addressee may call this.
 */
export async function apiDeclineFriendRequest(
  sessionToken: string,
  requestId: string,
): Promise<BackendFriendRequest> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/friends/requests/${requestId}/decline`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /users/me/friends/requests/${requestId}/decline`);
  return res.json() as Promise<BackendFriendRequest>;
}

/**
 * POST /users/me/friends/requests/{request_id}/cancel
 * Cancels an outgoing friend request. Only the requester may call this.
 */
export async function apiCancelFriendRequest(
  sessionToken: string,
  requestId: string,
): Promise<BackendFriendRequest> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/friends/requests/${requestId}/cancel`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /users/me/friends/requests/${requestId}/cancel`);
  return res.json() as Promise<BackendFriendRequest>;
}
