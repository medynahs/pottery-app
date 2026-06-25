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
  studio_name?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  role: string;
  profile_public?: boolean;
  pieces_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  name?: string;
  studio_name?: string;
  location?: string;
  bio?: string;
}

/** @deprecated Use UpdateProfilePayload */
export type UpdateMePayload = UpdateProfilePayload;

export interface UpdatePrivacyPayload {
  profile_public?: boolean;
  pieces_public?: boolean;
}

type UserStorePatch = {
  name?: string;
  avatarInitial?: string;
  studioName?: string;
  location?: string;
  bio?: string;
  avatarImageUri?: string;
  coverImageUri?: string;
};

/** Map GET/PUT /users/me response fields into local Zustand user shape. */
export function userPatchFromBackendProfile(
  profile: BackendProfile,
  emailFallback?: string,
): UserStorePatch {
  const patch: UserStorePatch = {};
  if (profile.name !== undefined && profile.name !== null) {
    const displayName = profile.name.trim();
    if (displayName) {
      patch.name = displayName;
      patch.avatarInitial = displayName[0].toUpperCase();
    }
  } else if (emailFallback) {
    patch.avatarInitial = emailFallback[0].toUpperCase();
  }
  if (profile.studio_name !== undefined) {
    patch.studioName = profile.studio_name?.trim() || undefined;
  }
  if (profile.location !== undefined) {
    patch.location = profile.location?.trim() || undefined;
  }
  if (profile.bio !== undefined) {
    patch.bio = profile.bio?.trim() || undefined;
  }
  if (profile.avatar_url !== undefined && profile.avatar_url !== null) {
    patch.avatarImageUri = profile.avatar_url;
  }
  if (profile.cover_url !== undefined && profile.cover_url !== null) {
    patch.coverImageUri = profile.cover_url;
  }
  return patch;
}

/** Returns the avatar URL suitable for <Image source={{ uri }} /> */
export function avatarDataUri(profile: BackendProfile): string | null {
  return profile.avatar_url ?? null;
}

function authedJson(
  sessionToken: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
      'X-Session-Token': sessionToken,
      ...(init?.headers ?? {}),
    },
  });
}

export async function fetchMe(sessionToken: string): Promise<BackendProfile> {
  const res = await authedJson(sessionToken, '/users/me');
  if (!res.ok) throw new ApiError(`fetchMe failed (${res.status})`, res.status);
  return res.json() as Promise<BackendProfile>;
}

/** PUT /users/me — partial update of name, studio, location, bio. */
export async function updateProfile(
  sessionToken: string,
  payload: UpdateProfilePayload,
): Promise<BackendProfile> {
  const res = await authedJson(sessionToken, '/users/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(
      body ? `updateProfile failed (${res.status}): ${body}` : `updateProfile failed (${res.status})`,
      res.status,
    );
  }
  return res.json() as Promise<BackendProfile>;
}

/** @deprecated Use updateProfile */
export const updateMe = updateProfile;

/** PUT /users/me/privacy — profile_public and pieces_public enforcement on share. */
export async function updatePrivacy(
  sessionToken: string,
  payload: UpdatePrivacyPayload,
): Promise<BackendProfile> {
  const res = await authedJson(sessionToken, '/users/me/privacy', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(
      body ? `updatePrivacy failed (${res.status}): ${body}` : `updatePrivacy failed (${res.status})`,
      res.status,
    );
  }
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
