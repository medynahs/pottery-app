import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  buildDiscoverCatalog,
  itemMatchesFilters,
  itemMatchesSearch,
} from './discover/discoverSearch';
import { DiscoverGrid } from './discover/DiscoverGrid';
import { FilterPanel, SearchBar } from './discover/FilterPanel';
import { isDiscoverRecipeSaved } from './discover/recipeLookup';
import {
  type ColorFilter,
  type ConeFilter,
  type DiscoverItem,
  type FinishFilter,
} from './discover/types';

export default function GlazeDiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((s) => s.glazes);

  const catalog = React.useMemo(() => buildDiscoverCatalog(), []);

  const savedRecipeIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const item of catalog) {
      if (item.kind === 'recipe' && isDiscoverRecipeSaved(item.recipe.id, glazes)) {
        ids.add(item.recipe.id);
      }
    }
    return ids;
  }, [catalog, glazes]);

  const [search, setSearch] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [coneFilter, setConeFilter] = React.useState<ConeFilter>('all');
  const [finishFilter, setFinishFilter] = React.useState<FinishFilter>('all');
  const [colorFilter, setColorFilter] = React.useState<ColorFilter>('all');

  const activeFilterCount = [
    coneFilter !== 'all',
    finishFilter !== 'all',
    colorFilter !== 'all',
  ].filter(Boolean).length;

  const filteredItems = React.useMemo(
    () =>
      catalog.filter((item) => {
        return (
          itemMatchesSearch(item, search)
          && itemMatchesFilters(item, { coneFilter, finishFilter, colorFilter })
        );
      }),
    [catalog, search, coneFilter, finishFilter, colorFilter],
  );

  const openItem = React.useCallback(
    (item: DiscoverItem) => {
      if (item.kind === 'recipe') {
        router.push(`/discover-recipe?id=${encodeURIComponent(item.recipe.id)}` as never);
        return;
      }
      router.push(`/discover-inspiration?id=${encodeURIComponent(item.inspiration.id)}` as never);
    },
    [router],
  );

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            activeFilterCount={activeFilterCount}
            filtersOpen={showFilters}
            onToggleFilters={() => setShowFilters((v) => !v)}
          />

          {showFilters ? (
            <FilterPanel
              coneFilter={coneFilter}
              finishFilter={finishFilter}
              colorFilter={colorFilter}
              onCone={setConeFilter}
              onFinish={setFinishFilter}
              onColor={setColorFilter}
              onClear={() => {
                setConeFilter('all');
                setFinishFilter('all');
                setColorFilter('all');
              }}
            />
          ) : null}
        </View>

        {filteredItems.length === 0 ? (
          <View className="px-6">
            <EmptyState
              title="No matches"
              description="Try a different cone, finish, or search term."
            />
          </View>
        ) : (
          <DiscoverGrid
            items={filteredItems}
            savedRecipeIds={savedRecipeIds}
            onPressItem={openItem}
          />
        )}
      </ScrollView>
    </View>
  );
}
