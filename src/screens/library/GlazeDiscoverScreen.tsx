import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import { TAB_SCROLL_BOTTOM_PADDING } from '@/src/constants/tabScreenLayout';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import {
  buildDiscoverCatalog,
  collectDiscoverBrands,
  itemMatchesFilters,
  itemMatchesSearch,
} from './discover/discoverSearch';
import { DevAddDiscoverSheet } from './discover/DevAddDiscoverSheet';
import { DiscoverGrid } from './discover/DiscoverGrid';
import { FilterPanel, SearchBar } from './discover/FilterPanel';
import { isDiscoverRecipeSaved } from './discover/recipeLookup';
import { comboUsesOwnedGlaze } from './discover/products';
import {
  type BrandFilter,
  type ColorFilter,
  type ConeFilter,
  type ContentTypeFilter,
  type DiscoverItem,
  type FinishFilter,
} from './discover/types';

export default function GlazeDiscoverScreen() {
  const router = useRouter();
  const glazes = useAppStore((s) => s.glazes);
  const user = useAppStore((s) => s.user);
  const devDiscoverGlazeIds = useAppStore((s) => s.devDiscoverGlazeIds);

  const [devSheetOpen, setDevSheetOpen] = React.useState(false);

  const catalog = React.useMemo(
    () =>
      buildDiscoverCatalog({
        glazes,
        devDiscoverGlazeIds,
        authorName: user.name?.trim() || 'My Studio',
      }),
    [glazes, devDiscoverGlazeIds, user.name],
  );

  const brandOptions = React.useMemo(() => collectDiscoverBrands(catalog), [catalog]);

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
  const [contentTypeFilter, setContentTypeFilter] = React.useState<ContentTypeFilter>('all');
  const [brandFilter, setBrandFilter] = React.useState<BrandFilter>('all');
  const [ownedGlazesOnly, setOwnedGlazesOnly] = React.useState(false);

  const activeFilterCount = [
    coneFilter !== 'all',
    finishFilter !== 'all',
    colorFilter !== 'all',
    contentTypeFilter !== 'all',
    brandFilter !== 'all',
    ownedGlazesOnly,
  ].filter(Boolean).length;

  const filteredItems = React.useMemo(
    () =>
      catalog.filter((item) => {
        return (
          itemMatchesSearch(item, search)
          && itemMatchesFilters(item, {
            coneFilter,
            finishFilter,
            colorFilter,
            contentTypeFilter,
            brandFilter,
            ownedGlazesOnly,
            glazes,
          })
        );
      }),
    [
      catalog,
      search,
      coneFilter,
      finishFilter,
      colorFilter,
      contentTypeFilter,
      brandFilter,
      ownedGlazesOnly,
      glazes,
    ],
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
      <DevAddDiscoverSheet
        visible={devSheetOpen}
        glazes={glazes}
        onClose={() => setDevSheetOpen(false)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_BOTTOM_PADDING }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-4">
          {__DEV__ ? (
            <TouchableOpacity
              onPress={() => setDevSheetOpen(true)}
              activeOpacity={0.85}
              className="mb-4 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3"
            >
              <Plus size={16} color="hsl(39 57% 41%)" />
              <Text className="text-xs font-semibold text-primary">
                Add glaze to Discover preview (dev)
              </Text>
            </TouchableOpacity>
          ) : null}

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
              contentTypeFilter={contentTypeFilter}
              brandFilter={brandFilter}
              brandOptions={brandOptions}
              ownedGlazesOnly={ownedGlazesOnly}
              showOwnedFilter={glazes.length > 0}
              onCone={setConeFilter}
              onFinish={setFinishFilter}
              onColor={setColorFilter}
              onContentType={setContentTypeFilter}
              onBrand={setBrandFilter}
              onOwnedGlazesOnly={setOwnedGlazesOnly}
              onClear={() => {
                setConeFilter('all');
                setFinishFilter('all');
                setColorFilter('all');
                setContentTypeFilter('all');
                setBrandFilter('all');
                setOwnedGlazesOnly(false);
              }}
            />
          ) : null}
        </View>

        {filteredItems.length === 0 ? (
          <View className="px-6">
            <EmptyState
              title="No matches"
              description="Try a different brand, cone, or search term."
            />
          </View>
        ) : (
          <DiscoverGrid
            items={filteredItems}
            savedRecipeIds={savedRecipeIds}
            ownedGlazeIds={ownedComboIds(filteredItems, glazes)}
            onPressItem={openItem}
          />
        )}
      </ScrollView>
    </View>
  );
}

function ownedComboIds(
  items: DiscoverItem[],
  glazes: { name: string; supplier?: string; source?: string }[],
): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    if (item.kind !== 'inspiration') continue;
    if (comboUsesOwnedGlaze(item.inspiration, glazes)) {
      ids.add(item.inspiration.id);
    }
  }
  return ids;
}
