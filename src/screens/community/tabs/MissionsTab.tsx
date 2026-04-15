// src/screens/community/tabs/MissionsTab.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Zap } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { GROUP_MISSIONS } from '../data';

export function MissionsTab() {
  return (
    <>
      <Card className="p-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-serif font-bold text-foreground">Group Missions</Text>
          <View className="px-2 py-1 rounded-full bg-blue-50 border border-blue-100">
            <Text className="text-[10px] font-bold text-blue-700">Co-op</Text>
          </View>
        </View>
        <Text className="text-sm text-muted-foreground leading-relaxed">
          Pick one mission with your studio circle and earn shared progress plus personal XP.
        </Text>
      </Card>

      {GROUP_MISSIONS.map((mission) => (
        <Card key={mission.title} className="p-4">
          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-2xl bg-amber-50 items-center justify-center">
              <Zap size={16} color="hsl(38 80% 50%)" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="text-sm font-bold text-foreground flex-1">{mission.title}</Text>
                <Text className="text-xs font-semibold text-primary">{mission.xp}</Text>
              </View>
              <Text className="text-xs text-muted-foreground mt-1">
                {mission.members} members · {mission.status}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </>
  );
}
