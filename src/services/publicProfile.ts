import { API_BASE_URL as API_BASE } from './index';

export type PublicProfilePost = {
  id: string;
  image_url: string | null;
  created_at: string;
  reaction_count?: number;
};

export type PublicProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
  cover_url: string | null;
  studio_name?: string | null;
  bio?: string | null;
  post_count: number;
  posts: PublicProfilePost[];
};

export class PublicProfileApiError extends Error {
  constructor(
    readonly status: number,
    readonly details: string | null = null,
  ) {
    super(`GET /users/:id/profile → ${status}${details ? `: ${details}` : ''}`);
    this.name = 'PublicProfileApiError';
  }
}

function authedFetch(
  sessionToken: string | null | undefined,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
      ...(sessionToken ? { 'X-Session-Token': sessionToken } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

function normalizePost(raw: Record<string, unknown>): PublicProfilePost | null {
  const id = typeof raw.id === 'string' ? raw.id : null;
  if (!id) return null;

  const assets = Array.isArray(raw.assets) ? raw.assets : [];
  const firstAsset = assets[0] as { url?: string } | undefined;
  const imageUrl =
    (typeof raw.image_url === 'string' ? raw.image_url : null)
    ?? (typeof firstAsset?.url === 'string' ? firstAsset.url : null);

  return {
    id,
    image_url: imageUrl,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString(),
    reaction_count: typeof raw.reaction_count === 'number' ? raw.reaction_count : undefined,
  };
}

function normalizeProfile(body: Record<string, unknown>): PublicProfile {
  const postsRaw = Array.isArray(body.posts) ? body.posts : [];
  const posts = postsRaw
    .map((item) => normalizePost(item as Record<string, unknown>))
    .filter((item): item is PublicProfilePost => item != null);

  return {
    id: String(body.id ?? ''),
    name: typeof body.name === 'string' && body.name.trim() ? body.name : 'Potter',
    avatar_url: typeof body.avatar_url === 'string' ? body.avatar_url : null,
    cover_url: typeof body.cover_url === 'string' ? body.cover_url : null,
    studio_name: typeof body.studio_name === 'string' ? body.studio_name : null,
    bio: typeof body.bio === 'string' ? body.bio : null,
    post_count: typeof body.post_count === 'number' ? body.post_count : posts.length,
    posts,
  };
}

/**
 * GET /users/:userId/profile
 * Public read-only profile for share links. Auth optional.
 */
export async function apiGetPublicProfile(
  userId: string,
  sessionToken?: string | null,
): Promise<PublicProfile> {
  const res = await authedFetch(
    sessionToken,
    `${API_BASE}/users/${encodeURIComponent(userId)}/profile`,
  );

  if (!res.ok) {
    let details: string | null = null;
    try {
      const errBody = (await res.json()) as { error?: string; details?: string | null };
      details = errBody.details ?? errBody.error ?? null;
    } catch {
      // ignore
    }
    throw new PublicProfileApiError(res.status, details);
  }

  const body = (await res.json()) as Record<string, unknown>;
  return normalizeProfile(body);
}
