import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import { useRouter } from 'expo-router';
import { Droplets } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlazeListRow } from './atlas/GlazeListRow';
import { Pill } from './atlas/Pill';
import { RecentTestWall } from './atlas/RecentTestWall';
import { StatsStrip } from './atlas/StatsStrip';

type FilterKey = 'all' | 'favorites';

function getLastTestByGlaze(tests: GlazeTestTile[]): Record<string, GlazeTestTile> {
  const map: Record<string, GlazeTestTile> = {};
  for (const test of tests) {
    const existing = map[test.glazeId];
    if (
      !existing ||
      new Date(test.firingDate).getTime() > new Date(existing.firingDate).getTime()
    ) {
      map[test.glazeId] = test;
    }
  }
  return map;
}

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
  const [filter, setFilter] = React.useState<FilterKey>('all');

  const lastTestByGlaze = React.useMemo(() => getLastTestByGlaze(glazeTests), [glazeTests]);

  const sortedGlazes = React.useMemo(() => {
    const list =
      filter === 'favorites' ? glazes.filter((g) => g.favorite) : [...glazes];
    return list.sort(
      (a, b) =>
        new Date(b.lastTestedAt ?? b.createdAt).getTime() -
        new Date(a.lastTestedAt ?? a.createdAt).getTime(),
    );
  }, [filter, glazes]);

  const recentTests = React.useMemo(
    () =>
      [...glazeTests]
        .sort((a, b) => new Date(b.firingDate).getTime() - new Date(a.firingDate).getTime())
        .slice(0, 12),
    [glazeTests],
  );

  const openGlaze = (glazeId: string) => {
    router.push(`/glaze/${glazeId}` as never);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <StatsStrip glazeCount={glazes.length} testCount={glazeTests.length} />

        <View className="px-6 mt-6 mb-3 flex-row items-center justify-between">
          <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
            My Glazes
          </Text>
          <View className="flex-row gap-2">
            <Pill label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
            <Pill label="Favorites" active={filter === 'favorites'} onPress={() => setFilter('favorites')} />
          </View>
        </View>

        {sortedGlazes.length === 0 ? (
          <View className="px-6 mt-2">
            <EmptyState
              icon={Droplets}
              title={filter === 'favorites' ? 'No favorites yet' : 'No glazes yet'}
              description={
                filter === 'favorites'
                  ? 'Star a glaze from its detail page to see it here.'
                  : 'Add your own glaze or save one from Discover to start your atlas.'
              }
              ctaLabel={filter === 'favorites' ? undefined : 'Add Glaze'}
              onCtaPress={filter === 'favorites' ? undefined : onAddGlaze}
            />
          </View>
        ) : (
          <View className="px-6 gap-2">
            {sortedGlazes.map((glaze) => (
              <GlazeListRow
                key={glaze.id}
                glaze={glaze}
                lastTest={lastTestByGlaze[glaze.id]}
              />
            ))}
          </View>
        )}

        <RecentTestWall
          recentTests={recentTests}
          glazes={glazes}
          onLogTest={onLogTest}
          onPressTest={openGlaze}
        />
      </ScrollView>
    </View>
  );
}
