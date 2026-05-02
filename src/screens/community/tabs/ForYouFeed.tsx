// src/screens/community/tabs/ForYouFeed.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import {
  Award,
  Star,
  Trophy,
  Zap,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import {
  apiGetFeed,
  apiGetPolls,
  apiVotePoll,
  type BackendFeedPost,
  type BackendPoll,
} from '../../../services/community';
import { FeedPostCard } from '../components/FeedPostCard';
import { FOLLOW_CREATORS } from '../data';

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

  const [followed, setFollowed] = useState<Record<string, boolean>>({});

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
      {/* 1 ── Featured challenge ── static hero until challenge API is wired */}
      <TouchableOpacity activeOpacity={0.88}>
        <View className="rounded-3xl overflow-hidden border border-green-200" style={{ backgroundColor: 'hsl(100 25% 96%)' }}>
          <View className="absolute top-4 left-4 z-10 flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-green-200">
            <Trophy size={12} color="hsl(100 35% 44%)" />
            <Text className="text-xs font-bold" style={{ color: 'hsl(100 35% 44%)' }}>March Challenge</Text>
          </View>
          <View className="h-44 items-center justify-center">
            <Text style={{ fontSize: 80 }}>🥣</Text>
          </View>
          <View className="px-5 pb-5">
            <Text className="text-xl font-serif font-bold text-foreground leading-snug">The Humble Bowl</Text>
            <Text className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Throw the most honest, beautiful bowl you can. No handles, no decorations — just form.
            </Text>
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center gap-4">
                <Text className="text-xs text-muted-foreground"><Text className="font-bold text-foreground">124</Text> joined</Text>
                <Text className="text-xs text-muted-foreground"><Text className="font-bold text-foreground">23</Text> days left</Text>
              </View>
              <View className="px-4 py-2 rounded-xl" style={{ backgroundColor: 'hsl(100 35% 44%)' }}>
                <Text className="text-white text-xs font-bold">Join Challenge</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

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

      {/* Potters you might love */}
      <Card className="p-4">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Potters you might love
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -4 }}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}
        >
          {FOLLOW_CREATORS.map(({ name, avatar, specialty, color }) => (
            <View key={name} className="w-28 items-center bg-muted/40 rounded-2xl p-3 border border-border">
              <View className="w-12 h-12 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: color }}>
                <Text className="text-white font-bold text-base">{avatar}</Text>
              </View>
              <Text className="text-xs font-bold text-foreground text-center">{name}</Text>
              <Text className="text-xs text-muted-foreground text-center mt-0.5">{specialty}</Text>
              <TouchableOpacity
                onPress={() => setFollowed(prev => ({ ...prev, [name]: !prev[name] }))}
                className={`mt-2.5 w-full py-1.5 rounded-xl items-center border ${
                  followed[name] ? 'bg-muted border-border' : 'border-primary'
                }`}
                activeOpacity={0.75}
              >
                <Text className={`text-xs font-semibold ${followed[name] ? 'text-muted-foreground' : 'text-primary'}`}>
                  {followed[name] ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </Card>

      {/* Mentor CTA */}
      <TouchableOpacity activeOpacity={0.85}>
        <View className="rounded-3xl p-5 overflow-hidden" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
          <View
            className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          />
          <View className="flex-row items-center gap-2.5 mb-2">
            <Zap size={18} color="hsl(38 80% 70%)" />
            <Text className="text-white font-serif font-bold text-lg">Become a Mentor</Text>
          </View>
          <Text className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Share your knowledge. Answer questions. Help the next generation of potters grow.
          </Text>
          <View className="flex-row gap-2 mt-4">
            <View className="flex-row items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2">
              <Star size={12} color="hsl(38 80% 75%)" />
              <Text className="text-white text-xs font-semibold">+250 XP / answer</Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2">
              <Award size={12} color="hsl(38 80% 75%)" />
              <Text className="text-white text-xs font-semibold">Mentor Badge</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
}
