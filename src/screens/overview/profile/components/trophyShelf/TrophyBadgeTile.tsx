import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Lock } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import type { BadgeState } from '../../constants/badgeRegistry';
import { PROFILE_THEME } from '../../profileTheme';

export function TrophyBadgeTile({
  name,
  desc,
  icon: Icon,
  iconColor,
  current,
  target,
  progress,
  unlocked,
}: BadgeState) {
  return (
    <View
      className="rounded-[20px] border overflow-hidden"
      style={{
        width: '48%',
        backgroundColor: unlocked ? '#FFF9EE' : 'hsl(38 45% 97%)',
        borderColor: unlocked ? 'hsl(42 65% 68%)' : PROFILE_THEME.cardBorder,
        opacity: unlocked ? 1 : 0.92,
        shadowColor: unlocked ? PROFILE_THEME.shadow : 'transparent',
        shadowOffset: { width: 0, height: unlocked ? 3 : 0 },
        shadowOpacity: unlocked ? 0.12 : 0,
        shadowRadius: unlocked ? 8 : 0,
        elevation: unlocked ? 2 : 0,
      }}
    >
      {unlocked ? (
        <LinearGradient
          colors={['rgba(247, 228, 184, 0.55)', 'rgba(255, 249, 238, 0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ padding: 12, minHeight: 148 }}
        >
          <TileContent
            Icon={Icon}
            iconColor={iconColor}
            name={name}
            desc={desc}
            current={current}
            target={target}
            progress={progress}
            unlocked={unlocked}
          />
        </LinearGradient>
      ) : (
        <View style={{ padding: 12, minHeight: 148 }}>
          <TileContent
            Icon={Icon}
            iconColor={iconColor}
            name={name}
            desc={desc}
            current={current}
            target={target}
            progress={progress}
            unlocked={unlocked}
          />
        </View>
      )}
    </View>
  );
}

function TileContent({
  Icon,
  iconColor,
  name,
  desc,
  current,
  target,
  progress,
  unlocked,
}: {
  Icon: BadgeState['icon'];
  iconColor: string;
  name: string;
  desc: string;
  current: number;
  target: number;
  progress: number;
  unlocked: boolean;
}) {
  return (
    <>
      <View className="flex-row items-start justify-between mb-3">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center border"
          style={{
            backgroundColor: unlocked ? '#FFF7EC' : PROFILE_THEME.accentSoft,
            borderColor: unlocked ? 'hsl(42 55% 78%)' : PROFILE_THEME.cardBorder,
          }}
        >
          <Icon size={22} color={iconColor} />
        </View>
        {unlocked ? (
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: 'hsl(142 45% 42%)' }}
          >
            <Check size={12} color="#FFF7EC" strokeWidth={3} />
          </View>
        ) : (
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(58, 40, 16, 0.08)' }}
          >
            <Lock size={11} color={PROFILE_THEME.inkMuted} />
          </View>
        )}
      </View>

      <Text className="text-[12px] font-bold leading-4 mb-1" style={{ color: PROFILE_THEME.ink }}>
        {name}
      </Text>
      <Text className="text-[10px] leading-4 mb-3" style={{ color: PROFILE_THEME.inkMuted }} numberOfLines={2}>
        {desc}
      </Text>

      {unlocked ? (
        <Text className="text-[10px] font-semibold" style={{ color: 'hsl(142 45% 38%)' }}>
          Trophy earned
        </Text>
      ) : (
        <>
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[10px] font-semibold" style={{ color: PROFILE_THEME.inkSoft }}>
              Progress
            </Text>
            <Text className="text-[10px] font-bold" style={{ color: PROFILE_THEME.inkMuted }}>
              {current}/{target}
            </Text>
          </View>
          <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: PROFILE_THEME.accentSoft }}>
            <View
              className="h-full rounded-full"
              style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: PROFILE_THEME.accent }}
            />
          </View>
        </>
      )}
    </>
  );
}
