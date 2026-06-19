// src/screens/community/tabs/ForYouFeed.tsx
import { EmptyState } from '@/src/components/EmptyState';
import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { SkeletonFeedPost } from '@/src/components/Skeleton';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import {
  apiGetFeed,
  apiGetPolls,
  apiListMyPosts,
  apiVotePoll,
  type BackendFeedPost,
  type BackendPoll,
} from '../../../services/community';
import { mergeCommunityFeedPosts } from '@/src/utils/communityFeedMerge';
import { FeedPostCard } from '../components/FeedPostCard';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Increment to trigger a refresh from the parent ScrollView. */
  refreshKey: number;
  onRefreshingChange: (refreshing: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

// ─── Poll card ────────────────────────────────────────────────────────────────

function PollCard({
  poll,
  sessionToken,
  onVoted,
}: {
  poll: BackendPoll;
  sessionToken: string;
  onVoted: (updated: BackendPoll) => void;
}) {
  const [voting, setVoting] = useState<string | null>(null);
  const hasVoted = poll.voted_option_id !== null;
  const total = poll.total_votes || 1; // avoid /0

  const handleVote = async (optionId: string) => {
    if (hasVoted || voting) return;
    setVoting(optionId);
    try {
      const updated = await apiVotePoll(sessionToken, poll.id, optionId);
      onVoted(updated);
    } catch {
      // silently ignore — optimistic update not applied on error
    } finally {
      setVoting(null);
    }
  };

  return (
    <Card className="p-4">
      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Community Poll
      </Text>
      <Text className="text-sm font-bold text-foreground mb-3">{poll.question}</Text>
      <View className="gap-2">
        {poll.options.map((opt) => {
          const pct = Math.round((opt.votes / total) * 100);
          const isVoted = poll.voted_option_id === opt.id;
          const isVoting = voting === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => handleVote(opt.id)}
              disabled={hasVoted || voting !== null}
              activeOpacity={hasVoted ? 1 : 0.75}
            >
              <View className="rounded-xl overflow-hidden border border-border">
                {/* filled bar background */}
                {hasVoted && (
                  <View
                    className="absolute inset-0 rounded-xl"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isVoted
                        ? 'hsl(39 57% 51% / 0.15)'
                        : 'hsl(0 0% 0% / 0.04)',
                    }}
                  />
                )}
                <View className="flex-row items-center justify-between px-3 py-2.5">
                  <View className="flex-row items-center gap-2 flex-1">
                    {isVoting && <ActivityIndicator size="small" color="#8B6A2A" />}
                    <Text
                      className="text-sm flex-1"
                      style={{
                        fontWeight: isVoted ? '700' : '400',
                        color: isVoted ? 'hsl(39 57% 45%)' : undefined,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {hasVoted && (
                    <Text className="text-xs font-semibold text-muted-foreground ml-2">
                      {pct}%
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {hasVoted && (
        <Text className="text-xs text-muted-foreground mt-2">
          {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
        </Text>
      )}
    </Card>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ForYouFeed({ refreshKey, onRefreshingChange }: Props) {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const backendUserId = useAppStore((s) => s.backendUserId);
  const communityFeedRevision = useAppStore((s) => s.communityFeedRevision);

  const [posts, setPosts] = useState<BackendFeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [polls, setPolls] = useState<BackendPoll[]>([]);

  // Track whether the current fetch is a pull-to-refresh.
  const isRefreshRef = useRef(false);

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
          try {
            const myPage = await apiListMyPosts(sessionToken, { limit: 20 });
            const myPosts = myPage.items ?? myPage.posts ?? [];
            merged = mergeCommunityFeedPosts(myPosts, friendsPosts);
          } catch {
            merged = friendsPosts;
          }
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

  // Initial load — feed + polls in parallel.
  useEffect(() => {
    fetchFeed();
    if (sessionToken) {
      apiGetPolls(sessionToken)
        .then((data) => setPolls(data ?? []))
        .catch(() => {}); // polls are non-critical
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  // Refresh triggered by parent (pull-to-refresh) or global post creation.
  useEffect(() => {
    if (refreshKey === 0) return;
    isRefreshRef.current = true;
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    if (communityFeedRevision === 0) return;
    isRefreshRef.current = true;
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityFeedRevision]);

  return (
    <>
      {/* ── Feed posts ─────────────────────────────────────────────────────── */}

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

      {!isLoading && !error && posts.length === 0 && (
        <EmptyState
          icon={Users}
          title="Nothing here yet"
          description="Your posts appear here once shared. Follow other potters to see their work too."
        />
      )}

      {!isLoading && !error && posts.some((p) => backendUserId && p.user_id === backendUserId) ? (
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pt-1">
          Includes your posts
        </Text>
      ) : null}

      {posts.map((post) => (
        <FeedPostCard key={post.id} post={post} sessionToken={sessionToken!} />
      ))}

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

      {/* ── Discovery widgets ───────────────────────────────────────────────── */}

      {/* Active polls */}
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          poll={poll}
          sessionToken={sessionToken!}
          onVoted={(updated) =>
            setPolls((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
          }
        />
      ))}

    </>
  );
}
