import { API_BASE_URL as API_BASE } from './index';

/** HTTP error from the app backend, carries the status code so callers can
 *  react to specific failures (e.g. 401 → expired session → sign out). */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface BackendProfile {
  id: string;
  ory_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  studio_name: string | null;
  location: string | null;
  bio: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

/** Returns the avatar URL suitable for <Image source={{ uri }} /> */
export function avatarDataUri(profile: BackendProfile): string | null {
  return profile.avatar_url ?? null;
}

export async function fetchMe(sessionToken: string): Promise<BackendProfile> {
  const res = await fetch(`${API_BASE}/users/me`, {
    credentials: 'omit',
    headers: { 'X-Session-Token': sessionToken },
  });
  if (!res.ok) throw new ApiError(`fetchMe failed (${res.status})`, res.status);
  return res.json() as Promise<BackendProfile>;
}

/**
 * Permanently deletes the signed-in user's account and all associated data.
 * The backend cascades to pieces, firings, glazes and removes the Ory identity.
 * Throws on any non-2xx response, callers must NOT clear the local session
 * unless this succeeds, otherwise deletion silently degrades to a sign-out.
 */
export async function deleteAccount(sessionToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'DELETE',
    credentials: 'omit',
    headers: { 'X-Session-Token': sessionToken },
  });
  if (!res.ok) throw new ApiError(`Account deletion failed (${res.status})`, res.status);
}

async function uploadUserImage(
  kind: 'avatar' | 'cover',
  sessionToken: string,
  imageUri: string,
  mimeType = 'image/jpeg',
): Promise<BackendProfile> {
  // Strip query params / fragments before extracting extension
  const cleanUri = imageUri.split('?')[0].split('#')[0];
  const ext = cleanUri.split('.').pop() ?? 'jpg';
  const form = new FormData();
  form.append('image', {
    uri: imageUri,
    name: `${kind}.${ext}`,
    type: mimeType,
  } as unknown as Blob);

  const res = await fetch(`${API_BASE}/users/me/${kind}`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'X-Session-Token': sessionToken },
    // Do NOT set Content-Type, let fetch inject the multipart boundary automatically
    body: form as unknown as BodyInit_,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${kind === 'avatar' ? 'Avatar' : 'Cover'} upload failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<BackendProfile>;
}

export async function uploadAvatar(
  sessionToken: string,
  imageUri: string,
  mimeType = 'image/jpeg',
): Promise<BackendProfile> {
  return uploadUserImage('avatar', sessionToken, imageUri, mimeType);
}

export async function uploadCover(
  sessionToken: string,
  imageUri: string,
  mimeType = 'image/jpeg',
): Promise<BackendProfile> {
  return uploadUserImage('cover', sessionToken, imageUri, mimeType);
}

export interface UpdateMePayload {
  name?: string;
  studio_name?: string;
  location?: string;
  bio?: string;
}

export async function updateMe(
  sessionToken: string,
  payload: UpdateMePayload,
): Promise<BackendProfile> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'PUT',
    credentials: 'omit',
    headers: { 'X-Session-Token': sessionToken, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new ApiError(`updateMe failed (${res.status})`, res.status);
  return res.json() as Promise<BackendProfile>;
}

export interface UpdatePrivacyPayload {
  profile_public?: boolean;
  pieces_public?: boolean;
}

export async function updatePrivacy(
  sessionToken: string,
  payload: UpdatePrivacyPayload,
): Promise<BackendProfile> {
  const res = await fetch(`${API_BASE}/users/me/privacy`, {
    method: 'PUT',
    credentials: 'omit',
    headers: { 'X-Session-Token': sessionToken, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new ApiError(`updatePrivacy failed (${res.status})`, res.status);
  return res.json() as Promise<BackendProfile>;
}

export async function registerPushToken(
  sessionToken: string,
  token: string,
  platform: 'ios' | 'android',
): Promise<void> {
  const res = await fetch(`${API_BASE}/users/me/push-tokens`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'X-Session-Token': sessionToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform }),
  });
  if (!res.ok) throw new ApiError(`registerPushToken failed (${res.status})`, res.status);
}

export async function reviveAccount(sessionToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/me/revive`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'X-Session-Token': sessionToken },
  });
  if (!res.ok) throw new ApiError(`reviveAccount failed (${res.status})`, res.status);
}


