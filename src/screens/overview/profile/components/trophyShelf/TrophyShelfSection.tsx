import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';
import type { BadgeCategory, BadgeState } from '../../constants/badgeRegistry';
import { PROFILE_THEME } from '../../profileTheme';
import { TrophyBadgeTile } from './TrophyBadgeTile';

export function TrophyShelfSection({
  category,
  label,
  badges,
}: {
  category: BadgeCategory;
  label: string;
  badges: BadgeState[];
}) {
  const earnedInSection = badges.filter((badge) => badge.unlocked).length;

  return (
    <View className="mb-7">
      <View className="flex-row items-end justify-between mb-2 px-1">
        <View className="flex-1 pr-3">
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 1.1,
              color: PROFILE_THEME.inkMuted,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Text>
          <Text className="text-[11px] mt-0.5" style={{ color: PROFILE_THEME.inkSoft }}>
            {earnedInSection} on the shelf · {badges.length - earnedInSection} waiting
          </Text>
        </View>
        <Text className="text-[11px] font-bold" style={{ color: PROFILE_THEME.accent }}>
          {earnedInSection}/{badges.length}
        </Text>
      </View>

      <LinearGradient
        colors={['#6E4528', '#8B5E3C', '#A8744F', '#8B5E3C', '#6E4528']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          height: 5,
          borderRadius: 999,
          marginBottom: 14,
          opacity: 0.85,
        }}
      />

      <View
        className="rounded-[24px] border px-3 pt-4 pb-3"
        style={{
          backgroundColor: 'hsl(34 42% 94%)',
          borderColor: 'hsl(34 30% 82%)',
          shadowColor: PROFILE_THEME.shadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {badges.map((badge) => (
            <TrophyBadgeTile key={`${category}-${badge.id}`} {...badge} />
          ))}
        </View>
      </View>
    </View>
  );
}
