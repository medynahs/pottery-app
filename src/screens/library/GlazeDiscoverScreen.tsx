import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtlasCoverageCard } from './discover/AtlasCoverageCard';
import { FilterPanel, SearchBar } from './discover/FilterPanel';
import { RecipeCard } from './discover/RecipeCard';
import {
    DISCOVER_RECIPES,
    RECIPE_SUCCESS_RATES,
    TRENDING_IDS,
} from './discover/recipes';
import { SaveCollectionSheet } from './discover/SaveCollectionSheet';
import {
    CORE_FINISHES,
    normalizeCone,
    type ColorFilter,
    type ConeFilter,
    type DiscoverRecipe,
    type FinishFilter,
} from './discover/types';

export default function GlazeDiscoverScreen() {
  const insets = useSafeAreaInsets();
  const glazes = useAppStore((s) => s.glazes);
  const defaultGlazeTemp = useAppStore((s) => s.defaultGlazeTemp);
  const addGlaze = useAppStore((s) => s.addGlaze);

  // ── Derived atlas data ────────────────────────────────────────────────────
  const collections = React.useMemo(() => {
    const set = new Set<string>();
    glazes.forEach((g) => g.collections.forEach((c) => set.add(c)));
    return Array.from(set)
      .filter(Boolean)
      .sort((a, b) => {
        if (a === 'My Glazes') return -1;
        if (b === 'My Glazes') return 1;
        return a.localeCompare(b);
      });
  }, [glazes]);

  const finishCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    glazes.forEach((g) => {
      counts[g.finish] = (counts[g.finish] || 0) + 1;
    });
    return counts;
  }, [glazes]);

  const missingFinishes = CORE_FINISHES.filter((f) => !finishCounts[f]);
  const userConeNorm = defaultGlazeTemp ? normalizeCone(defaultGlazeTemp) : null;

  // ── Filter state ──────────────────────────────────────────────────────────
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
          q === '' ||
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q);
        return (
          matchSearch &&
          (coneFilter === 'all' || r.cone === coneFilter) &&
          (finishFilter === 'all' || r.finish === finishFilter) &&
          (colorFilter === 'all' || r.colorFamily === colorFilter)
        );
      }),
    [search, coneFilter, finishFilter, colorFilter],
  );

  // ── Save sheet state ──────────────────────────────────────────────────────
  const [saveTarget, setSaveTarget] = React.useState<DiscoverRecipe | null>(null);
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());

  function handleSave(selectedCollections: string[]) {
    if (!saveTarget) return;
    addGlaze({
      id: `discover-${saveTarget.id}-${Date.now()}`,
      name: saveTarget.name,
      finish: saveTarget.finish as Parameters<typeof addGlaze>[0]['finish'],
      colorFamily: saveTarget.colorFamily,
      coneRange: saveTarget.coneLabel,
      defaultCone: saveTarget.coneLabel,
      source: 'custom',
      notes: saveTarget.description,
      collections: selectedCollections,
      tags: [],
      recipeIngredients: saveTarget.ingredients.map((ing, i) => ({
        id: `ing-${i}`,
        material: ing.material,
        percentage: String(ing.percentage),
      })),
      favorite: false,
      production: false,
      testTilePhotoUris: [],
      finishedPiecePhotoUris: [],
      accidentPhotoUris: [],
      clayBodiesUsed: [],
      kilnTypesUsed: [],
      conesTested: [],
      createdAt: new Date().toISOString(),
    });
    setSavedIds((prev) => new Set(prev).add(saveTarget.id));
    setSaveTarget(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF6EF' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AtlasCoverageCard
          glazeCount={glazes.length}
          finishCounts={finishCounts}
          missingFinishes={missingFinishes as string[]}
        />

        <SearchBar
          value={search}
          onChange={setSearch}
          activeFilterCount={activeFilterCount}
          filtersOpen={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
        />

        {showFilters && (
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
        )}

        <Text style={{ fontSize: 11, color: '#A68555', marginBottom: 14, letterSpacing: 0.5 }}>
          {filtered.length} {filtered.length === 1 ? 'recipe' : 'recipes'}
          {activeFilterCount > 0 ? ' matching your filters' : ''}
        </Text>

        {filtered.length === 0 ? (
          <View
            style={{
              borderRadius: 20,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#D9C9A8',
              padding: 32,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 8 }}>🔍</Text>
            <Text
              style={{
                fontFamily: 'Fraunces_600SemiBold',
                fontSize: 14,
                color: '#3A2810',
                marginBottom: 4,
              }}
            >
              No recipes found
            </Text>
            <Text
              style={{ fontSize: 12, color: '#A68555', textAlign: 'center', lineHeight: 18 }}
            >
              Try adjusting your filters or search term.
            </Text>
          </View>
        ) : (
          filtered.map((recipe: DiscoverRecipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isTrending={TRENDING_IDS.has(recipe.id)}
              successRate={RECIPE_SUCCESS_RATES[recipe.id] ?? 75}
              matchesCone={userConeNorm !== null && recipe.cone === userConeNorm}
              onSave={() => setSaveTarget(recipe)}
              saved={savedIds.has(recipe.id)}
            />
          ))
        )}

        <View
          style={{
            marginTop: 8,
            borderRadius: 16,
            backgroundColor: '#F4EAD8',
            borderWidth: 1,
            borderColor: '#D9C9A8',
            padding: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 13,
              color: '#3A2810',
              marginBottom: 4,
            }}
          >
            More coming soon
          </Text>
          <Text style={{ fontSize: 12, color: '#A68555', lineHeight: 18 }}>
            Community-submitted recipes, verified results, and ingredient sourcing will be added
            as the atlas grows.
          </Text>
        </View>
      </ScrollView>

      <SaveCollectionSheet
        recipe={saveTarget}
        collections={collections}
        onClose={() => setSaveTarget(null)}
        onSave={handleSave}
      />
    </View>
  );
}
