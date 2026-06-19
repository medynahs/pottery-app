import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { BookOpen } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

type DiscoverProvenanceBannerProps = {
  glaze: GlazeLibraryItem;
};

export function DiscoverProvenanceBanner({ glaze }: DiscoverProvenanceBannerProps) {
  if (!glaze.discoverSourceRecipeId) return null;

  return (
    <View className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 mb-4">
      <View className="flex-row items-center gap-2 mb-1">
        <BookOpen size={14} color="hsl(39 57% 45%)" />
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          From Discover
        </Text>
      </View>
      <Text className="text-sm text-foreground leading-5">
        Saved from the Glaze Atlas starter catalog. Edit freely — this is your copy in My Atlas.
      </Text>
      {glaze.discoverSavedAt ? (
        <Text className="text-[11px] text-muted-foreground mt-1">
          Saved {new Date(glaze.discoverSavedAt).toLocaleDateString()}
        </Text>
      ) : null}
    </View>
  );
}
