import {
  apiListMyPosts,
  CommunityApiError,
  type BackendFeedPost,
} from '@/src/services/community';
import { useAppStore } from '@/src/store/appStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  getCachedProfilePosts,
  mergeProfilePosts,
  removeCachedProfilePost,
} from '../utils/profilePostCache';

export const PROFILE_POSTS_QUERY_KEY = ['community', 'myPosts'] as const;

const PROFILE_POSTS_STALE_MS = 2 * 60 * 1000;

async function fetchProfilePosts(): Promise<BackendFeedPost[]> {
  const cached = getCachedProfilePosts();
  try {
    const page = await apiListMyPosts({ limit: 50 });
    const serverPosts = page.items ?? page.posts ?? [];
    return mergeProfilePosts(serverPosts, cached);
  } catch (e) {
    const details = e instanceof CommunityApiError ? e.details : null;
    if (__DEV__) {
      console.warn(
        '[useProfilePosts] GET /users/me/posts failed',
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
  const communityFeedRevision = useAppStore((s) => s.communityFeedRevision);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PROFILE_POSTS_QUERY_KEY,
    queryFn: fetchProfilePosts,
    enabled: isSignedIn,
    staleTime: PROFILE_POSTS_STALE_MS,
    placeholderData: (previous) => previous,
  });

  useFocusEffect(
    useCallback(() => {
      if (!isSignedIn || !query.isStale) return;
      void query.refetch();
    }, [isSignedIn, query.isStale, query.refetch]),
  );

  useEffect(() => {
    if (communityFeedRevision === 0) return;
    void queryClient.invalidateQueries({ queryKey: PROFILE_POSTS_QUERY_KEY });
  }, [communityFeedRevision, queryClient]);

  const reload = useCallback(() => {
    void query.refetch();
  }, [query.refetch]);

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
