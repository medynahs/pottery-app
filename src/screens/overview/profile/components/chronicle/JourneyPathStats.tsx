import { Text } from '@/src/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { STAT_STAMP_STYLES } from '../../journeyTheme';

export function JourneyPathStats({
  stats,
}: {
  stats: {
    key: string;
    label: string;
    value: string;
    sub?: string;
    tone: keyof typeof STAT_STAMP_STYLES;
    icon: LucideIcon;
  }[];
}) {
  return (
    <View className="mb-6">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {stats.map(({ key, label, value, sub, tone, icon: Icon }) => {
          const palette = STAT_STAMP_STYLES[tone];
          return (
            <View
              key={key}
              className="rounded-[22px] border px-4 py-3.5"
              style={{
                minWidth: 132,
                backgroundColor: palette.soft,
                borderColor: palette.border,
                shadowColor: '#3a2310',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <View
                className="w-9 h-9 rounded-xl items-center justify-center mb-2.5 border"
                style={{ backgroundColor: '#FFFBF2', borderColor: palette.border }}
              >
                <Icon size={17} color={palette.accent} />
              </View>
              <Text
                className="text-[9px] font-bold uppercase tracking-wider mb-1"
                style={{ color: palette.accent }}
              >
                {label}
              </Text>
              <Text
                className="font-serif text-[26px] leading-8"
                style={{ color: 'hsl(24 55% 22%)', fontFamily: 'Fraunces_700Bold' }}
              >
                {value}
              </Text>
              {sub ? (
                <Text className="text-[10px] mt-0.5 leading-4" style={{ color: 'hsl(32 28% 44%)' }}>
                  {sub}
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
