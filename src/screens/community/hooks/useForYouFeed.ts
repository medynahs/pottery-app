import {
  apiGetDiscoverFeed,
  apiGetFeed,
  apiListMyPosts,
  CommunityApiError,
  type BackendFeedPost,
  type FeedPage,
} from '@/src/services/community';
import { mergeForYouFeedPosts } from '@/src/utils/communityFeedMerge';
import { markAccountDeletionGraceFromError } from '@/src/services/accountGrace';
import { useAppStore } from '@/src/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const FOR_YOU_FEED_QUERY_KEY = ['community', 'forYou'] as const;

export type ForYouFeedSnapshot = {
  posts: BackendFeedPost[];
  nextCursor: string | null;
  discoverAvailable: boolean;
};

export async function fetchFriendsFeedPage(cursor?: string): Promise<FeedPage> {
  return fetchFeedPageSafe('GET /users/me/feed', () => apiGetFeed({ limit: 20, cursor }));
}

function isFeedServerError(error: unknown): boolean {
  return error instanceof CommunityApiError && error.status === 500;
}

const EMPTY_FEED_PAGE: FeedPage = { items: [], posts: [], next_cursor: null };

async function fetchFeedPageSafe(
  label: string,
  fetcher: () => Promise<FeedPage>,
): Promise<FeedPage> {
  try {
    return await fetcher();
  } catch (error) {
    if (isFeedServerError(error)) {
      if (__DEV__) {
        console.warn(`[forYouFeed] ${label} unavailable (server)`, (error as Error).message);
      }
      return EMPTY_FEED_PAGE;
    }
    throw error;
  }
}

async function fetchForYouFeedFirstPage(): Promise<ForYouFeedSnapshot> {
  const friendsPage = await fetchFriendsFeedPage();
  const friendsPosts = friendsPage.items ?? friendsPage.posts ?? [];

  const [myPage, discoverPage] = await Promise.all([
    fetchFeedPageSafe('GET /users/me/posts', () => apiListMyPosts({ limit: 20 })),
    apiGetDiscoverFeed({ limit: 20 }),
  ]);
  const myPosts = myPage.items ?? myPage.posts ?? [];
  const discoverPosts = discoverPage?.items ?? discoverPage?.posts ?? [];

  return {
    posts: mergeForYouFeedPosts(myPosts, discoverPosts, friendsPosts),
    nextCursor: friendsPage.next_cursor,
    discoverAvailable: discoverPosts.length > 0,
  };
}

function isRateLimited(error: unknown): boolean {
  return error instanceof CommunityApiError && error.status === 429;
}

export function useForYouFeed(refreshKey: number) {
  const queryClient = useQueryClient();
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const communityFeedRevision = useAppStore((s) => s.communityFeedRevision);

  const query = useQuery({
    queryKey: FOR_YOU_FEED_QUERY_KEY,
    queryFn: () => fetchForYouFeedFirstPage(),
    enabled: isSignedIn,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previous) => previous,
    retry: (failureCount, error) => {
      if (isRateLimited(error)) return failureCount < 4;
      return failureCount < 1;
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  useEffect(() => {
    if (!query.error) return;
    const setGrace = useAppStore.getState().setAccountDeletionGrace;
    markAccountDeletionGraceFromError(query.error, setGrace);
  }, [query.error]);

  useEffect(() => {
    if (!isSignedIn || refreshKey === 0) return;
    void queryClient.invalidateQueries({ queryKey: FOR_YOU_FEED_QUERY_KEY });
  }, [refreshKey, isSignedIn, queryClient]);

  useEffect(() => {
    if (!isSignedIn || communityFeedRevision === 0) return;
    void queryClient.invalidateQueries({ queryKey: FOR_YOU_FEED_QUERY_KEY });
  }, [communityFeedRevision, isSignedIn, queryClient]);

  return query;
}
