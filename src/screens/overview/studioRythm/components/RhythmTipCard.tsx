import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { RHYTHM_BROWN } from '../rhythmTheme';

interface RhythmTipCardProps {
  title: string;
  body: string;
}

export function RhythmTipCard({ title, body }: RhythmTipCardProps) {
  return (
    <View
      className="rounded-2xl border px-4 py-3.5 mb-5"
      style={{ backgroundColor: RHYTHM_BROWN.iconBg, borderColor: RHYTHM_BROWN.surfaceBorder }}
    >
      <Text className="text-sm font-bold mb-1" style={{ color: RHYTHM_BROWN.ink }}>
        {title}
      </Text>
      <Text className="text-xs leading-5" style={{ color: RHYTHM_BROWN.inkMuted }}>
        {body}
      </Text>
    </View>
  );
}
