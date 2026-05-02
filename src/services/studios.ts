// Studios API — /users/me/studios
// All endpoints require Authorization: Bearer <token> (Ory session token).

import { API_BASE_URL as API_BASE } from './index';

// ─── Backend types ────────────────────────────────────────────────────────────

export interface BackendStudio {
  id: string;
  name: string;
  avatar_url: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string | null;
}

export type StudioInviteStatus = 'pending' | 'accepted' | 'rejected' | 'canceled';

export interface BackendStudioInvite {
  id: string;
  studio_id: string;
  inviter_id: string;
  invitee_id: string;
  status: StudioInviteStatus;
  created_at: string;
  responded_at: string | null;
}

export type StudioJoinRequestStatus = 'pending' | 'accepted' | 'rejected' | 'canceled';

export interface BackendStudioJoinRequest {
  id: string;
  studio_id: string;
  requester_id: string;
  status: StudioJoinRequestStatus;
  created_at: string;
  responded_at: string | null;
}

// Re-export BackendUser from friends so callers only need one import.
export type { BackendUser } from './friends';

// ─── Request payloads ────────────────────────────────────────────────────────

export interface CreateStudioPayload {
  name: string;
  avatar_url?: string;
}

// ─── API error ────────────────────────────────────────────────────────────────

export class StudiosApiError extends Error {
  constructor(
    readonly status: number,
    readonly endpoint: string,
    readonly details: string | null = null,
  ) {
    super(`${endpoint} → ${status}${details ? `: ${details}` : ''}`);
    this.name = 'StudiosApiError';
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

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
    const body = (await res.json()) as { error?: string; details?: string | null };
    details = body.details ?? body.error ?? null;
  } catch {
    // ignore parse failure
  }
  throw new StudiosApiError(res.status, endpoint, details);
}

// ─── Studio CRUD ──────────────────────────────────────────────────────────────

/**
 * POST /users/me/studios
 * Creates a new studio. The caller automatically becomes the owner.
 */
export async function apiCreateStudio(
  sessionToken: string,
  payload: CreateStudioPayload,
): Promise<BackendStudio> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/studios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return parseError(res, 'POST /users/me/studios');
  return res.json() as Promise<BackendStudio>;
}

/**
 * GET /users/me/studios/owned
 * Lists studios where the caller is the owner.
 */
export async function apiListOwnedStudios(
  sessionToken: string,
): Promise<BackendStudio[]> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/studios/owned`);
  if (!res.ok) return parseError(res, 'GET /users/me/studios/owned');
  return res.json() as Promise<BackendStudio[]>;
}

/**
 * GET /users/me/studios/member-of
 * Lists studios where the caller is a member (not owner).
 */
export async function apiListMemberStudios(
  sessionToken: string,
): Promise<BackendStudio[]> {
  const res = await authedFetch(sessionToken, `${API_BASE}/users/me/studios/member-of`);
  if (!res.ok) return parseError(res, 'GET /users/me/studios/member-of');
  return res.json() as Promise<BackendStudio[]>;
}

/**
 * DELETE /users/me/studios/{studio_id}
 * Deletes a studio. Owner only. Returns 204 on success.
 */
export async function apiDeleteStudio(
  sessionToken: string,
  studioId: string,
): Promise<void> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/${studioId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) return parseError(res, `DELETE /users/me/studios/${studioId}`);
}

/**
 * POST /users/me/studios/{studio_id}/leave
 * Leave a studio. Non-owner members only (owner must delete instead). Returns 204.
 */
export async function apiLeaveStudio(
  sessionToken: string,
  studioId: string,
): Promise<void> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/${studioId}/leave`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /users/me/studios/${studioId}/leave`);
}

// ─── Studio members ───────────────────────────────────────────────────────────

/**
 * GET /users/me/studios/{studio_id}/members
 * Lists members of a studio. Caller must be a member.
 */
export async function apiListStudioMembers(
  sessionToken: string,
  studioId: string,
): Promise<import('./friends').BackendUser[]> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/${studioId}/members`,
  );
  if (!res.ok) return parseError(res, `GET /users/me/studios/${studioId}/members`);
  return res.json() as Promise<import('./friends').BackendUser[]>;
}

