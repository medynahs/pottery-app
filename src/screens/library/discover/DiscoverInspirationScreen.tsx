import { Text } from '@/src/components/ui/text';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDiscoverInspiration } from './recipeLookup';

export default function DiscoverInspirationScreen({ inspirationId }: { inspirationId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inspiration = getDiscoverInspiration(inspirationId);

  if (!inspiration) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-lg text-foreground mb-4" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
          Idea not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="px-4 py-2 rounded-xl bg-primary">
          <Text className="text-sm font-semibold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="relative">
          {inspiration.previewUri ? (
            <Image
              source={{ uri: inspiration.previewUri }}
              style={{ width: '100%', height: 320 }}
              contentFit="cover"
            />
          ) : (
            <View style={{ width: '100%', height: 320, backgroundColor: inspiration.colorHex }} />
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="absolute w-10 h-10 rounded-full bg-black/45 items-center justify-center"
            style={{ top: insets.top + 8, left: 16 }}
          >
            <ChevronLeft size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-6 pt-5">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Layering idea
          </Text>
          <Text className="text-3xl text-foreground mt-1" style={{ fontFamily: 'Fraunces_700Bold' }}>
            {inspiration.title}
          </Text>

          <View className="self-start px-3 py-1 rounded-full bg-muted mt-3">
            <Text className="text-xs font-semibold text-foreground">{inspiration.coneLabel}</Text>
          </View>

          <Text className="text-sm text-muted-foreground mt-4 leading-6">{inspiration.description}</Text>

          <View className="mt-6 rounded-2xl border border-border bg-card px-4 py-4">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Application notes
            </Text>
            <Text className="text-sm text-foreground leading-6">{inspiration.applicationNotes}</Text>
          </View>

          <Text className="text-xs text-muted-foreground mt-5 leading-5">
            Reference only — log your own test tile or add glazes to My Atlas when you try this stack.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
