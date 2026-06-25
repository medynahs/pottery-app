import { SearchField } from '@/src/components/SearchField';
import { Text } from '@/src/components/ui/text';
import { SlidersHorizontal, X } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import {
  COLOR_OPTIONS,
  CONE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  FINISH_OPTIONS,
  type BrandFilter,
  type ColorFilter,
  type ConeFilter,
  type ContentTypeFilter,
  type FinishFilter,
} from './types';

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`px-3.5 py-2 rounded-full border ${
        active ? 'bg-primary border-primary' : 'bg-card border-border'
      }`}
    >
      <Text
        className={`text-xs font-semibold ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ColorPill({
  color,
  active,
  onPress,
}: {
  color: (typeof COLOR_OPTIONS)[0];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
        active ? 'bg-primary border-primary' : 'bg-card border-border'
      }`}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color.hex,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
        }}
      />
      <Text
        className={`text-xs font-semibold ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}
      >
        {color.label}
      </Text>
    </TouchableOpacity>
  );
}

export function SearchBar({
  value,
  onChange,
  activeFilterCount,
  filtersOpen,
  onToggleFilters,
}: {
  value: string;
  onChange: (v: string) => void;
  activeFilterCount: number;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}) {
  return (
    <View className="flex-row gap-2.5 mb-3.5">
      <SearchField
        className="flex-1"
        value={value}
        onChangeText={onChange}
        placeholder="Search recipes, combos, brands…"
      />
      <TouchableOpacity
        onPress={onToggleFilters}
        activeOpacity={0.8}
        className={`flex-row items-center justify-center gap-1.5 rounded-2xl border px-3.5 ${
          filtersOpen ? 'bg-primary border-primary' : 'bg-card border-border'
        }`}
      >
        <SlidersHorizontal size={15} color={filtersOpen ? 'white' : 'hsl(24 20% 55%)'} />
        {activeFilterCount > 0 ? (
          <View className="w-4 h-4 rounded-full bg-white/90 items-center justify-center">
            <Text className="text-[9px] font-bold text-primary">{activeFilterCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

export function FilterPanel({
  coneFilter,
  finishFilter,
  colorFilter,
  contentTypeFilter,
  brandFilter,
  brandOptions,
  ownedGlazesOnly,
  showOwnedFilter,
  onCone,
  onFinish,
  onColor,
  onContentType,
  onBrand,
  onOwnedGlazesOnly,
  onClear,
}: {
  coneFilter: ConeFilter;
  finishFilter: FinishFilter;
  colorFilter: ColorFilter;
  contentTypeFilter: ContentTypeFilter;
  brandFilter: BrandFilter;
  brandOptions: string[];
  ownedGlazesOnly: boolean;
  showOwnedFilter: boolean;
  onCone: (v: ConeFilter) => void;
  onFinish: (v: FinishFilter) => void;
  onColor: (v: ColorFilter) => void;
  onContentType: (v: ContentTypeFilter) => void;
  onBrand: (v: BrandFilter) => void;
  onOwnedGlazesOnly: (v: boolean) => void;
  onClear: () => void;
}) {
  const hasActive =
    coneFilter !== 'all'
    || finishFilter !== 'all'
    || colorFilter !== 'all'
    || contentTypeFilter !== 'all'
    || brandFilter !== 'all'
    || ownedGlazesOnly;

  return (
    <View className="mb-4 rounded-2xl border border-border bg-card p-4 gap-3.5">
      <View>
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Show
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {CONTENT_TYPE_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.key}
              label={opt.label}
              active={contentTypeFilter === opt.key}
              onPress={() => onContentType(opt.key)}
            />
          ))}
        </View>
      </View>

      {brandOptions.length > 0 ? (
        <View>
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Brand
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <FilterPill
              label="Any brand"
              active={brandFilter === 'all'}
              onPress={() => onBrand('all')}
            />
            {brandOptions.map((brand) => (
              <FilterPill
                key={brand}
                label={brand}
                active={brandFilter.toLowerCase() === brand.toLowerCase()}
                onPress={() => onBrand(brand)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {showOwnedFilter ? (
        <View>
          <FilterPill
            label="Uses glazes I have"
            active={ownedGlazesOnly}
            onPress={() => onOwnedGlazesOnly(!ownedGlazesOnly)}
          />
        </View>
      ) : null}

      <View>
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Cone
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {CONE_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.key}
              label={opt.label}
              active={coneFilter === opt.key}
              onPress={() => onCone(opt.key)}
            />
          ))}
        </View>
      </View>

      <View>
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Finish
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {FINISH_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.key}
              label={opt.label}
              active={finishFilter === opt.key}
              onPress={() => onFinish(opt.key)}
            />
          ))}
        </View>
      </View>

      <View>
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Colour
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {COLOR_OPTIONS.map((opt) => (
            <ColorPill
              key={opt.key}
              color={opt}
              active={colorFilter === opt.key}
              onPress={() => onColor(opt.key)}
            />
          ))}
        </View>
      </View>

      {hasActive ? (
        <TouchableOpacity onPress={onClear} activeOpacity={0.75} className="self-start">
          <Text className="text-xs font-semibold text-destructive">Clear all filters</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
