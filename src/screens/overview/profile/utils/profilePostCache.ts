import type { BackendFeedPost } from '@/src/services/community';

/** Session cache for posts created while GET /users/me/posts is broken server-side. */
let cachedPosts: BackendFeedPost[] = [];

export function cacheProfilePost(post: BackendFeedPost): void {
  cachedPosts = [post, ...cachedPosts.filter((p) => p.id !== post.id)].slice(0, 30);
}

export function getCachedProfilePosts(): BackendFeedPost[] {
  return cachedPosts;
}

export function mergeProfilePosts(
  serverPosts: BackendFeedPost[],
  cached: BackendFeedPost[],
): BackendFeedPost[] {
  const seen = new Set(serverPosts.map((p) => p.id));
  const extras = cached.filter((p) => !seen.has(p.id));
  return [...extras, ...serverPosts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
