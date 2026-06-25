import { Text } from '@/src/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import type { BadgeState } from '../../constants/badgeRegistry';
import { JOURNEY_PAGE } from '../../journeyTheme';

export function JourneyAchievementsTeaser({
  badges,
  onViewAll,
}: {
  badges: BadgeState[];
  onViewAll: () => void;
}) {
  const earned = useMemo(() => badges.filter((b) => b.unlocked), [badges]);
  const next = useMemo(
    () => [...badges].filter((b) => !b.unlocked).sort((a, b) => b.progress - a.progress)[0],
    [badges],
  );

  if (badges.length === 0) return null;

  return (
    <TouchableOpacity
      onPress={onViewAll}
      activeOpacity={0.88}
      className="mx-6 mb-6 rounded-[22px] border overflow-hidden"
      style={{
        backgroundColor: JOURNEY_PAGE.parchment,
        borderColor: JOURNEY_PAGE.parchmentBorder,
        shadowColor: JOURNEY_PAGE.scrollShadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      }}
      accessibilityRole="button"
      accessibilityLabel="View all achievements"
    >
      <View className="px-4 py-3.5 flex-row items-center justify-between border-b" style={{ borderColor: JOURNEY_PAGE.parchmentBorder }}>
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'hsl(35 65% 32%)' }}>
            Achievements
          </Text>
          <Text className="font-serif text-lg mt-0.5" style={{ color: 'hsl(24 55% 22%)', fontFamily: 'Fraunces_700Bold' }}>
            {earned.length} of {badges.length} earned
          </Text>
        </View>
        <ChevronRight size={18} color="hsl(39 57% 51%)" />
      </View>

      <View className="px-4 py-3">
        {earned.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 4 }}
          >
            {earned.slice(0, 8).map((badge) => {
              const Icon = badge.icon;
              return (
                <View key={badge.id} className="items-center" style={{ width: 56 }}>
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center border-2"
                    style={{
                      backgroundColor: '#FFF9EE',
                      borderColor: JOURNEY_PAGE.goldRing,
                      shadowColor: JOURNEY_PAGE.goldRing,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.35,
                      shadowRadius: 6,
                    }}
                  >
                    <Icon size={20} color={badge.iconColor} />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text className="text-sm leading-5" style={{ color: 'hsl(32 28% 44%)' }}>
            Log studio work to start collecting achievements.
          </Text>
        )}

        {next ? (
          <View className="mt-3 pt-3 border-t flex-row items-center gap-3" style={{ borderColor: JOURNEY_PAGE.parchmentBorder }}>
            <View className="w-9 h-9 rounded-full items-center justify-center bg-muted/80 opacity-80">
              {(() => {
                const NextIcon = next.icon;
                return <NextIcon size={16} color={next.iconColor} />;
              })()}
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'hsl(32 28% 44%)' }}>
                Closest unlock
              </Text>
              <Text className="text-xs font-semibold mt-0.5" style={{ color: 'hsl(24 55% 22%)' }} numberOfLines={1}>
                {next.name}
              </Text>
              <View className="h-1 rounded-full overflow-hidden mt-1.5 bg-muted">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${Math.round(next.progress * 100)}%`, backgroundColor: 'hsl(39 57% 51%)' }}
                />
              </View>
            </View>
            <Text className="text-[10px] font-bold" style={{ color: 'hsl(32 28% 44%)' }}>
              {next.current}/{next.target}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
