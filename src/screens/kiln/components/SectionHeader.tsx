// src/screens/kiln/components/SectionHeader.tsx
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeader({ title, icon, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="font-serif text-xl font-bold text-foreground">{title}</Text>
      </View>
      {action}
    </View>
  );
}
