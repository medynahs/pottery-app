// src/screens/community/tabs/HallOfFameTab.tsx
import { EmptyState } from '@/src/components/EmptyState';
import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { SkeletonLeaderboardRow } from '@/src/components/Skeleton';
import { UserAvatar } from '@/src/components/UserAvatar';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
  apiGetChallengeLeaderboard,
  apiListChallenges,
  type BackendChallengeLeaderboardEntry,
} from '@/src/services/challenges';
import { useAppStore } from '@/src/store';
import { Crown, Star, Trophy } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

// ─── Medal config ──────────────────────────────────────────────────────────────

const MEDALS = [
  { color: '#D97706', bg: '#FFFBEB', border: '#F59E0B' }, // gold
  { color: '#6B7280', bg: '#F9FAFB', border: '#9CA3AF' }, // silver
  { color: '#92400E', bg: '#FEF3C7', border: '#B45309' }, // bronze
];


// ─── Podium entry (top 3) ─────────────────────────────────────────────────────

const PODIUM_HEIGHTS = [96, 68, 50]; // 1st, 2nd, 3rd
const AVATAR_SIZES  = [64, 48, 44];

type HallOfFameEntry = {
  id: string;
  name: string;
  points: number;
  rank: number;
};

function normalizeLeaderboardEntries(
  entries: BackendChallengeLeaderboardEntry[],
): HallOfFameEntry[] {
  const sorted = [...entries].sort((a, b) => {
    const rankA = a.rank ?? Number.MAX_SAFE_INTEGER;
    const rankB = b.rank ?? Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;

    const pointsA = a.score ?? 0;
    const pointsB = b.score ?? 0;
    return pointsB - pointsA;
  });

  return sorted.map((entry, index) => ({
    id: `${entry.user_id}-${entry.rank ?? index + 1}`,
    name: entry.user_name?.trim() || `Potter #${index + 1}`,
    points: entry.score ?? 0,
    rank: entry.rank ?? index + 1,
  }));
}

function PodiumEntry({
  entry,
  rank,
}: {
  entry: HallOfFameEntry;
  rank: number;
}) {
  const idx     = rank - 1;
  const medal   = MEDALS[idx];
  const isFirst = rank === 1;
  const avatarSize = AVATAR_SIZES[idx] ?? 44;
  const podiumH    = PODIUM_HEIGHTS[idx] ?? 44;

  return (
    <View className="flex-1 items-center">
      {/* Crown above 1st */}
      {isFirst ? (
        <Crown size={20} color={medal.border} style={{ marginBottom: 4 }} />
      ) : (
        <View style={{ height: 24 }} />
      )}

      {/* Avatar */}
      <UserAvatar
        name={entry.name}
        size={avatarSize}
        backgroundColor={medal.bg}
        borderColor={medal.border}
        borderWidth={2.5}
        textColor={medal.color}
        serif
      />

      {/* Name */}
      <Text
        className="font-semibold text-center mt-2 leading-tight text-foreground"
        style={{ fontSize: isFirst ? 13 : 11, maxWidth: 90 }}
        numberOfLines={2}
      >
        {entry.name}
      </Text>

      {/* Win pill */}
      <View
        className="rounded-full px-2 py-0.5 mt-1"
        style={{ backgroundColor: `${medal.border}30` }}
      >
        <Text className="text-xs font-bold" style={{ color: medal.color }}>
          {entry.points} pts
        </Text>
      </View>

      {/* Podium base */}
      <View
        className="w-full rounded-t-xl items-center justify-center mt-3"
        style={{ height: podiumH, backgroundColor: `${medal.border}28` }}
      >
        <Text
          className="font-black"
          style={{ fontSize: isFirst ? 30 : 22, color: `${medal.border}99` }}
        >
          {rank}
        </Text>
      </View>
    </View>
  );
}

// ─── Runner-up row (4th+) ─────────────────────────────────────────────────────

