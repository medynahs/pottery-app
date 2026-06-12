import { EmptyState } from '@/src/components/EmptyState';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import {
  buildGlazesByCollection,
  DEFAULT_GLAZE_COLLECTIONS,
} from '@/src/screens/library/atlas/collections';
import { useRouter } from 'expo-router';
import { Droplets } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CollectionsGrid } from './atlas/CollectionsGrid';
import { RecentTestWall } from './atlas/RecentTestWall';
import { StatsStrip } from './atlas/StatsStrip';

type LibraryGlazesScreenProps = {
  glazes: GlazeLibraryItem[];
  glazeTests: GlazeTestTile[];
  onAddGlaze: () => void;
  onLogTest: () => void;
};

export default function LibraryGlazesScreen({
  glazes,
  glazeTests,
  onAddGlaze,
  onLogTest,
}: LibraryGlazesScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const glazesByCollection = React.useMemo(
    () => buildGlazesByCollection(glazes),
    [glazes],
  );

  const collectionRows = React.useMemo(
    () => [Array.from(DEFAULT_GLAZE_COLLECTIONS)],
    [],
  );

  const recentTests = React.useMemo(
    () =>
      [...glazeTests]
        .sort((a, b) => new Date(b.firingDate).getTime() - new Date(a.firingDate).getTime())
        .slice(0, 12),
    [glazeTests],
  );

  const openCollection = (name: string) => {
    router.push(`/glaze-library?collection=${encodeURIComponent(name)}` as never);
  };

  const openTestGlaze = (glazeId: string) => {
    router.push(
      `/glaze-library?collection=${encodeURIComponent('My Glazes')}&glazeId=${encodeURIComponent(glazeId)}` as never,
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <StatsStrip glazeCount={glazes.length} testCount={glazeTests.length} />

        <CollectionsGrid
          allCollectionKeys={Array.from(DEFAULT_GLAZE_COLLECTIONS)}
          collectionRows={collectionRows}
          glazesByCollection={glazesByCollection}
          onPressCollection={openCollection}
        />

        {glazes.length === 0 ? (
          <View className="px-6 mt-2">
            <EmptyState
              icon={Droplets}
              title="No glazes yet"
              description="Save a recipe from Discover or add your own — it will show up in My Glazes."
              ctaLabel="Add Glaze"
              onCtaPress={onAddGlaze}
            />
          </View>
        ) : null}

        <RecentTestWall
          recentTests={recentTests}
          glazes={glazes}
          onLogTest={onLogTest}
          onPressTest={openTestGlaze}
        />
      </ScrollView>
    </View>
  );
}
