import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { RHYTHM_BROWN } from '../rhythmTheme';

export function RhythmSectionLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <View className="mb-3">
      <Text
        style={{
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.9,
          color: RHYTHM_BROWN.inkSoft,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
      {hint ? (
        <Text className="text-xs leading-4 mt-1" style={{ color: RHYTHM_BROWN.inkMuted }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
