import { API_BASE_URL as API_BASE } from './index';

/** HTTP error from the app backend — carries the status code so callers can
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
 * Throws on any non-2xx response — callers must NOT clear the local session
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

export async function uploadAvatar(
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
    name: `avatar.${ext}`,
    type: mimeType,
  } as unknown as Blob);

  const res = await fetch(`${API_BASE}/users/me/avatar`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'X-Session-Token': sessionToken },
    // Do NOT set Content-Type — let fetch inject the multipart boundary automatically
    body: form as unknown as BodyInit_,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Avatar upload failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<BackendProfile>;
}


