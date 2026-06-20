import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import type { RhythmIconComponent } from '../studioRhythmIcons';
import { RhythmIconBadge } from './RhythmIconBadge';

export function DryingChip({
  Icon,
  label,
  value,
  unit = 'd',
  color,
  bg,
}: {
  Icon: RhythmIconComponent;
  label: string;
  value: number;
  unit?: string;
  color: string;
  bg: string;
}) {
  return (
    <View className="flex-1 min-w-[46%] rounded-xl border border-border bg-background px-3 py-3">
      <RhythmIconBadge Icon={Icon} color={color} backgroundColor={bg} size="sm" />
      <Text className="text-xs font-medium text-muted-foreground mt-2">{label}</Text>
      <Text className="text-lg font-bold text-foreground mt-0.5">
        {value}
        <Text className="text-sm font-semibold text-muted-foreground">{unit}</Text>
      </Text>
    </View>
  );
}
