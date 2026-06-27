import type { BackendFeedPost } from '@/src/services/community';
import {
  cacheProfilePost,
  getCachedProfilePosts,
  mergeProfilePosts,
  removeCachedProfilePost,
} from '@/src/screens/overview/profile/utils/profilePostCache';
import type { QueryClient } from '@tanstack/react-query';
import { FOR_YOU_FEED_QUERY_KEY, PROFILE_POSTS_QUERY_KEY } from '../queryKeys';

export type ForYouFeedSnapshot = {
  posts: BackendFeedPost[];
  nextCursor: string | null;
  discoverAvailable: boolean;
};

export function seedProfilePostsCache(
  queryClient: QueryClient,
  serverPosts: BackendFeedPost[],
): void {
  queryClient.setQueryData(
    PROFILE_POSTS_QUERY_KEY,
    mergeProfilePosts(serverPosts, getCachedProfilePosts()),
  );
}

export function prependCommunityPost(queryClient: QueryClient, post: BackendFeedPost): void {
  cacheProfilePost(post);

  queryClient.setQueryData<BackendFeedPost[]>(PROFILE_POSTS_QUERY_KEY, (prev) => {
    const base = prev ?? [];
    return [post, ...base.filter((p) => p.id !== post.id)];
  });

  queryClient.setQueryData<ForYouFeedSnapshot>(FOR_YOU_FEED_QUERY_KEY, (prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      posts: [post, ...prev.posts.filter((p) => p.id !== post.id)],
    };
  });
}

export function removeCommunityPostFromCaches(queryClient: QueryClient, postId: string): void {
  removeCachedProfilePost(postId);
  queryClient.setQueryData<BackendFeedPost[]>(PROFILE_POSTS_QUERY_KEY, (prev) =>
    prev?.filter((post) => post.id !== postId),
  );
  queryClient.setQueryData<ForYouFeedSnapshot>(FOR_YOU_FEED_QUERY_KEY, (prev) =>
    prev ? { ...prev, posts: prev.posts.filter((post) => post.id !== postId) } : prev,
  );
}
