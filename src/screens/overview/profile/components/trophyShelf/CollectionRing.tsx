import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { JOURNEY_ACCENTS, PROFILE_THEME } from '../../profileTheme';

export function CollectionRing({
  earned,
  total,
  size = 72,
  stroke = 7,
  tone = 'light',
}: {
  earned: number;
  total: number;
  size?: number;
  stroke?: number;
  tone?: 'light' | 'dark';
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(100, Math.max(0, (earned / total) * 100)) : 0;
  const dash = (pct / 100) * circumference;
  const trackStroke = tone === 'dark' ? 'rgba(255, 247, 236, 0.22)' : 'rgba(58, 40, 16, 0.12)';
  const trackFill = tone === 'dark' ? 'rgba(0, 0, 0, 0.14)' : 'rgba(255, 247, 236, 0.55)';
  const progressStroke = tone === 'dark' ? PROFILE_THEME.gold : PROFILE_THEME.accent;
  const countColor = tone === 'dark' ? PROFILE_THEME.heroText : PROFILE_THEME.ink;
  const totalColor = tone === 'dark' ? PROFILE_THEME.heroMuted : JOURNEY_ACCENTS.badges.color;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackStroke}
          strokeWidth={stroke}
          fill={trackFill}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressStroke}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
        <Text className="font-serif font-bold text-lg leading-5" style={{ color: countColor }}>
          {earned}
        </Text>
        <Text className="text-[10px] font-semibold -mt-0.5" style={{ color: totalColor }}>
          /{total}
        </Text>
      </View>
    </View>
  );
}
