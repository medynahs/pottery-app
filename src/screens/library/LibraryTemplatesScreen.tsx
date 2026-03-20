import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useRouter } from 'expo-router';
import { Thermometer } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OWNED_ASSETS = [
  {
    title: '30-Day Cylinder Challenge',
    type: 'Roadmap',
    difficulty: 'Beginner',
    source: 'Library',
    ownership: 'Purchased',
    lastUsed: 'Used 2 days ago',
  },
  {
    title: 'Pouring Pitcher Build Template',
    type: 'Template',
    difficulty: 'Intermediate',
    source: 'Library',
    ownership: 'Purchased',
    lastUsed: 'Used 1 week ago',
  },
  {
    title: 'Production Mug Checklist',
    type: 'Checklist',
    difficulty: 'All Levels',
    source: 'Community Save',
    ownership: 'Saved',
    lastUsed: 'Used today',
  },
  {
    title: 'Local Studio Loading Notes',
    type: 'Reference',
    difficulty: 'All Levels',
    source: 'Your Studio',
    ownership: 'Owned',
    lastUsed: 'Used yesterday',
  },
];

const AVAILABLE_ASSETS = [
  {
    title: 'Cone 6 Studio Starter Pack',
    type: 'Reference Set',
    summary: 'Starter firing, trimming, and glaze-reference bundle.',
  },
  {
    title: 'Weekend Teaching Flow',
    type: 'Lesson Template',
    summary: 'Simple structure for beginner workshops and demos.',
  },
];

export default function LibraryTemplatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-4 border-b border-border bg-background">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 pr-3">
            <Text className="text-3xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              Templates
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Purchased templates and saved references already in your library.
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} className="px-4 py-2 rounded-full bg-muted">
            <Text className="text-sm font-medium text-foreground">Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-5 mb-3 flex-row items-end justify-between gap-3">
          <View className="flex-1 pr-3">
            <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Owned & Saved Assets</Text>
            <Text className="text-xs text-muted-foreground mt-1">Your current library items.</Text>
          </View>
          <Text className="text-xs font-semibold text-primary">{OWNED_ASSETS.length} items</Text>
        </View>

        <View className="px-6 gap-3 mb-8">
          {OWNED_ASSETS.map((asset) => (
            <Card key={asset.title} className="p-5">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 pr-3">
                  <Text className="text-[10px] uppercase tracking-[1.2px] text-primary font-bold mb-1">{asset.type}</Text>
                  <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{asset.title}</Text>
                  <Text className="text-xs text-muted-foreground mt-1">{asset.difficulty} · {asset.source}</Text>
                </View>
                <View className="items-end">
                  <Badge variant="outline" className="rounded-full px-2.5 py-1">
                    <Text className="text-[10px] font-medium text-muted-foreground">{asset.ownership}</Text>
                  </Badge>
                  <Text className="text-[10px] text-muted-foreground mt-2">{asset.lastUsed}</Text>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.82} className="mt-4 rounded-xl border border-border bg-background px-3 py-2.5 items-center">
                <Text className="text-xs font-medium text-foreground">Open asset</Text>
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        <View className="px-6 mb-3 flex-row items-end justify-between gap-3">
          <View className="flex-1 pr-3">
            <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Available to Explore</Text>
            <Text className="text-xs text-muted-foreground mt-1">Collections you can review and save later.</Text>
          </View>
          <Text className="text-xs font-semibold text-primary">{AVAILABLE_ASSETS.length} collections</Text>
        </View>

        <View className="px-6 gap-3 mb-10">
          {AVAILABLE_ASSETS.map((asset) => (
            <Card key={asset.title} className="p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-2xl bg-amber-50 items-center justify-center">
                  <Thermometer size={16} color="hsl(25 90% 55%)" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{asset.title}</Text>
                  <Text className="text-xs text-muted-foreground mt-1">{asset.type}</Text>
                  <Text className="text-xs text-muted-foreground mt-1 leading-5">{asset.summary}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
