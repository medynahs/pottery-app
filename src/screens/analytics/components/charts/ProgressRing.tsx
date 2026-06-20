import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ANALYTICS_THEME } from '../../analyticsTheme';

type ProgressRingProps = {
  value: number | null;
  size?: number;
  stroke?: number;
  label: string;
  sublabel?: string;
  tone?: 'cream' | 'ink';
};

export function ProgressRing({
  value,
  size = 88,
  stroke = 9,
  label,
  sublabel,
  tone = 'cream',
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = value != null ? Math.min(100, Math.max(0, value)) : 0;
  const dash = (pct / 100) * circumference;
  const trackColor = tone === 'cream' ? 'rgba(255, 244, 224, 0.22)' : ANALYTICS_THEME.accentSoft;
  const progressColor = tone === 'cream' ? ANALYTICS_THEME.gold : ANALYTICS_THEME.accent;
  const textColor = tone === 'cream' ? ANALYTICS_THEME.heroText : ANALYTICS_THEME.ink;
  const mutedColor = tone === 'cream' ? ANALYTICS_THEME.heroMuted : ANALYTICS_THEME.inkMuted;

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <Text
            className="font-serif font-bold"
            style={{ fontSize: size * 0.22, color: textColor }}
          >
            {value != null ? `${Math.round(value)}%` : '—'}
          </Text>
        </View>
      </View>
      <Text
        className="text-[10px] uppercase tracking-wider mt-2 text-center"
        style={{ color: mutedColor }}
      >
        {label}
      </Text>
      {sublabel ? (
        <Text className="text-[10px] mt-0.5 text-center" style={{ color: mutedColor }}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}
