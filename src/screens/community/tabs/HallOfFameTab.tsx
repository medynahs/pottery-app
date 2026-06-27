import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { SkeletonLeaderboardRow } from '@/src/components/Skeleton';
import { Text } from '@/src/components/ui/text';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import {
  HallOfFameFeaturedHero,
  HallOfFameWinnerCard,
} from '@/src/screens/community/components/challenge/HallOfFameWinnerCard';
import { MOCK_HALL_OF_FAME_CYCLES } from '@/src/screens/community/mock/challengeMockData';
import type { ChallengeWinnerDisplay } from '@/src/screens/community/types';
import { hallOfFameWinnerToDisplay, mockCycleToWinners } from '@/src/screens/community/utils/challengeWinners';
import { apiGetHallOfFameArchive } from '@/src/services/community';
import { useAppStore } from '@/src/store';
import { Trophy } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

type ArchiveCycle = {
  id: string;
  label: string;
  title: string;
  emoji: string;
  winners: ChallengeWinnerDisplay[];
};

function mockCycles(): ArchiveCycle[] {
  return MOCK_HALL_OF_FAME_CYCLES.map((cycle) => ({
    id: cycle.challengeId,
    label: cycle.label,
    title: cycle.title,
    emoji: cycle.emoji,
    winners: mockCycleToWinners(cycle),
  }));
}

export function HallOfFameTab() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cycles, setCycles] = useState<ArchiveCycle[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSignedIn) {
        setCycles([]);
        return;
      }

      const archive = await apiGetHallOfFameArchive();
      if (archive?.cycles?.length) {
        setCycles(
          archive.cycles.map((cycle) => ({
            id: cycle.challenge_id,
            label: cycle.label?.trim() || 'Past challenge',
            title: cycle.title,
            emoji: cycle.emoji?.trim() || '🏆',
            winners: cycle.winners.map((w) =>
              hallOfFameWinnerToDisplay(w, {
                challenge_id: cycle.challenge_id,
                title: cycle.title,
                label: cycle.label,
                emoji: cycle.emoji,
              }),
            ),
          })),
        );
        return;
      }

      if (__DEV__) {
        setCycles(mockCycles());
        return;
      }

      setCycles([]);
    } catch {
      if (__DEV__) {
        setCycles(mockCycles());
        return;
      }
      setError('Could not load Hall of Fame winners.');
      setCycles([]);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void load();
  }, [load]);

  const featuredWinner = useMemo(() => {
    const firstCycle = cycles[0];
    return firstCycle?.winners[0] ?? null;
  }, [cycles]);

  if (loading) {
    return (
      <View className="gap-2">
        {[0, 1, 2].map((i) => (
          <SkeletonLeaderboardRow key={i} />
        ))}
      </View>
    );
  }

  return (
    <>
      <View
        className="rounded-3xl p-5 mb-2 border"
        style={{ backgroundColor: COMMUNITY_THEME.cardBg, borderColor: COMMUNITY_THEME.cardBorder }}
      >
        <View className="flex-row items-center gap-2 mb-2">
          <Trophy size={16} color={COMMUNITY_THEME.accent} />
          <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: COMMUNITY_THEME.accent }}>
            Hall of Fame
          </Text>
        </View>
        <Text className="text-2xl font-serif font-bold" style={{ color: COMMUNITY_THEME.ink }}>
          Past challenge winners
        </Text>
        <Text className="text-sm leading-relaxed mt-2" style={{ color: COMMUNITY_THEME.inkSoft }}>
          Every closed challenge crowns winners per track. Their pieces are archived here permanently.
        </Text>
      </View>

      {error ? (
        <InlineErrorCard message={error} onRetry={() => void load()} />
      ) : null}

      {featuredWinner ? <HallOfFameFeaturedHero winner={featuredWinner} /> : null}

      {cycles.map((cycle) => (
        <View key={cycle.id} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: COMMUNITY_THEME.inkMuted }}>
            {cycle.label}
          </Text>
          <Text className="text-lg font-serif font-bold mb-3" style={{ color: COMMUNITY_THEME.ink }}>
            {cycle.emoji} {cycle.title}
          </Text>
          {cycle.winners.map((winner) => (
            <HallOfFameWinnerCard key={winner.id} winner={winner} compact />
          ))}
        </View>
      ))}

      {!featuredWinner && !error ? (
        <Text className="text-sm text-center py-8" style={{ color: COMMUNITY_THEME.inkMuted }}>
          Winners will appear here after the first challenge closes.
        </Text>
      ) : null}
    </>
  );
}
