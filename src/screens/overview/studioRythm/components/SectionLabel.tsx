import { Text } from '@/src/components/ui/text';
import React from 'react';

export function SectionLabel({ label, noMargin }: { label: string; noMargin?: boolean }) {
  return (
    <Text className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${noMargin ? '' : 'mb-2'}`}>
      {label}
    </Text>
  );
}
