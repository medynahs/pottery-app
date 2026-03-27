import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import React from 'react';

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const Pill = React.memo(function Pill({ label, active, onPress }: PillProps) {
  const handlePress = React.useCallback(onPress, [onPress]);
  return (
    <Pressable
      onPress={handlePress}
      className={`px-3 py-2 rounded-full border ${active ? 'bg-foreground border-foreground' : 'bg-card border-border'}`}
    >
      <Text className={`text-xs font-medium ${active ? 'text-background' : 'text-muted-foreground'}`}>{label}</Text>
    </Pressable>
  );
});