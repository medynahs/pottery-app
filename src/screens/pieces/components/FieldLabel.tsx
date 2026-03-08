import { Text } from '@/src/components/ui/text';
import React from 'react';

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </Text>
  );
}
