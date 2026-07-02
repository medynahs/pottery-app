// Friends API, /me/friends
// All endpoints require Authorization: Bearer <token> (SuperTokens session token).

import { API_BASE_URL as API_BASE } from './index';

// ─── Backend types ────────────────────────────────────────────────────────────

export interface BackendUser {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  cover_url?: string | null;
  studio_name?: string | null;
  location?: string | null;
  bio?: string | null;
  profile_public?: boolean;
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
 * Accepts an incoming friend request. Only the addressee may call this.
 */
export async function apiAcceptFriendRequest(
    requestId: string,
): Promise<BackendFriendRequest> {
  const res = await authedFetch(
    `${API_BASE}/me/friends/requests/${requestId}/accept`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /me/friends/requests/${requestId}/accept`);
  return res.json() as Promise<BackendFriendRequest>;
}

/**
 * POST /me/friends/requests/{request_id}/decline
 * Declines an incoming friend request. Only the addressee may call this.
 */
export async function apiDeclineFriendRequest(
    requestId: string,
): Promise<BackendFriendRequest> {
  const res = await authedFetch(
    `${API_BASE}/me/friends/requests/${requestId}/decline`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /me/friends/requests/${requestId}/decline`);
  return res.json() as Promise<BackendFriendRequest>;
}

/**
 * POST /me/friends/requests/{request_id}/cancel
 * Cancels an outgoing friend request. Only the requester may call this.
 */
export async function apiCancelFriendRequest(
    requestId: string,
): Promise<BackendFriendRequest> {
  const res = await authedFetch(
    `${API_BASE}/me/friends/requests/${requestId}/cancel`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /me/friends/requests/${requestId}/cancel`);
  return res.json() as Promise<BackendFriendRequest>;
}
