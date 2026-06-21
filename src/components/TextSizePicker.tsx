import { Text } from '@/src/components/ui/text';
import { TEXT_SCALE_DESCRIPTIONS, TEXT_SCALE_LABELS, type TextScale } from '@/src/constants/typography';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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
            className={`rounded-xl border px-3 py-2.5 ${active ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
          >
            <Text className={`text-sm font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
              {TEXT_SCALE_LABELS[scale]}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{TEXT_SCALE_DESCRIPTIONS[scale]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
