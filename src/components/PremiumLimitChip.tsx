import { Text } from '@/src/components/ui/text';
import { Crown } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type PremiumLimitChipProps = {
  label: string;
  hint?: string;
  onPress?: () => void;
};

/** Small proactive limit indicator — tap opens upgrade when onPress is set. */
export function PremiumLimitChip({ label, hint, onPress }: PremiumLimitChipProps) {
  const content = (
    <View
      className="flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1 border"
      style={{ borderColor: 'hsl(39 57% 51% / 0.28)', backgroundColor: 'hsl(39 55% 96%)' }}
    >
      <Crown size={11} color="hsl(39 57% 51%)" />
      <Text className="text-[11px] font-semibold text-primary">{label}</Text>
      {hint ? <Text className="text-[11px] text-muted-foreground">· {hint}</Text> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} accessibilityRole="button">
      {content}
    </TouchableOpacity>
  );
}
