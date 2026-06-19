import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import { normalizeCone } from '@/src/screens/library/discover/types';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Droplets, FolderPlus, Search, Star, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlazeAtlasGrid } from './GlazeAtlasGrid';
import {
  deriveCustomCollectionNames,
  filterGlazesByCollection,
} from './atlas/collections';
import { CreateCollectionModal } from './atlas/CollectionsGrid';
import { RecentTestWall } from './atlas/RecentTestWall';

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
  const glazeCollectionNames = useAppStore((s) => s.glazeCollectionNames);
  const addGlazeCollection = useAppStore((s) => s.addGlazeCollection);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [activeCollection, setActiveCollection] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const customCollections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );

  const userConeNorm = React.useMemo(
    () => (defaultGlazeTemp ? normalizeCone(defaultGlazeTemp) : null),
    [defaultGlazeTemp],
  );

  const chips = React.useMemo(
    () => [
      { key: 'all', label: 'All' },
      { key: 'favorites', label: 'Favorites' },
      ...customCollections.map((name) => ({ key: name, label: name })),
    ],
    [customCollections],
  );

  const filteredGlazes = React.useMemo(() => {
    let list = filterGlazesByCollection(glazes, activeCollection);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.notes ?? '').toLowerCase().includes(q) ||
          (g.coneRange ?? '').toLowerCase().includes(q),
      );
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.lastTestedAt ?? b.createdAt).getTime() -
        new Date(a.lastTestedAt ?? a.createdAt).getTime(),
    );
  }, [glazes, activeCollection, search]);

  const recentTests = React.useMemo(
    () =>
      [...glazeTests]
        .sort((a, b) => new Date(b.firingDate).getTime() - new Date(a.firingDate).getTime())
        .slice(0, 12),
    [glazeTests],
  );

  // Reset to 'all' if the active custom collection was removed
  React.useEffect(() => {
    if (
      activeCollection !== 'all' &&
      activeCollection !== 'favorites' &&
      !customCollections.includes(activeCollection)
    ) {
      setActiveCollection('all');
    }
  }, [customCollections, activeCollection]);

  return (
    <View className="flex-1 bg-background">
      <CreateCollectionModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(name) => {
          addGlazeCollection(name);
          setActiveCollection(name);
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search bar */}
        <View className="px-6 pt-4 pb-2">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#D9C9A8',
              backgroundColor: '#FFFBF4',
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Search size={15} color="#C4B48C" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search your glazes…"
              placeholderTextColor="#C4B48C"
              style={{ flex: 1, fontSize: 13, color: '#3A2810', padding: 0 }}
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                <X size={14} color="#A68555" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Collection filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 14, paddingTop: 4 }}
        >
          {chips.map((chip) => {
            const isActive = activeCollection === chip.key;
            const isFavorites = chip.key === 'favorites';
            return (
              <TouchableOpacity
                key={chip.key}
                onPress={() => setActiveCollection(chip.key)}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isActive ? '#3A2810' : '#FFFBF4',
                  borderWidth: 1,
                  borderColor: isActive ? '#3A2810' : '#D9C9A8',
                }}
              >
                {isFavorites ? (
                  <Star
                    size={11}
                    color={isActive ? '#FFFBF4' : '#A68555'}
                    fill={isActive ? '#FFFBF4' : 'transparent'}
                  />
                ) : null}
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: isActive ? '#FFFBF4' : '#A68555',
                  }}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => setCreateOpen(true)}
            activeOpacity={0.75}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#D9C9A8',
              backgroundColor: 'transparent',
            }}
          >
            <FolderPlus size={12} color="#A68555" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#A68555' }}>New</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Glaze grid or empty state */}
        {glazes.length === 0 ? (
          <View className="px-6 mt-2">
            <EmptyState
              icon={Droplets}
              title="No glazes yet"
              description="Add your first glaze or save one from Discover to start your atlas."
              ctaLabel="Add Glaze"
              onCtaPress={onAddGlaze}
            />
          </View>
        ) : filteredGlazes.length === 0 ? (
          <View className="px-6 mt-4">
            <EmptyState
              icon={Droplets}
              title={
                search
                  ? 'No matches'
                  : activeCollection === 'favorites'
                    ? 'No favorites yet'
                    : 'Collection is empty'
              }
              description={
                search
                  ? 'Try a different name or clear your search.'
                  : activeCollection === 'favorites'
                    ? 'Star a glaze from its detail page to see it here.'
                    : 'Add glazes to this collection when saving or from the Add glaze form.'
              }
            />
          </View>
        ) : (
          <GlazeAtlasGrid glazes={filteredGlazes} userConeNorm={userConeNorm} />
        )}

        {/* Test Log */}
        <RecentTestWall
          recentTests={recentTests}
          glazes={glazes}
          onLogTest={onLogTest}
          onPressTest={(glazeId) => router.push(`/glaze/${glazeId}` as never)}
        />
      </ScrollView>
    </View>
  );
}
