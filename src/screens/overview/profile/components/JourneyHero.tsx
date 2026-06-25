import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Zap } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

type JourneyHeroProps = {
  title: string;
  nextTitle: string | null;
  badgesUntilNext: number;
  earnedCount: number;
  totalBadges: number;
  totalPieces: number;
  /** When true, drops outer horizontal margin (e.g. inside profile header). */
  embedded?: boolean;
};

export function JourneyHero({
  title,
  nextTitle,
  badgesUntilNext,
  earnedCount,
  totalBadges,
  totalPieces,
  embedded = false,
}: JourneyHeroProps) {
  const levelProgress = totalBadges > 0 ? (earnedCount / totalBadges) * 100 : 0;

  return (
    <Card className={`rounded-2xl p-5 mb-4${embedded ? '' : ' mx-6'}`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Potter rank
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Zap size={18} color="hsl(39 57% 51%)" />
            <Text className="font-serif text-[26px] leading-8 text-foreground">{title}</Text>
          </View>
          <Text className="text-xs mt-1 leading-5 text-muted-foreground">
            {totalPieces === 0
              ? 'Log your first piece to begin earning achievements.'
              : nextTitle
                ? `${badgesUntilNext} achievement${badgesUntilNext === 1 ? '' : 's'} until ${nextTitle}`
                : 'Top rank — every achievement earned.'}
          </Text>
        </View>
        <View className="px-3 py-2 rounded-2xl bg-muted border border-border">
          <Text className="text-lg font-serif font-bold text-foreground text-center leading-6">
            {earnedCount}
          </Text>
          <Text className="text-[10px] font-semibold text-muted-foreground text-center -mt-0.5">
            /{totalBadges}
          </Text>
        </View>
      </View>

      <View className="h-2 rounded-full overflow-hidden mt-4 bg-muted">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${levelProgress}%` }}
        />
      </View>
    </Card>
  );
}
