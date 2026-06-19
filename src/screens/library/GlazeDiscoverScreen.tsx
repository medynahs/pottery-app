import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DiscoverGrid } from './discover/DiscoverGrid';
import { FilterPanel, SearchBar } from './discover/FilterPanel';
import { DISCOVER_RECIPES } from './discover/recipes';
import {
  normalizeCone,
  type ColorFilter,
  type ConeFilter,
  type DiscoverRecipe,
  type FinishFilter,
} from './discover/types';

export default function GlazeDiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const userConeNorm = defaultGlazeTemp ? normalizeCone(defaultGlazeTemp) : null;

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

  const filtered = React.useMemo(
    () =>
      DISCOVER_RECIPES.filter((r: DiscoverRecipe) => {
        const q = search.trim().toLowerCase();
        const matchSearch =
          q === ''
          || r.name.toLowerCase().includes(q)
          || r.description.toLowerCase().includes(q);
        return (
          matchSearch
          && (coneFilter === 'all' || r.cone === coneFilter)
          && (finishFilter === 'all' || r.finish === finishFilter)
          && (colorFilter === 'all' || r.colorFamily === colorFilter)
        );
      }),
    [search, coneFilter, finishFilter, colorFilter],
  );

  return (
    <View className="flex-1 bg-background">
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

          <Text className="text-[11px] text-muted-foreground mb-3 tracking-wide">
            {filtered.length} {filtered.length === 1 ? 'inspiration' : 'inspirations'}
            {activeFilterCount > 0 ? ' · filtered' : ''}
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View className="px-6">
            <EmptyState
              title="No matches"
              description="Try a different cone, finish, or search term."
            />
          </View>
        ) : (
          <DiscoverGrid
            recipes={filtered}
            userConeNorm={userConeNorm}
            onPressRecipe={(recipe) =>
              router.push(`/discover-recipe?id=${encodeURIComponent(recipe.id)}` as never)
            }
          />        )}
      </ScrollView>
    </View>
  );
}
