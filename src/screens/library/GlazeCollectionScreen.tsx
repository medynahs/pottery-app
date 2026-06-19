import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import { normalizeCone } from '@/src/screens/library/discover/types';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { ChevronLeft, Droplets } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlazeAtlasGrid } from './GlazeAtlasGrid';
import {
  FAVORITES_COLLECTION,
  MY_GLAZES_COLLECTION,
  collectionLabel,
  filterGlazesByCollection,
  slugToCollectionKey,
} from './atlas/collections';

type GlazeCollectionScreenProps = {
  collectionSlug: string;
};

export default function GlazeCollectionScreen({
  collectionSlug,
}: GlazeCollectionScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((s) => s.glazes);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);

  const collectionKey = React.useMemo(
    () => slugToCollectionKey(collectionSlug),
    [collectionSlug],
  );
  const title = collectionLabel(collectionKey);
  const userConeNorm = defaultGlazeTemp ? normalizeCone(defaultGlazeTemp) : null;

  const filteredGlazes = React.useMemo(() => {
    const list = filterGlazesByCollection(glazes, collectionKey);
    return [...list].sort(
      (a, b) =>
        new Date(b.lastTestedAt ?? b.createdAt).getTime() -
        new Date(a.lastTestedAt ?? a.createdAt).getTime(),
    );
  }, [collectionKey, glazes]);

  const emptyCopy = React.useMemo(() => {
    if (collectionKey === 'favorites') {
      return {
        title: 'No favorites yet',
        description: 'Star a glaze from its detail page to see it here.',
      };
    }
    if (collectionKey === 'all') {
      return {
        title: 'No glazes yet',
        description: 'Add your own glaze or save one from Discover to start your atlas.',
        ctaLabel: 'Add Glaze' as const,
      };
    }
    return {
      title: 'Collection is empty',
      description: 'Add glazes to this collection when saving, or from Add Glaze.',
    };
  }, [collectionKey]);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-3 border-b border-border">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            className="w-9 h-9 rounded-full bg-muted items-center justify-center"
          >
            <ChevronLeft size={20} color="hsl(24 20% 35%)" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-primary">
              Collection
            </Text>
            <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold', lineHeight: 32 }}>
              {title}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {filteredGlazes.length} glaze{filteredGlazes.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 28, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredGlazes.length === 0 ? (
          <View className="px-6">
            <EmptyState
              icon={Droplets}
              title={emptyCopy.title}
              description={emptyCopy.description}
              ctaLabel={emptyCopy.ctaLabel}
              onCtaPress={
                emptyCopy.ctaLabel
                  ? () => router.replace('/(tabs)/library?action=add-glaze' as never)
                  : undefined
              }
            />
          </View>
        ) : (
          <GlazeAtlasGrid glazes={filteredGlazes} userConeNorm={userConeNorm} />
        )}
      </ScrollView>
    </View>
  );
}
