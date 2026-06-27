// src/screens/community/tabs/ForYouFeed.tsx
import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { SkeletonFeedPost } from '@/src/components/Skeleton';
import { Text } from '@/src/components/ui/text';
import { CommunityPollCard } from '@/src/screens/community/components/CommunityPollCard';
import { CommunitySeedTipCard } from '@/src/screens/community/components/CommunitySeedTipCard';
import { CommunityWelcomeHub } from '@/src/screens/community/components/CommunityWelcomeHub';
import { POTTERY_NOOK_SEED_TIPS } from '@/src/screens/community/data/communitySeedContent';
import { useCommunityPolls } from '@/src/screens/community/hooks/useCommunityPolls';
import {
  FOR_YOU_FEED_QUERY_KEY,
  fetchFriendsFeedPage,
  useForYouFeed,
  type ForYouFeedSnapshot,
} from '@/src/screens/community/hooks/useForYouFeed';
import { useAppStore, useVisiblePieces } from '@/src/store';
import { isSparseCommunityFeed } from '@/src/utils/communityFeedMerge';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import type { BackendFeedPost } from '../../../services/community';
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
  const queryClient = useQueryClient();
  const backendUserId = useAppStore((s) => s.backendUserId);
  const pieces = useVisiblePieces();
  const hasPieces = pieces.length > 0;

  const feedQuery = useForYouFeed(refreshKey);
  const { polls, vote: votePoll } = useCommunityPolls(refreshKey);

  const [extraPosts, setExtraPosts] = useState<BackendFeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const snapshot = feedQuery.data;
  const posts = [...(snapshot?.posts ?? []), ...extraPosts];
  const discoverAvailable = snapshot?.discoverAvailable ?? false;
  const isLoading = feedQuery.isLoading;
  const isRefreshing = feedQuery.isFetching && !feedQuery.isLoading;
  const error =
    feedQuery.error instanceof Error ? feedQuery.error.message : feedQuery.error ? 'Failed to load feed' : null;

  useEffect(() => {
    if (!snapshot) return;
    setExtraPosts([]);
    setNextCursor(snapshot.nextCursor);
  }, [snapshot]);

  useEffect(() => {
    onRefreshingChange(isRefreshing);
  }, [isRefreshing, onRefreshingChange]);

  const handlePostDeleted = useCallback(
    (postId: string) => {
      queryClient.setQueryData<ForYouFeedSnapshot>(FOR_YOU_FEED_QUERY_KEY, (prev) =>
        prev ? { ...prev, posts: prev.posts.filter((post) => post.id !== postId) } : prev,
      );
      setExtraPosts((prev) => prev.filter((post) => post.id !== postId));
    },
    [queryClient],
  );

  const fetchMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const page = await fetchFriendsFeedPage(nextCursor);
      const friendsPosts = page.items ?? page.posts ?? [];
      setExtraPosts((prev) => {
        const seen = new Set([...(snapshot?.posts ?? []), ...prev].map((post) => post.id));
        const next = [...prev];
        friendsPosts.forEach((post) => {
          if (!seen.has(post.id)) {
            seen.add(post.id);
            next.push(post);
          }
        });
        return next;
      });
      setNextCursor(page.next_cursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, nextCursor, snapshot?.posts]);

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
        <InlineErrorCard message={error} onRetry={() => void feedQuery.refetch()} />
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
              onDeleted={handlePostDeleted}
            />
          ))}
        </>
      ) : null}

      {!isLoading && !error && nextCursor && (
        <TouchableOpacity
          onPress={() => void fetchMore()}
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
