import { API_BASE_URL as API_BASE } from './index';

/** HTTP error from the app backend, carries the status code so callers can
 *  react to specific failures (e.g. 401 → expired session → sign out). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const ACCOUNT_DELETED_CODE = 'account_deleted';

export function isAccountDeletedError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 403) return false;
  if (error.code === ACCOUNT_DELETED_CODE) return true;
  return error.message.includes(ACCOUNT_DELETED_CODE);
}

export async function apiErrorFromResponse(res: Response, prefix: string): Promise<ApiError> {
  const body = await res.text().catch(() => '');
  let code: string | undefined;

  if (body) {
    try {
      const json = JSON.parse(body) as Record<string, unknown>;
      const candidates = [json.error, json.code, json.message, json.detail];
      for (const candidate of candidates) {
        if (typeof candidate !== 'string') continue;
        const normalized = candidate.toLowerCase();
        if (
          normalized.includes(ACCOUNT_DELETED_CODE)
          || normalized.includes('account deleted')
          || normalized.includes('scheduled for deletion')
        ) {
          code = ACCOUNT_DELETED_CODE;
          break;
        }
      }
    } catch {
      const normalized = body.toLowerCase();
      if (
        normalized.includes(ACCOUNT_DELETED_CODE)
        || normalized.includes('account deleted')
        || normalized.includes('scheduled for deletion')
      ) {
        code = ACCOUNT_DELETED_CODE;
      }
    }
  }

  const message = body ? `${prefix} (${res.status}): ${body}` : `${prefix} (${res.status})`;
  return new ApiError(message, res.status, code);
}

export interface BackendProfile {
  id: string;
  auth_id: string;
  email: string;
  name: string | null;
  studio_name?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  role: string;
  profile_public?: boolean;
  created_at: string;
  updated_at: string;
  /** When the account was soft-deleted; hard purge runs 30 days later. */
  deleted_at?: string | null;
  /** Present when account is in soft-delete grace — studio APIs are blocked until revive. */
  is_deleted?: boolean;
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

/** Map GET/PUT /me response fields into local Zustand user shape. */
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

function authedJson(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

export async function fetchMe(): Promise<BackendProfile> {
  const res = await authedJson('/me');
  if (!res.ok) throw await apiErrorFromResponse(res, 'fetchMe failed');
  return res.json() as Promise<BackendProfile>;
}

/** PUT /me — partial update of name, studio, location, bio. */
export async function updateProfile(payload: UpdateProfilePayload): Promise<BackendProfile> {
  const res = await authedJson('/me', {
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

/** PUT /me/privacy — profile_public toggle (whole-profile discoverability). */
export async function updatePrivacy(payload: UpdatePrivacyPayload): Promise<BackendProfile> {
  const res = await authedJson('/me/privacy', {
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

export async function deleteAccount(): Promise<void> {
  const res = await fetch(`${API_BASE}/me`, { method: 'DELETE' });
  if (!res.ok) throw await apiErrorFromResponse(res, 'Account deletion failed');
}

async function uploadUserImage(
  kind: 'avatar' | 'cover',
  imageUri: string,
  mimeType = 'image/jpeg',
): Promise<BackendProfile> {
  const cleanUri = imageUri.split('?')[0].split('#')[0];
  const ext = cleanUri.split('.').pop() ?? 'jpg';
  const form = new FormData();
  form.append('image', {
    uri: imageUri,
    name: `${kind}.${ext}`,
    type: mimeType,
  } as unknown as Blob);

  const res = await fetch(`${API_BASE}/me/${kind}`, {
    method: 'POST',
    body: form as unknown as BodyInit_,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${kind === 'avatar' ? 'Avatar' : 'Cover'} upload failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<BackendProfile>;
}

export async function uploadAvatar(imageUri: string, mimeType = 'image/jpeg'): Promise<BackendProfile> {
  return uploadUserImage('avatar', imageUri, mimeType);
}

export async function uploadCover(imageUri: string, mimeType = 'image/jpeg'): Promise<BackendProfile> {
  return uploadUserImage('cover', imageUri, mimeType);
}

export async function registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
  const res = await fetch(`${API_BASE}/me/push-tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform }),
  });
  if (!res.ok) throw new ApiError(`registerPushToken failed (${res.status})`, res.status);
}

export async function reviveAccount(): Promise<void> {
  const res = await fetch(`${API_BASE}/me/revive`, { method: 'POST' });
  if (!res.ok) throw new ApiError(`reviveAccount failed (${res.status})`, res.status);
}
