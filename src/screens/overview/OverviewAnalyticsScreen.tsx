import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function pct(value: number, max: number) {
  return Math.min(100, Math.round((value / Math.max(1, max)) * 100));
}

export default function OverviewAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pieces = useAppStore((state) => state.pieces);

  const inProgress = pieces.filter((piece) => ['idea', 'forming', 'leather-hard', 'trimming'].includes(piece.stage)).length;
  const finished = pieces.filter((piece) => piece.stage === 'finished').length;
  const glazeReady = pieces.filter((piece) => piece.stage === 'glaze-fired' || piece.stage === 'bone-dry').length;

  const badges = [
    { id: 'steady-hands', title: 'Steady Hands', current: inProgress, target: 8 },
    { id: 'kiln-ready', title: 'Kiln Ready', current: glazeReady, target: 5 },
    { id: 'finisher', title: 'Finisher', current: finished, target: 12 },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Studio Analytics
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">Snapshot and badge progress.</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-muted px-4 py-2 rounded-full">
          <Text className="text-sm font-medium text-foreground">Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 mt-4" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View className="flex-row flex-wrap gap-3 mb-4">
          <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
            <Text className="text-xs text-muted-foreground">In Progress</Text>
            <Text className="text-2xl font-serif font-bold text-foreground mt-1">{inProgress}</Text>
          </Card>
          <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
            <Text className="text-xs text-muted-foreground">Finished</Text>
            <Text className="text-2xl font-serif font-bold text-foreground mt-1">{finished}</Text>
          </Card>
        </View>

        <Card className="rounded-2xl border-border bg-card p-4">
          <Text className="text-base font-serif font-bold text-foreground mb-3">Badge Progress</Text>
          {badges.map((badge) => (
            <View key={badge.id} className="mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm text-foreground">{badge.title}</Text>
                <Text className="text-xs text-muted-foreground">{badge.current}/{badge.target}</Text>
              </View>
              <View className="h-2 rounded-full bg-muted overflow-hidden">
                <View className="h-full rounded-full bg-primary" style={{ width: `${pct(badge.current, badge.target)}%` }} />
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}
