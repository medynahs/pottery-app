// src/screens/community/tabs/DropsTab.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Flame } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

export function DropsTab() {
  return (
    <>
      <View className="rounded-2xl border border-primary/25 bg-primary/10 p-4 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-primary/15 items-center justify-center flex-shrink-0">
          <Flame size={18} color="hsl(39 57% 51%)" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-0.5">
            <Text className="text-xs font-bold" style={{ color: 'hsl(39 57% 51%)' }}>Clay & Co.</Text>
            <View className="px-2 py-0.5 rounded-full bg-primary/20">
              <Text className="text-xs font-bold" style={{ color: 'hsl(39 57% 45%)' }}>🔥 Just dropped</Text>
            </View>
          </View>
          <Text className="text-sm text-foreground font-medium">Limited Raku Vase — Batch of 6</Text>
        </View>
      </View>

      <Card className="p-4">
        <Text className="text-sm font-bold text-foreground">Marketplace Discovery</Text>
        <Text className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Explore community drops and creator pieces without mixing this into Library prep workflows.
        </Text>
      </Card>
    </>
  );
}
