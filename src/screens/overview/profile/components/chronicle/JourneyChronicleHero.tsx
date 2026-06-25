import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, ScrollText, Zap } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { JOURNEY_PAGE } from '../../journeyTheme';

type JourneyChronicleHeroProps = {
  title: string;
  nextTitle: string | null;
  badgesUntilNext: number;
  earnedCount: number;
  totalBadges: number;
  tenureLabel: string | null;
  tagline: string;
  onOpenAchievements: () => void;
};

export function JourneyChronicleHero({
  title,
  nextTitle,
  badgesUntilNext,
  earnedCount,
  totalBadges,
  tenureLabel,
  tagline,
  onOpenAchievements,
}: JourneyChronicleHeroProps) {
  const rankProgress = totalBadges > 0 ? (earnedCount / totalBadges) * 100 : 0;

  return (
    <View className="mx-6 mb-4 rounded-[28px] overflow-hidden">
      <LinearGradient
        colors={[...JOURNEY_PAGE.heroGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          shadowColor: JOURNEY_PAGE.scrollShadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.28,
          shadowRadius: 18,
          elevation: 8,
        }}
      >
        <View
          className="absolute -right-8 -top-8 w-36 h-36 rounded-full"
          style={{ backgroundColor: JOURNEY_PAGE.heroGlow }}
        />
        <View
          className="absolute -left-6 bottom-0 w-28 h-28 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}
        />

        <View className="px-5 pt-5 pb-5">
          <View className="flex-row items-center gap-2 mb-3">
            <ScrollText size={14} color="rgba(255, 244, 224, 0.85)" />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 1.3,
                color: 'rgba(255, 244, 224, 0.85)',
                textTransform: 'uppercase',
              }}
            >
              Studio chronicle
            </Text>
          </View>

          <View className="flex-row items-start justify-between gap-3 mb-2">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Zap size={20} color={JOURNEY_PAGE.goldRing} />
                <Text
                  className="font-serif text-[28px] leading-8"
                  style={{ color: '#FFF7EC', fontFamily: 'Fraunces_700Bold' }}
                >
                  {title}
                </Text>
              </View>
              {tenureLabel ? (
                <Text className="text-[11px] font-semibold mt-1" style={{ color: 'rgba(255, 244, 224, 0.72)' }}>
                  {tenureLabel}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={onOpenAchievements}
              activeOpacity={0.85}
              className="rounded-2xl px-3 py-2.5 items-center border"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.18)',
                borderColor: 'rgba(255, 244, 224, 0.22)',
              }}
              accessibilityRole="button"
              accessibilityLabel={`${earnedCount} of ${totalBadges} achievements`}
            >
              <Award size={16} color={JOURNEY_PAGE.goldRing} />
              <Text className="text-sm font-bold mt-1" style={{ color: '#FFF7EC' }}>
                {earnedCount}
              </Text>
              <Text className="text-[9px] font-semibold" style={{ color: 'rgba(255, 244, 224, 0.7)' }}>
                /{totalBadges}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-[13px] leading-5 mb-4" style={{ color: 'rgba(255, 244, 224, 0.88)' }}>
            {tagline}
          </Text>

          <View className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <View
              className="h-full rounded-full"
              style={{ width: `${rankProgress}%`, backgroundColor: JOURNEY_PAGE.goldRing }}
            />
          </View>
          <Text className="text-[10px] font-semibold" style={{ color: 'rgba(255, 244, 224, 0.72)' }}>
            {nextTitle
              ? `${badgesUntilNext} achievement${badgesUntilNext === 1 ? '' : 's'} until ${nextTitle}`
              : 'Every rank unlocked — studio legend.'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
