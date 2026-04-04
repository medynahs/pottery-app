import { Text } from '@/src/components/ui/text';
import { BookmarkPlus, Search, SlidersHorizontal, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Types ─────────────────────────────────────────────────────────────────────

type ConeFilter = 'all' | 'cone-06' | 'cone-6' | 'cone-10';
type FinishFilter = 'all' | 'glossy' | 'matte' | 'satin' | 'crystalline';
type ColorFilter = 'all' | 'blue' | 'green' | 'amber' | 'red' | 'white' | 'black';

// ── Seed recipes (static for V1 — replace with API in V2) ─────────────────────

const DISCOVER_RECIPES = [
  {
    id: 'rec-floating-blue',
    name: 'Floating Blue',
    author: 'Community Classic',
    colorFamily: 'blue',
    finish: 'glossy',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#7BA7CC',
    description: 'A beloved cone 6 blue that pools beautifully at texture. Breaks lighter on edges.',
    ingredients: ['Custer Feldspar', 'Silica', 'Whiting', 'EPK', 'Cobalt Carb', 'Rutile'],
    savedCount: 1240,
  },
  {
    id: 'rec-oatmeal-matte',
    name: 'Oatmeal Matte',
    author: 'Community Classic',
    colorFamily: 'amber',
    finish: 'matte',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#D4B88C',
    description: 'Warm, buttery matte. Works on nearly every clay body. Great layering base.',
    ingredients: ['Custer Feldspar', 'Whiting', 'EPK', 'Silica', 'Titanium Dioxide'],
    savedCount: 876,
  },
  {
    id: 'rec-iron-red',
    name: 'Bauer Iron Red',
    author: 'Community Classic',
    colorFamily: 'red',
    finish: 'glossy',
    cone: 'cone-10',
    coneLabel: 'Cone 10',
    colorHex: '#C45C5C',
    description: 'Classic reduction iron red. Needs thick application — thinner areas go amber.',
    ingredients: ['Custer Feldspar', 'Whiting', 'Silica', 'EPK', 'Red Iron Oxide'],
    savedCount: 654,
  },
  {
    id: 'rec-clear-liner',
    name: 'Clear Liner Glaze',
    author: 'Studio Staple',
    colorFamily: 'white',
    finish: 'glossy',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#EFEBE0',
    description: 'A clean, food-safe clear for interiors. Stays true over slips and underglazes.',
    ingredients: ['Custer Feldspar', 'Silica', 'Whiting', 'Zinc Oxide', 'EPK'],
    savedCount: 2100,
  },
  {
    id: 'rec-shino',
    name: 'Malcolm Davis Shino',
    author: 'Community Classic',
    colorFamily: 'amber',
    finish: 'matte',
    cone: 'cone-10',
    coneLabel: 'Cone 10',
    colorHex: '#C48B5A',
    description: 'Carbon-trapping shino. Orange flashing in reduction. Thick over texture.',
    ingredients: ['Spodumene', 'Nepheline Syenite', 'EPK', 'Soda Ash'],
    savedCount: 988,
  },
  {
    id: 'rec-tenmoku',
    name: 'Simple Tenmoku',
    author: 'Studio Staple',
    colorFamily: 'black',
    finish: 'glossy',
    cone: 'cone-10',
    coneLabel: 'Cone 10',
    colorHex: '#3A2810',
    description: 'Deep iron black that breaks rust-brown on edges and ridges.',
    ingredients: ['Custer Feldspar', 'Whiting', 'Silica', 'Red Iron Oxide'],
    savedCount: 432,
  },
];

const CONE_OPTIONS: { key: ConeFilter; label: string }[] = [
  { key: 'all', label: 'All Cones' },
  { key: 'cone-06', label: 'Low Fire (06)' },
  { key: 'cone-6', label: 'Mid Fire (6)' },
  { key: 'cone-10', label: 'High Fire (10)' },
];

const FINISH_OPTIONS: { key: FinishFilter; label: string }[] = [
  { key: 'all', label: 'All Finishes' },
  { key: 'glossy', label: 'Glossy' },
  { key: 'matte', label: 'Matte' },
  { key: 'satin', label: 'Satin' },
  { key: 'crystalline', label: 'Crystalline' },
];

const COLOR_OPTIONS: { key: ColorFilter; label: string; hex: string }[] = [
  { key: 'all', label: 'Any', hex: '#E8D9BE' },
  { key: 'blue', label: 'Blue', hex: '#7BA7CC' },
  { key: 'green', label: 'Green', hex: '#7BAF7B' },
  { key: 'amber', label: 'Amber', hex: '#D4B88C' },
  { key: 'red', label: 'Red', hex: '#C45C5C' },
  { key: 'white', label: 'White', hex: '#EFEBE0' },
  { key: 'black', label: 'Black', hex: '#3A2810' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: active ? '#3A2810' : '#FFFBF4',
        borderWidth: 1, borderColor: active ? '#3A2810' : '#D9C9A8',
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#FFFBF4' : '#A68555' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ColorPill({ color, active, onPress }: { color: typeof COLOR_OPTIONS[0]; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
        backgroundColor: active ? '#3A2810' : '#FFFBF4',
        borderWidth: 1, borderColor: active ? '#3A2810' : '#D9C9A8',
      }}
    >
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color.hex, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' }} />
      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#FFFBF4' : '#A68555' }}>
        {color.label}
      </Text>
    </TouchableOpacity>
  );
}

