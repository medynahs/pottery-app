// src/screens/community/tabs/HallOfFameTab.tsx
import { Text } from '@/src/components/ui/text';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import {
  HallOfFameFeaturedHero,
  HallOfFameWinnerCard,
} from '@/src/screens/community/components/challenge/HallOfFameWinnerCard';
import { MOCK_HALL_OF_FAME_CYCLES } from '@/src/screens/community/mock/challengeMockData';
import { Trophy } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

export function HallOfFameTab() {
  const featured = MOCK_HALL_OF_FAME_CYCLES[0];
  const featuredWinner = featured?.winners[0] ?? null;

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
          Challenge winners
        </Text>
        <Text className="text-sm leading-relaxed mt-2" style={{ color: COMMUNITY_THEME.inkSoft }}>
          Each seasonal challenge crowns one winner per track. Their pieces live here permanently.
        </Text>
      </View>

      {featuredWinner ? <HallOfFameFeaturedHero winner={featuredWinner} /> : null}

      {MOCK_HALL_OF_FAME_CYCLES.map((cycle) => (
        <View key={cycle.challengeId} className="mb-4">
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

      {!featuredWinner ? (
        <Text className="text-sm text-center py-8" style={{ color: COMMUNITY_THEME.inkMuted }}>
          Winners will appear here after the first challenge closes.
        </Text>
      ) : null}
    </>
  );
}
