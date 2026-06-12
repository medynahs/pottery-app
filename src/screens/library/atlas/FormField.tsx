import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';

export function FormField({
  label,
  hint,
  children,
  first,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <View className={first ? 'mt-5' : 'mt-4'}>
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </Text>
      {hint ? (
        <Text className="text-xs text-muted-foreground mb-2 leading-5">{hint}</Text>
      ) : null}
      {children}
    </View>
  );
}
