import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { SkeletonLeaderboardRow } from '@/src/components/Skeleton';
import { Text } from '@/src/components/ui/text';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import {
  HallOfFameFeaturedHero,
  HallOfFameWinnerCard,
} from '@/src/screens/community/components/challenge/HallOfFameWinnerCard';
import { useHallOfFameArchive } from '@/src/screens/community/hooks/useHallOfFameArchive';
import type { ChallengeWinnerDisplay } from '@/src/screens/community/types';
import { hallOfFameWinnerToDisplay } from '@/src/screens/community/utils/challengeWinners';
import { Trophy } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View } from 'react-native';

type ArchiveCycle = {
  id: string;
  label: string;
  title: string;
  emoji: string;
  winners: ChallengeWinnerDisplay[];
};

export function HallOfFameTab() {
  const { data: archive, isLoading, error, refetch, isFetching } = useHallOfFameArchive();

  const cycles = useMemo((): ArchiveCycle[] => {
    if (!archive?.cycles?.length) return [];
    return archive.cycles.map((cycle) => ({
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
    }));
  }, [archive]);

  const featuredWinner = useMemo(() => {
    const firstCycle = cycles[0];
    return firstCycle?.winners[0] ?? null;
  }, [cycles]);

  const errorMessage = error ? 'Could not load Hall of Fame winners.' : null;

  if (isLoading && !archive) {
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

      {errorMessage ? (
        <InlineErrorCard message={errorMessage} onRetry={() => void refetch()} />
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

      {!featuredWinner && !errorMessage && !isFetching ? (
        <Text className="text-sm text-center py-8" style={{ color: COMMUNITY_THEME.inkMuted }}>
          Winners will appear here after the first challenge closes.
        </Text>
      ) : null}
    </>
  );
}
