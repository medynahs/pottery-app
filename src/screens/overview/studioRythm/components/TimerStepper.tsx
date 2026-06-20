import { Text } from '@/src/components/ui/text';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface TimerStepperProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}

export function TimerStepper({
  label,
  description,
  value,
  min,
  max,
  unit = 'd',
  onChange,
}: TimerStepperProps) {
  return (
    <View className="rounded-2xl border border-border bg-background px-4 py-3.5 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-foreground">{label}</Text>
          <Text className="text-xs text-muted-foreground mt-1 leading-4">{description}</Text>
        </View>
        <View className="flex-row items-center gap-2 rounded-xl border border-border bg-muted/30 px-1 py-1">
          <TouchableOpacity
            onPress={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-lg border border-border items-center justify-center bg-card"
          >
            <ChevronDown size={15} color={value <= min ? 'hsl(24 10% 70%)' : 'hsl(24 25% 15%)'} />
          </TouchableOpacity>
          <Text className="text-base font-bold text-foreground w-10 text-center">
            {value}
            <Text className="text-xs font-semibold text-muted-foreground">{unit}</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-lg border border-border items-center justify-center bg-card"
          >
            <ChevronUp size={15} color={value >= max ? 'hsl(24 10% 70%)' : 'hsl(24 25% 15%)'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