/**
 * POST /users/me/studios/{studio_id}/members
 * Adds a member directly (owner only). Returns 204.
 */
export async function apiAddStudioMember(
  sessionToken: string,
  studioId: string,
  userId: string,
): Promise<void> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/${studioId}/members`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    },
  );
  if (!res.ok) return parseError(res, `POST /users/me/studios/${studioId}/members`);
}

// ─── Studio invites ───────────────────────────────────────────────────────────

/**
 * POST /users/me/studios/{studio_id}/invites
 * Invites a user to the studio. Owner only.
 */
export async function apiInviteToStudio(
  sessionToken: string,
  studioId: string,
  userId: string,
): Promise<BackendStudioInvite> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/${studioId}/invites`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    },
  );
  if (!res.ok) return parseError(res, `POST /users/me/studios/${studioId}/invites`);
  return res.json() as Promise<BackendStudioInvite>;
}

/**
 * GET /users/me/studios/invites/incoming
 * Lists pending studio invites for the caller.
 */
export async function apiListIncomingStudioInvites(
  sessionToken: string,
): Promise<BackendStudioInvite[]> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/invites/incoming`,
  );
  if (!res.ok) return parseError(res, 'GET /users/me/studios/invites/incoming');
  return res.json() as Promise<BackendStudioInvite[]>;
}

/**
 * POST /users/me/studios/invites/{invite_id}/accept
 * Accepts a studio invite.
 */
export async function apiAcceptStudioInvite(
  sessionToken: string,
  inviteId: string,
): Promise<BackendStudioInvite> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/invites/${inviteId}/accept`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /users/me/studios/invites/${inviteId}/accept`);
  return res.json() as Promise<BackendStudioInvite>;
}

/**
 * POST /users/me/studios/invites/{invite_id}/reject
 * Rejects a studio invite.
 */
export async function apiRejectStudioInvite(
  sessionToken: string,
  inviteId: string,
): Promise<BackendStudioInvite> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/invites/${inviteId}/reject`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /users/me/studios/invites/${inviteId}/reject`);
  return res.json() as Promise<BackendStudioInvite>;
}

// ─── Studio join requests ─────────────────────────────────────────────────────

/**
 * POST /users/me/studios/{studio_id}/join-requests
 * Requests to join a studio.
 */
export async function apiRequestToJoinStudio(
  sessionToken: string,
  studioId: string,
): Promise<BackendStudioJoinRequest> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/${studioId}/join-requests`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /users/me/studios/${studioId}/join-requests`);
  return res.json() as Promise<BackendStudioJoinRequest>;
}

/**
 * GET /users/me/studios/join-requests/incoming
 * Lists pending join requests for studios the caller owns.
 */
export async function apiListIncomingJoinRequests(
  sessionToken: string,
): Promise<BackendStudioJoinRequest[]> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/join-requests/incoming`,
  );
  if (!res.ok) return parseError(res, 'GET /users/me/studios/join-requests/incoming');
  return res.json() as Promise<BackendStudioJoinRequest[]>;
}

/**
 * POST /users/me/studios/join-requests/{request_id}/accept
 * Accepts a join request. Owner only.
 */
export async function apiAcceptJoinRequest(
  sessionToken: string,
  requestId: string,
): Promise<BackendStudioJoinRequest> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/join-requests/${requestId}/accept`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /users/me/studios/join-requests/${requestId}/accept`);
  return res.json() as Promise<BackendStudioJoinRequest>;
}

/**
 * POST /users/me/studios/join-requests/{request_id}/reject
 * Rejects a join request. Owner only.
 */
export async function apiRejectJoinRequest(
  sessionToken: string,
  requestId: string,
): Promise<BackendStudioJoinRequest> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/me/studios/join-requests/${requestId}/reject`,
    { method: 'POST' },
  );
  if (!res.ok) return parseError(res, `POST /users/me/studios/join-requests/${requestId}/reject`);
  return res.json() as Promise<BackendStudioJoinRequest>;
}
