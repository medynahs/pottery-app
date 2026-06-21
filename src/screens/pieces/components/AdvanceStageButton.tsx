import { Text } from '@/src/components/ui/text';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface AdvanceStageButtonProps {
  stageLabel: string;
  /** Appended on a second line when set, e.g. "all" for batch cards. */
  suffix?: string;
  onPress: () => void;
  className?: string;
}

export function AdvanceStageButton({
  stageLabel,
  suffix,
  onPress,
  className,
}: AdvanceStageButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-1 flex-row items-center gap-1.5 px-2 py-2.5 rounded-xl bg-primary/10 min-h-[44px] ${className ?? ''}`}
    >
      <Text
        style={{ flex: 1, minWidth: 0 }}
        className="text-[10px] font-body-medium text-primary text-center leading-[13px]"
        numberOfLines={2}
      >
        {stageLabel}
        {suffix ? ` ${suffix}` : ''}
      </Text>
      <View className="shrink-0">
        <ArrowRight size={11} color="hsl(39 57% 51%)" />
      </View>
    </TouchableOpacity>
  );
}
