import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ANALYTICS_THEME } from '../analyticsTheme';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View
      className="flex-row rounded-2xl p-1 border"
      style={{
        backgroundColor: ANALYTICS_THEME.accentSoft,
        borderColor: ANALYTICS_THEME.cardBorder,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.82}
            className="flex-1 rounded-xl py-2 items-center"
            style={{
              backgroundColor: active ? ANALYTICS_THEME.chipActiveBg : 'transparent',
              shadowColor: active ? ANALYTICS_THEME.shadow : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: active ? 0.15 : 0,
              shadowRadius: 4,
              elevation: active ? 2 : 0,
            }}
          >
            <Text
              className="text-[11px] font-bold"
              style={{ color: active ? ANALYTICS_THEME.heroText : ANALYTICS_THEME.inkMuted }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
