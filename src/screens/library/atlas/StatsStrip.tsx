import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';

export function StatsStrip({
  glazeCount,
  testCount,
}: {
  glazeCount: number;
  testCount: number;
  collectionCount?: number;
}) {
  const stats = [
    { label: 'Glazes', value: glazeCount },
    { label: 'Tests logged', value: testCount },
  ];

  return (
    <View className="mx-6 mt-4 flex-row items-center gap-6">
      {stats.map(({ label, value }, i) => (
        <React.Fragment key={label}>
          <View>
            <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              {value}
            </Text>
            <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </Text>
          </View>
          {i < stats.length - 1 ? <View className="w-px h-8 bg-border" /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}