function RankRow({ entry, rank }: { entry: HallOfFameEntry; rank: number }) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <Text className="text-sm font-bold text-muted-foreground w-5 text-right">
        {rank}
      </Text>

      <UserAvatar name={entry.name} size={36} backgroundColor="hsl(39 57% 95%)" textColor="hsl(39 40% 45%)" />

      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{entry.name}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5">Challenge score</Text>
      </View>

      <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: '#FEF3C7' }}>
        <Text className="text-xs font-bold" style={{ color: '#92400E' }}>
          {entry.points} pts
        </Text>
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HallOfFameTab() {
  const sessionToken = useAppStore((s) => s.sessionToken)!;

  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
  const [challengeTitle, setChallengeTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionToken) {
      setEntries([]);
      setChallengeTitle(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const challenges = await apiListChallenges(sessionToken);
      const activeChallenge = challenges?.[0] ?? null;

      if (!activeChallenge?.id) {
        setEntries([]);
        setChallengeTitle(null);
        return;
      }

      const leaderboard = await apiGetChallengeLeaderboard(sessionToken, activeChallenge.id);
      setEntries(normalizeLeaderboardEntries(leaderboard));
      setChallengeTitle(activeChallenge.title ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Hall of Fame');
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => { load(); }, [load]);

  const top3 = entries.slice(0, 3);
  const rest  = entries.slice(3);

  // Classic podium order: 2nd left, 1st centre, 3rd right
  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : [...top3];
  const podiumRanks = top3.length >= 3 ? [2, 1, 3] : top3.map((_, i) => i + 1);

  return (
    <>
      {/* ── Hero banner ── */}
      <View
        className="rounded-3xl p-5 overflow-hidden"
        style={{ backgroundColor: '#FFFBEB' }}
      >
        {/* Decorative stars */}
        <View className="absolute right-5 top-5 flex-row items-center gap-1.5">
          <Star size={8}  color="#F59E0B" fill="#F59E0B" />
          <Star size={14} color="#F59E0B" fill="#F59E0B" />
          <Star size={10} color="#F59E0B" fill="#F59E0B" />
        </View>

        <View className="flex-row items-center gap-2 mb-2">
          <Trophy size={17} color="#D97706" />
          <Text className="text-xs font-bold tracking-widest uppercase" style={{ color: '#D97706' }}>
            Challenge Leaderboard
          </Text>
        </View>
        <Text className="text-2xl font-bold text-foreground">Hall of Fame</Text>
        <Text className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {challengeTitle
            ? `${challengeTitle} standings from the current challenge leaderboard.`
            : 'Top potters from the current challenge leaderboard.'}
        </Text>
      </View>

      {/* ── Loading ── */}
      {isLoading && (
        <Card className="py-2 px-0 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => <SkeletonLeaderboardRow key={i} />)}
        </Card>
      )}

      {/* ── Error ── */}
      {!isLoading && error && (
        <InlineErrorCard message={error} onRetry={load} />
      )}

      {/* ── Empty ── */}
      {!isLoading && !error && entries.length === 0 && (
        <EmptyState
          icon={Trophy}
          title="No entries yet"
          description="Complete a challenge to appear in the Hall of Fame."
        />
      )}

      {/* ── Podium (top 3) ── */}
      {!isLoading && !error && top3.length > 0 && (
        <View>
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Top Potters
          </Text>
          <View
            className="rounded-3xl overflow-hidden px-3 pt-3"
            style={{ backgroundColor: '#FEF9EC' }}
          >
            <View className="flex-row items-end gap-1">
              {podiumOrder.map((entry, i) =>
                entry ? (
                  <PodiumEntry key={entry.id} entry={entry} rank={podiumRanks[i]} />
                ) : null,
              )}
            </View>
          </View>
        </View>
      )}

      {/* ── Runners up (4th+) ── */}
      {!isLoading && !error && rest.length > 0 && (
        <View>
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Runners Up
          </Text>
          <Card className="px-4 py-0">
            {rest.map((entry, i) => (
              <RankRow key={entry.id} entry={entry} rank={entry.rank || i + 4} />
            ))}
          </Card>
        </View>
      )}
    </>
  );
}

