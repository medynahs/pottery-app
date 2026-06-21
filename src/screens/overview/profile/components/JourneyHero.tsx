import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { ProgressRing } from '@/src/screens/analytics/components/charts/ProgressRing';
import { Sparkles, Zap } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

type JourneyHeroProps = {
  title: string;
  nextTitle: string | null;
  badgesUntilNext: number;
  earnedCount: number;
  totalBadges: number;
  badgeProgress: number;
  survivalRate: number;
  finishRate: number;
  totalPieces: number;
};

export function JourneyHero({
  title,
  nextTitle,
  badgesUntilNext,
  earnedCount,
  totalBadges,
  badgeProgress,
  survivalRate,
  finishRate,
  totalPieces,
}: JourneyHeroProps) {
  const levelProgress = totalBadges > 0 ? (earnedCount / totalBadges) * 100 : 0;

  return (
    <Card className="mx-6 mb-4 rounded-2xl p-5">
      <View className="flex-row items-start justify-between mb-4">
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
              ? 'Log your first piece to begin earning badges.'
              : nextTitle
                ? `${badgesUntilNext} badge${badgesUntilNext === 1 ? '' : 's'} until ${nextTitle}`
                : 'All ranks unlocked, studio legend status.'}
          </Text>
        </View>
        <View className="px-3 py-2 rounded-2xl flex-row items-center gap-1.5 bg-muted border border-border">
          <Sparkles size={12} color="hsl(39 57% 51%)" />
          <Text className="text-xs font-bold text-foreground">
            {earnedCount}/{totalBadges}
          </Text>
        </View>
      </View>

      <View className="h-2 rounded-full overflow-hidden mb-5 bg-muted">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${levelProgress}%` }}
        />
      </View>

      <View className="flex-row justify-between">
        <ProgressRing
          value={totalPieces > 0 ? survivalRate : null}
          size={76}
          stroke={7}
          label="Survival"
          sublabel="pieces kept"
          tone="ink"
        />
        <ProgressRing
          value={totalPieces > 0 ? finishRate : null}
          size={76}
          stroke={7}
          label="Finished"
          sublabel="completion"
          tone="ink"
        />
        <ProgressRing
          value={totalBadges > 0 ? badgeProgress : null}
          size={76}
          stroke={7}
          label="Badges"
          sublabel="earned"
          tone="ink"
        />
      </View>
    </Card>
  );
}
