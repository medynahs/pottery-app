import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ROADMAPS = [
  {
    title: 'Beginner Wheel Fundamentals',
    level: 'Beginner',
    progress: 0.65,
    stepsCompleted: 5,
    stepsTotal: 8,
    summary: 'Wedging, centering, opening, and pulling with a clear weekly sequence.',
  },
  {
    title: 'Glaze Testing Habit',
    level: 'Intermediate',
    progress: 0.3,
    stepsCompleted: 3,
    stepsTotal: 10,
    summary: 'Track test tiles, layer combos, and cone-based learning in one place.',
  },
];

export default function LibraryRoadmapsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-4 border-b border-border bg-background">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 pr-3">
            <Text className="text-3xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              Roadmaps
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Structured paths you can open and continue.
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} className="px-4 py-2 rounded-full bg-muted">
            <Text className="text-sm font-medium text-foreground">Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-5 gap-3">
          {ROADMAPS.map((roadmap) => (
            <Card key={roadmap.title} className="p-5">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-semibold text-primary uppercase tracking-[1.2px]">{roadmap.level}</Text>
                  <Text className="text-lg text-foreground mt-1" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                    {roadmap.title}
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-2 leading-6">{roadmap.summary}</Text>
                </View>
                <View className="px-3 py-1 rounded-full bg-muted">
                  <Text className="text-xs font-semibold text-muted-foreground">
                    {roadmap.stepsCompleted}/{roadmap.stepsTotal}
                  </Text>
                </View>
              </View>
              <View className="w-full h-2 rounded-full mt-4 overflow-hidden bg-muted">
                <View className="h-full rounded-full bg-primary" style={{ width: `${roadmap.progress * 100}%` }} />
              </View>
              <TouchableOpacity activeOpacity={0.8} className="mt-4 rounded-xl border border-border bg-background px-3 py-2.5 flex-row items-center justify-center gap-1">
                <Text className="text-xs font-medium text-foreground">Open roadmap</Text>
                <ChevronRight size={14} color="hsl(24 20% 40%)" />
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
