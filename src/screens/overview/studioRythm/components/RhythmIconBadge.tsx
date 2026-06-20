import React from 'react';
import { View } from 'react-native';
import type { RhythmIconComponent } from '../studioRhythmIcons';

interface RhythmIconBadgeProps {
  Icon: RhythmIconComponent;
  color: string;
  backgroundColor: string;
  size?: 'sm' | 'md' | 'lg';
  borderColor?: string;
}

const SIZE_MAP = {
  sm: { box: 32, icon: 14 },
  md: { box: 40, icon: 17 },
  lg: { box: 44, icon: 20 },
};

export function RhythmIconBadge({
  Icon,
  color,
  backgroundColor,
  size = 'md',
  borderColor,
}: RhythmIconBadgeProps) {
  const dims = SIZE_MAP[size];
  return (
    <View
      className="rounded-xl items-center justify-center border"
      style={{
        width: dims.box,
        height: dims.box,
        backgroundColor,
        borderColor: borderColor ?? `${color}44`,
      }}
    >
      <Icon size={dims.icon} color={color} />
    </View>
  );
}
