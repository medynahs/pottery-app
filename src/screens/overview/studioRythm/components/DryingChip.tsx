import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';

export function DryingChip({ emoji, label, value }: { emoji: string; label: string; value: number }) {
  return (
    <View className="flex-row items-center gap-2 bg-muted/40 rounded-xl px-3 py-2">
      <Text className="text-sm">{emoji}</Text>
      <View>
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-sm font-semibold text-foreground">{value}d</Text>
      </View>
    </View>
  );
}
