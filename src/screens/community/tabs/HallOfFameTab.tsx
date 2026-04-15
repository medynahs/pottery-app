// src/screens/community/tabs/HallOfFameTab.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Award, Trophy } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { WALL_OF_FAME } from '../data';

export function HallOfFameTab() {
  return (
    <>
      <View className="rounded-3xl border border-orange-200 bg-orange-50 p-5">
        <View className="flex-row items-center gap-2 mb-2">
          <Award size={15} color="hsl(25 90% 55%)" />
          <Text className="text-xs font-bold" style={{ color: 'hsl(25 90% 55%)' }}>Season Results</Text>
        </View>
        <Text className="text-lg font-serif font-bold text-foreground">Wall of Fame</Text>
        <Text className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Celebrate top form, best improvement, and community-voted favorites from current challenges.
        </Text>
      </View>

      {WALL_OF_FAME.map((entry) => (
        <Card key={entry.name + entry.title} className="p-4">
          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
              <Trophy size={14} color="hsl(25 90% 45%)" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-foreground">{entry.name}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">{entry.title} · {entry.piece}</Text>
              <View className="self-start mt-2 px-2 py-1 rounded-full bg-muted border border-border">
                <Text className="text-[10px] font-medium text-muted-foreground">{entry.badge}</Text>
              </View>
            </View>
          </View>
        </Card>
      ))}
    </>
  );
}