function RecipeCard({ recipe, onSave }: { recipe: typeof DISCOVER_RECIPES[0]; onSave: () => void }) {
  return (
    <View style={{
      borderRadius: 20, borderWidth: 1, borderColor: '#D9C9A8',
      backgroundColor: '#FFFBF2', overflow: 'hidden',
      shadowColor: '#8B6A2A', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
      marginBottom: 12,
    }}>
      {/* Color band */}
      <View style={{ height: 48, backgroundColor: recipe.colorHex }} />
      <View style={{ height: 1, backgroundColor: '#D9C9A8' }} />

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#3A2810' }}>{recipe.name}</Text>
            <Text style={{ fontSize: 10, color: '#A68555', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>
              {recipe.coneLabel} · {recipe.finish}
            </Text>
          </View>
          {/* Save button */}
          <TouchableOpacity
            onPress={onSave}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: '#F4EAD8', borderRadius: 12,
              paddingHorizontal: 12, paddingVertical: 7,
              borderWidth: 1, borderColor: '#D9C9A8',
            }}
          >
            <BookmarkPlus size={13} color="#C9963A" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#C9963A' }}>Save</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 12, color: '#6B5030', lineHeight: 18, marginTop: 10 }}>
          {recipe.description}
        </Text>

        {/* Ingredient chips */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {recipe.ingredients.map((ing) => (
            <View key={ing} style={{ backgroundColor: '#F0E8D8', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 10, color: '#8B6030', fontWeight: '500' }}>{ing}</Text>
            </View>
          ))}
        </View>

        {/* Saved count */}
        <Text style={{ fontSize: 10, color: '#C4B48C', marginTop: 10 }}>
          {recipe.savedCount.toLocaleString()} potters saved this
        </Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function GlazeDiscoverScreen() {
  const insets = useSafeAreaInsets();
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

  const filtered = React.useMemo(() => {
    return DISCOVER_RECIPES.filter((r) => {
      const matchSearch = search.trim() === '' || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
      const matchCone = coneFilter === 'all' || r.cone === coneFilter;
      const matchFinish = finishFilter === 'all' || r.finish === finishFilter;
      const matchColor = colorFilter === 'all' || r.colorFamily === colorFilter;
      return matchSearch && matchCone && matchFinish && matchColor;
    });
  }, [search, coneFilter, finishFilter, colorFilter]);

  function clearFilters() {
    setConeFilter('all');
    setFinishFilter('all');
    setColorFilter('all');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF6EF' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search + filter toggle */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
            borderRadius: 14, borderWidth: 1, borderColor: '#D9C9A8',
            backgroundColor: '#FFFBF4', paddingHorizontal: 14, paddingVertical: 10,
          }}>
            <Search size={15} color="#C4B48C" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search recipes…"
              placeholderTextColor="#C4B48C"
              style={{ flex: 1, fontSize: 13, color: '#3A2810', padding: 0 }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                <X size={14} color="#A68555" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters((v) => !v)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
              borderRadius: 14, borderWidth: 1,
              borderColor: showFilters ? '#3A2810' : '#D9C9A8',
              backgroundColor: showFilters ? '#3A2810' : '#FFFBF4',
              paddingHorizontal: 14,
            }}
          >
            <SlidersHorizontal size={15} color={showFilters ? '#FFFBF4' : '#A68555'} />
            {activeFilterCount > 0 && (
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#C9963A', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: 'white' }}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter panel */}
        {showFilters && (
          <View style={{ marginBottom: 16, borderRadius: 18, borderWidth: 1, borderColor: '#D9C9A8', backgroundColor: '#FFFBF4', padding: 16, gap: 14 }}>
            <View>
              <Text style={{ fontSize: 10, color: '#A68555', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Cone</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {CONE_OPTIONS.map((opt) => (
                  <FilterPill key={opt.key} label={opt.label} active={coneFilter === opt.key} onPress={() => setConeFilter(opt.key)} />
                ))}
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: '#A68555', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Finish</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {FINISH_OPTIONS.map((opt) => (
                  <FilterPill key={opt.key} label={opt.label} active={finishFilter === opt.key} onPress={() => setFinishFilter(opt.key)} />
                ))}
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: '#A68555', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Colour</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {COLOR_OPTIONS.map((opt) => (
                  <ColorPill key={opt.key} color={opt} active={colorFilter === opt.key} onPress={() => setColorFilter(opt.key)} />
                ))}
              </View>
            </View>
            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={clearFilters} activeOpacity={0.75} style={{ alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 12, color: '#C45C5C', fontWeight: '600' }}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Results count */}
        <Text style={{ fontSize: 11, color: '#A68555', marginBottom: 14, letterSpacing: 0.5 }}>
          {filtered.length} {filtered.length === 1 ? 'recipe' : 'recipes'}
          {activeFilterCount > 0 ? ' matching your filters' : ''}
        </Text>

        {/* Recipe cards */}
        {filtered.length === 0 ? (
          <View style={{ borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#D9C9A8', padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginBottom: 8 }}>🔍</Text>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 14, color: '#3A2810', marginBottom: 4 }}>No recipes found</Text>
            <Text style={{ fontSize: 12, color: '#A68555', textAlign: 'center', lineHeight: 18 }}>
              Try adjusting your filters or search term.
            </Text>
          </View>
        ) : (
          filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSave={() => {
                // V2: open collection picker sheet, then call addGlaze with recipe data
              }}
            />
          ))
        )}

        {/* V2 upgrade hint */}
        <View style={{ marginTop: 8, borderRadius: 16, backgroundColor: '#F4EAD8', borderWidth: 1, borderColor: '#D9C9A8', padding: 16 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 13, color: '#3A2810', marginBottom: 4 }}>More coming soon</Text>
          <Text style={{ fontSize: 12, color: '#A68555', lineHeight: 18 }}>
            Community-submitted recipes, verified results, and ingredient sourcing will be added as the atlas grows.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
