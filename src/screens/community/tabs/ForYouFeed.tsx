// src/screens/community/tabs/ForYouFeed.tsx
import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { SkeletonFeedPost } from '@/src/components/Skeleton';
import { Text } from '@/src/components/ui/text';
import { CommunityPollCard } from '@/src/screens/community/components/CommunityPollCard';
import { CommunitySeedTipCard } from '@/src/screens/community/components/CommunitySeedTipCard';
import { CommunityWelcomeHub } from '@/src/screens/community/components/CommunityWelcomeHub';
import { POTTERY_NOOK_SEED_TIPS } from '@/src/screens/community/data/communitySeedContent';
import { useCommunityPolls } from '@/src/screens/community/hooks/useCommunityPolls';
import { useAppStore, useVisiblePieces } from '@/src/store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import {
  apiGetDiscoverFeed,
  apiGetFeed,
  apiListMyPosts,
  type BackendFeedPost,
} from '../../../services/community';
import {
  isSparseCommunityFeed,
  mergeForYouFeedPosts,
} from '@/src/utils/communityFeedMerge';
import { FeedPostCard } from '../components/FeedPostCard';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  refreshKey: number;
  onRefreshingChange: (refreshing: boolean) => void;
  onJoinChallenge: () => void;
  onSharePiece: () => void;
  onAskCommunity: () => void;
  onBrowseDiscover: () => void;
  onCreatePost: () => void;
}

export function ForYouFeed({
  refreshKey,
  onRefreshingChange,
  onJoinChallenge,
  onSharePiece,
  onAskCommunity,
  onBrowseDiscover,
  onCreatePost,
}: Props) {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const backendUserId = useAppStore((s) => s.backendUserId);
  const communityFeedRevision = useAppStore((s) => s.communityFeedRevision);
  const pieces = useVisiblePieces();
  const hasPieces = pieces.length > 0;

  const [posts, setPosts] = useState<BackendFeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [discoverAvailable, setDiscoverAvailable] = useState(false);

  const { polls, vote: votePoll, reload: reloadPolls } = useCommunityPolls(sessionToken);

  const isRefreshRef = useRef(false);

  const handlePostDeleted = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const fetchFeed = useCallback(
    async (cursor?: string) => {
      if (!sessionToken) {
        setIsLoading(false);
        return;
      }
      const isFirstPage = !cursor;
      if (isFirstPage) {
        if (isRefreshRef.current) {
          onRefreshingChange(true);
        } else {
          setIsLoading(true);
        }
        setError(null);
      } else {
        setIsLoadingMore(true);
      }
      try {
        const friendsPage = await apiGetFeed(sessionToken, { limit: 20, cursor });
        const friendsPosts = friendsPage.items ?? friendsPage.posts ?? [];

        let merged = friendsPosts;
        if (isFirstPage) {
          const [myPage, discoverPage] = await Promise.all([
            apiListMyPosts(sessionToken, { limit: 20 }).catch(() => null),
            apiGetDiscoverFeed(sessionToken, { limit: 20 }),
          ]);
          const myPosts = myPage?.items ?? myPage?.posts ?? [];
          const discoverPosts = discoverPage?.items ?? discoverPage?.posts ?? [];
          setDiscoverAvailable(discoverPosts.length > 0);
          merged = mergeForYouFeedPosts(myPosts, discoverPosts, friendsPosts);
        }

        if (isFirstPage) {
          setPosts(merged);
        } else {
          setPosts((prev) => {
            const seen = new Set(prev.map((post) => post.id));
            const next = [...prev];
            friendsPosts.forEach((post) => {
              if (!seen.has(post.id)) {
                seen.add(post.id);
                next.push(post);
              }
            });
            return next;
          });
        }
        setNextCursor(friendsPage.next_cursor);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load feed';
        if (isFirstPage) setError(msg);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        onRefreshingChange(false);
        isRefreshRef.current = false;
      }
    },
    [sessionToken, onRefreshingChange],
  );

  useEffect(() => {
    fetchFeed();
    void reloadPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  useEffect(() => {
    if (refreshKey === 0) return;
    isRefreshRef.current = true;
    fetchFeed();
    void reloadPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    if (communityFeedRevision === 0) return;
    isRefreshRef.current = true;
    fetchFeed();
    void reloadPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityFeedRevision]);

  const showSeedContent = !isLoading && !error && isSparseCommunityFeed(posts);
  const othersPosts = posts.filter((p) => !backendUserId || p.user_id !== backendUserId);
  const hasOwnPosts = posts.some((p) => backendUserId && p.user_id === backendUserId);
  const showCommunityFeedLabel =
    discoverAvailable && othersPosts.length > 0 && !hasOwnPosts;

  return (
    <>
      {isLoading && (
        <>
          <SkeletonFeedPost />
          <SkeletonFeedPost />
          <SkeletonFeedPost />
        </>
      )}

      {!isLoading && error && (
        <InlineErrorCard message={error} onRetry={() => fetchFeed()} />
      )}

      {!isLoading && !error && polls.length > 0 ? (
        <>
          {polls.map((poll) => (
            <CommunityPollCard
              key={poll.id}
              question={poll.question}
              options={poll.options}
              votedOptionId={poll.votedOptionId}
              totalVotes={poll.totalVotes}
              isDemo={poll.isDemo}
              onVote={(optionId) => votePoll(poll, optionId)}
            />
          ))}
        </>
      ) : null}

      {!isLoading && !error && showSeedContent ? (
        <>
          <CommunityWelcomeHub
            hasPieces={hasPieces}
            onSharePiece={onSharePiece}
            onAskCommunity={onAskCommunity}
            onJoinChallenge={onJoinChallenge}
            onBrowseDiscover={onBrowseDiscover}
            onCreatePost={onCreatePost}
          />
          {POTTERY_NOOK_SEED_TIPS.map((tip) => (
            <CommunitySeedTipCard key={tip.id} tip={tip} />
          ))}
        </>
      ) : null}

      {!isLoading && !error && posts.length > 0 ? (
        <>
          {showCommunityFeedLabel ? (
            <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pt-1">
              From the community
            </Text>
          ) : null}
          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              sessionToken={sessionToken!}
              onDeleted={handlePostDeleted}
            />
          ))}
        </>
      ) : null}

      {!isLoading && !error && nextCursor && (
        <TouchableOpacity
          onPress={() => fetchFeed(nextCursor)}
          disabled={isLoadingMore}
          className="py-3 rounded-2xl border border-border bg-card items-center"
          activeOpacity={0.7}
        >
          {isLoadingMore
            ? <ActivityIndicator size="small" color="#8B6A2A" />
            : <Text className="text-sm font-medium text-muted-foreground">Load more</Text>
          }
        </TouchableOpacity>
      )}
    </>
  );
}
