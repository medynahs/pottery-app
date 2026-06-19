import { ConfirmSheet } from '@/src/components/AppSheets';
import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import { normalizeCone } from '@/src/screens/library/discover/types';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Droplets, Search, SlidersHorizontal, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlazeAtlasGrid } from './GlazeAtlasGrid';
import { deriveCustomCollectionNames } from './atlas/collections';
import { CreateCollectionModal } from './atlas/CollectionsGrid';
import { GlazeFilterSheet } from './atlas/GlazeFilterSheet';
import {
  buildActiveGlazeFilterTags,
  countActiveGlazeFilters,
  DEFAULT_GLAZE_FILTERS,
  filterGlazesList,
  type GlazeFilters,
} from './atlas/glazeListUtils';
import { scheduleGlazesSync } from './useGlazesSync';

type LibraryGlazesScreenProps = {
  glazes: GlazeLibraryItem[];
  glazeTests: GlazeTestTile[];
  onAddGlaze: () => void;
  onLogTest: () => void;
};

function ActiveFilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <View className="flex-row items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-primary/10 border border-primary/20">
      <Text className="text-[11px] font-semibold text-foreground" numberOfLines={1}>
        {label}
      </Text>
      <TouchableOpacity onPress={onClear} hitSlop={8} activeOpacity={0.7} className="p-0.5">
        <X size={11} color="hsl(24 20% 45%)" />
      </TouchableOpacity>
    </View>
  );
}

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
  const deleteGlaze = useAppStore((s) => s.deleteGlaze);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<GlazeFilters>(DEFAULT_GLAZE_FILTERS);
  const [search, setSearch] = React.useState('');
  const [pendingDelete, setPendingDelete] = React.useState<GlazeLibraryItem | null>(null);

  const patchFilters = React.useCallback((patch: Partial<GlazeFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const customCollections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );

  const userConeNorm = React.useMemo(
    () => (defaultGlazeTemp ? normalizeCone(defaultGlazeTemp) : null),
    [defaultGlazeTemp],
  );

  const userConeLabel = defaultGlazeTemp?.trim() || null;

  const collectionOptions = React.useMemo(
    () => [
      { key: 'all', label: 'All' },
      { key: 'favorites', label: 'Favorites' },
      ...customCollections.map((name) => ({ key: name, label: name })),
    ],
    [customCollections],
  );

  const filteredGlazes = React.useMemo(
    () => filterGlazesList(glazes, filters, search, userConeNorm),
    [glazes, filters, search, userConeNorm],
  );

  const activeFilterCount = countActiveGlazeFilters(filters);

  const activeFilterTags = React.useMemo(
    () => buildActiveGlazeFilterTags(filters, userConeLabel, patchFilters),
    [filters, userConeLabel, patchFilters],
  );

  const clearAllFilters = React.useCallback(() => {
    setFilters(DEFAULT_GLAZE_FILTERS);
  }, []);

  React.useEffect(() => {
    if (
      filters.collection !== 'all' &&
      filters.collection !== 'favorites' &&
      !customCollections.includes(filters.collection)
    ) {
      patchFilters({ collection: 'all' });
    }
  }, [customCollections, filters.collection, patchFilters]);

  const showSummaryRow =
    activeFilterTags.length > 0 || search.trim().length > 0 || filteredGlazes.length !== glazes.length;

  return (
    <View className="flex-1 bg-background">
      <ConfirmSheet
        visible={!!pendingDelete}
        title="Delete glaze?"
        body={
          pendingDelete
            ? `"${pendingDelete.name}" and all its test tiles will be removed.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (pendingDelete) {
            deleteGlaze(pendingDelete.id);
            scheduleGlazesSync();
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />

      <GlazeFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        collectionOptions={collectionOptions}
        resultCount={filteredGlazes.length}
        userConeLabel={userConeLabel}
        onPatchFilters={patchFilters}
        onCreateCollection={() => {
          setFilterOpen(false);
          setCreateOpen(true);
        }}
        onClearAll={clearAllFilters}
      />

      <CreateCollectionModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(name) => {
          addGlazeCollection(name);
          patchFilters({ collection: name });
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-3 pb-1">
          <View className="flex-row items-center gap-2">
            <View
              style={{
                flex: 1,
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
                placeholder="Search glazes…"
                placeholderTextColor="#C4B48C"
                style={{ flex: 1, fontSize: 13, color: '#3A2810', padding: 0 }}
              />
              {search.length > 0 ? (
                <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                  <X size={14} color="#A68555" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => setFilterOpen(true)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Open filters"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: activeFilterCount > 0 ? '#3A2810' : '#D9C9A8',
                backgroundColor: activeFilterCount > 0 ? '#3A2810' : '#FFFBF4',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SlidersHorizontal
                size={17}
                color={activeFilterCount > 0 ? '#FFFBF4' : '#A68555'}
              />
              {activeFilterCount > 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: 'hsl(38 80% 50%)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '700', color: 'white' }}>
                    {activeFilterCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>

          {showSummaryRow ? (
            <View className="flex-row items-center mt-2.5 gap-2 min-h-[28px]">
              {activeFilterTags.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ gap: 6, paddingRight: 8 }}
                >
                  {activeFilterTags.map((tag) => (
                    <ActiveFilterChip key={tag.key} label={tag.label} onClear={tag.onClear} />
                  ))}
                </ScrollView>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              <Text className="text-[11px] text-muted-foreground shrink-0">
                {filteredGlazes.length} of {glazes.length}
              </Text>
            </View>
          ) : null}
        </View>

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
              title="No matches"
              description="Try different filters or clear your search."
            />
          </View>
        ) : (
          <View className="mt-2">
            <GlazeAtlasGrid
              glazes={filteredGlazes}
              userConeNorm={userConeNorm}
              onDeleteGlaze={(glaze) => setPendingDelete(glaze)}
            />
          </View>
        )}

      </ScrollView>
    </View>
  );
}
