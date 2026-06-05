// src/screens/community/tabs/ForYouFeed.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import {
  apiGetFeed,
  apiGetPolls,
  apiVotePoll,
  type BackendFeedPost,
  type BackendPoll,
} from '../../../services/community';
import { FeedPostCard } from '../components/FeedPostCard';

// ─── Skeleton placeholder card ────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-9 h-9 rounded-full bg-muted" />
        <View className="flex-1 gap-1.5">
          <View className="h-3 w-28 rounded bg-muted" />
          <View className="h-2.5 w-16 rounded bg-muted" />
        </View>
      </View>
      <View className="h-3 w-full rounded bg-muted mb-2" />
      <View className="h-3 w-3/4 rounded bg-muted mb-2" />
      <View className="h-3 w-1/2 rounded bg-muted" />
    </View>
  );
}

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
                        ? 'hsl(15 65% 50% / 0.15)'
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
                        color: isVoted ? 'hsl(15 65% 45%)' : undefined,
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
        const page = await apiGetFeed(sessionToken, { limit: 20, cursor });
        if (isFirstPage) {
          setPosts(page.items ?? page.posts ?? []);
        } else {
          setPosts((prev) => [...prev, ...(page.items ?? page.posts ?? [])]);
        }
        setNextCursor(page.next_cursor);
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

  // Refresh triggered by parent (pull-to-refresh).
  useEffect(() => {
    if (refreshKey === 0) return;
    isRefreshRef.current = true;
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <>
      {/* ── Feed posts ─────────────────────────────────────────────────────── */}

      {isLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!isLoading && error && (
        <Card className="p-5 items-center gap-3">
          <Text className="text-sm text-muted-foreground text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchFeed()}
            className="px-5 py-2 rounded-xl bg-primary"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </Card>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <Card className="p-6 items-center gap-2">
          <Text style={{ fontSize: 36 }}>🏺</Text>
          <Text className="text-sm font-semibold text-foreground text-center">Nothing here yet</Text>
          <Text className="text-xs text-muted-foreground text-center leading-relaxed">
            Follow other potters to see their work in your feed.
          </Text>
        </Card>
      )}

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
