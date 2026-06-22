import { BrandColors } from '@/src/constants/theme';
import {
  scaleFont,
  TEXT_SCALE_DESCRIPTIONS,
  TEXT_SCALE_LABELS,
  type TextScale,
} from '@/src/constants/typography';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type TextSizePickerProps = {
  value: TextScale;
  onChange: (scale: TextScale) => void;
};

export function TextSizePicker({ value, onChange }: TextSizePickerProps) {
  return (
    <View className="gap-2">
      {(Object.keys(TEXT_SCALE_LABELS) as TextScale[]).map((scale) => {
        const active = value === scale;
        return (
          <TouchableOpacity
            key={scale}
            onPress={() => onChange(scale)}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            className={`rounded-xl border px-3 py-3 ${active ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
          >
            <Text
              style={{
                fontSize: scaleFont(15, scale),
                fontWeight: '600',
                color: active ? 'hsl(24 30% 12%)' : 'hsl(24 14% 42%)',
              }}
            >
              {TEXT_SCALE_LABELS[scale]}
            </Text>
            <Text
              style={{
                fontSize: scaleFont(12, scale),
                color: 'hsl(24 14% 48%)',
                marginTop: 4,
                lineHeight: scaleFont(17, scale),
              }}
            >
              {TEXT_SCALE_DESCRIPTIONS[scale]}
            </Text>
            {active ? (
              <View
                className="absolute top-3 right-3 w-2 h-2 rounded-full"
                style={{ backgroundColor: BrandColors.primary }}
              />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
