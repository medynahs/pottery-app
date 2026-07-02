import {
  apiGetDiscoverFeed,
  apiGetFeed,
  apiListMyPosts,
  CommunityApiError,
  type BackendFeedPost,
  type FeedPage,
} from '@/src/services/community';
import { mergeForYouFeedPosts, isSparseCommunityFeed } from '@/src/utils/communityFeedMerge';
import { markAccountDeletionGraceFromError } from '@/src/services/accountGrace';
import {
  getCachedProfilePosts,
  mergeProfilePosts,
} from '@/src/screens/overview/profile/utils/profilePostCache';
import { seedProfilePostsCache, type ForYouFeedSnapshot } from '@/src/screens/community/utils/communityCacheUpdates';
import { useAppStore } from '@/src/store';
import { defaultQueryRetry, STABLE_QUERY_OPTIONS } from '@/src/lib/queryRetry';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { FOR_YOU_FEED_QUERY_KEY, PROFILE_POSTS_QUERY_KEY } from '../queryKeys';

export { FOR_YOU_FEED_QUERY_KEY } from '../queryKeys';
export type { ForYouFeedSnapshot } from '@/src/screens/community/utils/communityCacheUpdates';

const FOR_YOU_STALE_MS = 10 * 60 * 1000;
const SPARSE_FEED_THRESHOLD = 5;

export async function fetchFriendsFeedPage(cursor?: string): Promise<FeedPage> {
  return fetchFeedPageSafe('GET /me/feed', () => apiGetFeed({ limit: 20, cursor }));
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

function getMyPostsFromCache(queryClient: QueryClient): BackendFeedPost[] {
  const profileCached = queryClient.getQueryData<BackendFeedPost[]>(PROFILE_POSTS_QUERY_KEY);
  if (profileCached?.length) return profileCached;
  return mergeProfilePosts([], getCachedProfilePosts());
}

export async function fetchForYouFeedFirstPage(
  queryClient: QueryClient,
): Promise<ForYouFeedSnapshot> {
  const friendsPage = await fetchFriendsFeedPage();
  const friendsPosts = friendsPage.items ?? friendsPage.posts ?? [];

  let myPosts = getMyPostsFromCache(queryClient);
  if (myPosts.length === 0) {
    const myPage = await fetchFeedPageSafe('GET /me/posts', () =>
      apiListMyPosts({ limit: 20 }),
    );
    myPosts = myPage.items ?? myPage.posts ?? [];
    seedProfilePostsCache(queryClient, myPosts);
  }

  let discoverPosts: BackendFeedPost[] = [];
  const withoutDiscover = mergeForYouFeedPosts(myPosts, [], friendsPosts);
  if (isSparseCommunityFeed(withoutDiscover, { maxPosts: SPARSE_FEED_THRESHOLD })) {
    try {
      const discoverPage = await apiGetDiscoverFeed({ limit: 20 });
      discoverPosts = discoverPage?.items ?? discoverPage?.posts ?? [];
    } catch (error) {
      if (__DEV__) {
        console.warn('[forYouFeed] GET /discover unavailable', (error as Error).message);
      }
    }
  }

  return {
    posts: mergeForYouFeedPosts(myPosts, discoverPosts, friendsPosts),
    nextCursor: friendsPage.next_cursor,
    discoverAvailable: discoverPosts.length > 0,
  };
}

export function useForYouFeed() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const query = useQuery({
    queryKey: FOR_YOU_FEED_QUERY_KEY,
    queryFn: ({ client }) => fetchForYouFeedFirstPage(client),
    enabled: isSignedIn,
    staleTime: FOR_YOU_STALE_MS,
    placeholderData: (previous) => previous,
    retry: defaultQueryRetry,
    ...STABLE_QUERY_OPTIONS,
  });

  useEffect(() => {
    if (!query.error) return;
    const setGrace = useAppStore.getState().setAccountDeletionGrace;
    markAccountDeletionGraceFromError(query.error, setGrace);
  }, [query.error]);

  return query;
}
