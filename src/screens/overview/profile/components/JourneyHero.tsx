import { Text } from '@/src/components/ui/text';
import { ProgressRing } from '@/src/screens/analytics/components/charts/ProgressRing';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Zap } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { PROFILE_THEME } from '../profileTheme';

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
    <LinearGradient
      colors={[...PROFILE_THEME.heroGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 24,
        padding: 20,
        shadowColor: PROFILE_THEME.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 6,
      }}
    >
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1 pr-3">
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 1.2,
              color: PROFILE_THEME.heroLabel,
              textTransform: 'uppercase',
            }}
          >
            Potter rank
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Zap size={18} color={PROFILE_THEME.gold} />
            <Text className="font-serif text-[26px] leading-8" style={{ color: PROFILE_THEME.heroText }}>
              {title}
            </Text>
          </View>
          <Text className="text-[12px] mt-1 leading-5" style={{ color: PROFILE_THEME.heroMuted }}>
            {totalPieces === 0
              ? 'Log your first piece to begin earning badges.'
              : nextTitle
                ? `${badgesUntilNext} badge${badgesUntilNext === 1 ? '' : 's'} until ${nextTitle}`
                : 'All ranks unlocked — studio legend status.'}
          </Text>
        </View>
        <View
          className="px-3 py-2 rounded-2xl flex-row items-center gap-1.5"
          style={{ backgroundColor: PROFILE_THEME.heroBadge, borderWidth: 1, borderColor: PROFILE_THEME.heroChipBorder }}
        >
          <Sparkles size={12} color={PROFILE_THEME.gold} />
          <Text className="text-xs font-bold" style={{ color: PROFILE_THEME.heroText }}>
            {earnedCount}/{totalBadges}
          </Text>
        </View>
      </View>

      <View className="h-2 rounded-full overflow-hidden mb-5" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <View
          className="h-full rounded-full"
          style={{ width: `${levelProgress}%`, backgroundColor: PROFILE_THEME.gold }}
        />
      </View>

      <View className="flex-row justify-between">
        <ProgressRing
          value={totalPieces > 0 ? survivalRate : null}
          size={76}
          stroke={7}
          label="Survival"
          sublabel="pieces kept"
          tone="cream"
        />
        <ProgressRing
          value={totalPieces > 0 ? finishRate : null}
          size={76}
          stroke={7}
          label="Finished"
          sublabel="completion"
          tone="cream"
        />
        <ProgressRing
          value={totalBadges > 0 ? badgeProgress : null}
          size={76}
          stroke={7}
          label="Badges"
          sublabel="earned"
          tone="cream"
        />
      </View>
    </LinearGradient>
  );
}
