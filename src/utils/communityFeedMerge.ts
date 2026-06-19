import type { BackendFeedPost } from '@/src/services/community';

/** Merge own posts with friends feed — own posts first, deduped by id. */
export function mergeCommunityFeedPosts(
  myPosts: BackendFeedPost[],
  friendsPosts: BackendFeedPost[],
): BackendFeedPost[] {
  const seen = new Set<string>();
  const merged: BackendFeedPost[] = [];

  const push = (post: BackendFeedPost) => {
    if (seen.has(post.id)) return;
    seen.add(post.id);
    merged.push(post);
  };

  [...myPosts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .forEach(push);

  [...friendsPosts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .forEach(push);

  return merged.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
