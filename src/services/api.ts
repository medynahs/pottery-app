const API_BASE = 'https://kilnkins.onrender.com';

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
  if (!res.ok) throw new Error(`fetchMe failed (${res.status})`);
  return res.json() as Promise<BackendProfile>;
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


