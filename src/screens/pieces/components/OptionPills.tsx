import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';

interface OptionPillsProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export function OptionPills({ options, value, onChange }: OptionPillsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map(opt => {
        const isActive = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(isActive ? '' : opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            className={`px-3 py-1.5 rounded-full border ${
              isActive ? 'bg-foreground border-foreground' : 'bg-card border-border'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isActive ? 'text-background' : 'text-muted-foreground'
              }`}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
