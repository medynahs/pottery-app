import type { BackendFeedPost } from '@/src/services/community';

function sortByRecency(posts: BackendFeedPost[]): BackendFeedPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function dedupePosts(...groups: BackendFeedPost[][]): BackendFeedPost[] {
  const seen = new Set<string>();
  const merged: BackendFeedPost[] = [];

  for (const group of groups) {
    for (const post of sortByRecency(group)) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      merged.push(post);
    }
  }

  return sortByRecency(merged);
}

/** Merge own posts with friends feed, own posts first, deduped by id. */
export function mergeCommunityFeedPosts(
  myPosts: BackendFeedPost[],
  friendsPosts: BackendFeedPost[],
): BackendFeedPost[] {
  return dedupePosts(myPosts, friendsPosts);
}

/** Merge own, public discover, and friends posts for the For You tab. */
export function mergeForYouFeedPosts(
  myPosts: BackendFeedPost[],
  discoverPosts: BackendFeedPost[],
  friendsPosts: BackendFeedPost[],
): BackendFeedPost[] {
  return dedupePosts(myPosts, discoverPosts, friendsPosts);
}

/** True when the feed has little to scroll — show welcome hub and seed tips. */
export function isSparseCommunityFeed(
  posts: BackendFeedPost[],
  opts?: { maxPosts?: number },
): boolean {
  const maxPosts = opts?.maxPosts ?? 3;
  return posts.length <= maxPosts;
}
