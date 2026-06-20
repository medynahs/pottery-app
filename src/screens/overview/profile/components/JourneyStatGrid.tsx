import { Text } from '@/src/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { PROFILE_THEME } from '../profileTheme';

const TONES = {
  clay: { bg: 'hsl(24 45% 94%)', border: 'hsl(24 35% 82%)', accent: '#B86A3C' },
  kiln: { bg: 'hsl(12 55% 94%)', border: 'hsl(12 40% 82%)', accent: '#D4644A' },
  finish: { bg: 'hsl(142 35% 93%)', border: 'hsl(142 28% 80%)', accent: '#6B9E78' },
  atlas: { bg: 'hsl(200 40% 93%)', border: 'hsl(200 30% 82%)', accent: '#5B8FA8' },
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
    <View className="mx-4 flex-row flex-wrap gap-2.5 mb-4">
      {stats.map(({ key, label, value, sub, tone, icon: Icon }) => {
        const palette = TONES[tone];
        return (
          <View
            key={key}
            className="rounded-[20px] border p-3.5"
            style={{
              width: '48%',
              backgroundColor: palette.bg,
              borderColor: palette.border,
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <View
                className="w-7 h-7 rounded-xl items-center justify-center"
                style={{ backgroundColor: PROFILE_THEME.cardBg, borderWidth: 1, borderColor: palette.border }}
              >
                <Icon size={14} color={palette.accent} />
              </View>
              <Text
                className="text-[9px] uppercase tracking-wider font-semibold flex-1"
                style={{ color: PROFILE_THEME.inkMuted }}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
            <Text className="text-[22px] font-serif font-bold leading-7" style={{ color: PROFILE_THEME.ink }}>
              {value}
            </Text>
            {sub ? (
              <Text className="text-[10px] mt-0.5" style={{ color: PROFILE_THEME.inkMuted }}>{sub}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
