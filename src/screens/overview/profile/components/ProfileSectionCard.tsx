import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';

export function ProfileSectionCard({
  title,
  hint,
  children,
  icon,
  trailing,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  accent?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <Card className="mb-4 overflow-hidden rounded-2xl">
      <View className="px-4 py-3.5 flex-row items-center gap-3 border-b border-border bg-muted/40">
        {icon ? (
          <View className="w-10 h-10 rounded-2xl items-center justify-center bg-card border border-border">
            {icon}
          </View>
        ) : null}
        <View className="flex-1">
          <Text className="text-[15px] font-serif font-bold text-foreground">{title}</Text>
          {hint ? (
            <Text className="text-[11px] mt-0.5 leading-4 text-muted-foreground">{hint}</Text>
          ) : null}
        </View>
        {trailing}
      </View>
      <View className="p-4">{children}</View>
    </Card>
  );
}
