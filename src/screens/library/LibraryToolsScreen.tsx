import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useRouter } from 'expo-router';
import { Wrench } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOOL_GUIDES = [
  {
    title: 'Beginner Hand Tools',
    summary: 'Start with ribs, sponge, needle tool, wire cutter, and one trimming tool.',
    badge: 'Starter',
  },
  {
    title: 'Kiln Basics',
    summary: 'Cone ranges, loading habits, and what to track in early firing logs.',
    badge: 'Core Skill',
  },
];

export default function LibraryToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-4 border-b border-border bg-background">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 pr-3">
            <Text className="text-3xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              Tool Guide
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Calm, practical references for your setup.
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} className="px-4 py-2 rounded-full bg-muted">
            <Text className="text-sm font-medium text-foreground">Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-5 gap-3">
          {TOOL_GUIDES.map((tool) => (
            <Card key={tool.title} className="p-5">
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-2xl bg-muted items-center justify-center">
                  <Wrench size={18} color="hsl(24 20% 40%)" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{tool.title}</Text>
                  <Text className="text-sm text-muted-foreground mt-1 leading-6">{tool.summary}</Text>
                </View>
                <Badge variant="outline" className="rounded-full px-2.5 py-1">
                  <Text className="text-[10px] font-medium text-muted-foreground">{tool.badge}</Text>
                </Badge>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
