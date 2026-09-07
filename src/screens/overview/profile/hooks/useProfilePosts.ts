import { defaultQueryRetry, STABLE_QUERY_OPTIONS } from '@/src/lib/queryRetry';
import type { ForYouFeedSnapshot } from '@/src/screens/community/hooks/useForYouFeed';
import { FOR_YOU_FEED_QUERY_KEY, PROFILE_POSTS_QUERY_KEY } from '@/src/screens/community/queryKeys';
import {
    apiListMyPosts,
    CommunityApiError,
    type BackendFeedPost,
} from '@/src/services/community';
import { useAppStore } from '@/src/store/appStore';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
    getCachedProfilePosts,
    mergeProfilePosts,
    removeCachedProfilePost,
} from '../utils/profilePostCache';

export { PROFILE_POSTS_QUERY_KEY } from '@/src/screens/community/queryKeys';

const PROFILE_POSTS_STALE_MS = 10 * 60 * 1000;

async function fetchProfilePosts(queryClient: QueryClient): Promise<BackendFeedPost[]> {
  const cached = getCachedProfilePosts();

  const forYou = queryClient.getQueryData<ForYouFeedSnapshot>(FOR_YOU_FEED_QUERY_KEY);
  const backendUserId = useAppStore.getState().backendUserId;
  if (forYou?.posts?.length && backendUserId) {
    const fromFeed = forYou.posts.filter((post) => post.user_id === backendUserId);
    if (fromFeed.length > 0) {
      return mergeProfilePosts(fromFeed, cached);
    }
  }

  try {
    const page = await apiListMyPosts({ limit: 50 });
    const serverPosts = page.items ?? page.posts ?? [];
    return mergeProfilePosts(serverPosts, cached);
  } catch (e) {
    const details = e instanceof CommunityApiError ? e.details : null;
    if (__DEV__) {
      console.warn(
        '[useProfilePosts] GET /me/posts failed',
        e instanceof CommunityApiError ? e.message : e,
        details ? `(${details})` : '',
      );
    }
    if (cached.length > 0) return cached;
    throw e;
  }
}

export function useProfilePosts() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PROFILE_POSTS_QUERY_KEY,
    queryFn: () => fetchProfilePosts(queryClient),
    enabled: isSignedIn,
    staleTime: PROFILE_POSTS_STALE_MS,
    placeholderData: (previous) => previous,
    retry: defaultQueryRetry,
    ...STABLE_QUERY_OPTIONS,
  });

  const reload = useCallback(() => {
    void queryClient.refetchQueries({ queryKey: PROFILE_POSTS_QUERY_KEY });
  }, [queryClient]);

  const removePost = useCallback(
    (postId: string) => {
      removeCachedProfilePost(postId);
      queryClient.setQueryData<BackendFeedPost[]>(PROFILE_POSTS_QUERY_KEY, (prev) =>
        prev?.filter((post) => post.id !== postId),
      );
    },
    [queryClient],
  );

  return {
    posts: query.data ?? [],
    loading: query.isLoading,
    isReloading: query.isFetching && !query.isLoading,
    reload,
    removePost,
  };
}
