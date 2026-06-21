import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

const TONES = {
  clay: { accent: 'hsl(39 57% 51%)' },
  kiln: { accent: 'hsl(12 55% 48%)' },
  finish: { accent: 'hsl(142 40% 38%)' },
  atlas: { accent: 'hsl(200 45% 42%)' },
} as const;

export function JourneyStatGrid({
  stats,
}: {
  stats: Array<{
    key: string;
    label: string;
    value: string;
    sub?: string;
    tone: keyof typeof TONES;
    icon: LucideIcon;
  }>;
}) {
  return (
    <View className="mx-6 flex-row flex-wrap gap-2.5 mb-4">
      {stats.map(({ key, label, value, sub, tone, icon: Icon }) => {
        const palette = TONES[tone];
        return (
          <Card key={key} className="rounded-2xl p-3.5" style={{ width: '48%' }}>
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-7 h-7 rounded-xl items-center justify-center bg-muted">
                <Icon size={14} color={palette.accent} />
              </View>
              <Text
                className="text-[9px] uppercase tracking-wider font-semibold flex-1 text-muted-foreground"
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
            <Text className="text-[22px] font-serif font-bold leading-7 text-foreground">
              {value}
            </Text>
            {sub ? (
              <Text className="text-[10px] mt-0.5 text-muted-foreground">{sub}</Text>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}
