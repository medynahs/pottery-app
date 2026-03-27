import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface CemeteryBannerProps {
  count: number;
}

export function CemeteryBanner({ count }: CemeteryBannerProps) {
  return (
    <Card className="mb-6 p-8 items-center border-2 border-dashed border-muted bg-muted/30">
      <Text className="text-2xl font-serif font-bold text-foreground italic mb-2">
        The Kiln Gods' Garden
      </Text>
      <Text className="text-sm text-muted-foreground text-center leading-relaxed max-w-[240px]">
        "Every crack is a lesson, every explosion a story. We honor the pieces that didn't make it."
      </Text>
      <View className="flex-row items-center gap-6 mt-6">
        <View className="items-center">
          <Text className="text-xl font-serif font-bold text-primary">{count}</Text>
          <Text className="text-[10px] uppercase tracking-widest text-muted-foreground">Honored</Text>
        </View>
        <View className="w-px h-8 bg-border" />
        <View className="items-center">
          <Sparkles size={18} color="hsl(38 55% 55%)" />
          <Text className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Lessons</Text>
        </View>
      </View>
    </Card>
  );
}
