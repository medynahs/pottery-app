import { Text } from '@/src/components/ui/text';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import {
  COLOR_OPTIONS,
  CONE_OPTIONS,
  FINISH_OPTIONS,
  type ColorFilter,
  type ConeFilter,
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
      <View className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-2.5">
        <Search size={15} color="hsl(24 20% 55%)" />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search recipes and ideas…"
          placeholderTextColor="hsl(24 10% 65%)"
          className="flex-1 text-sm text-foreground p-0"
        />
        {value.length > 0 ? (
          <TouchableOpacity onPress={() => onChange('')} activeOpacity={0.7}>
            <X size={14} color="hsl(24 20% 55%)" />
          </TouchableOpacity>
        ) : null}
      </View>
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
  onCone,
  onFinish,
  onColor,
  onClear,
}: {
  coneFilter: ConeFilter;
  finishFilter: FinishFilter;
  colorFilter: ColorFilter;
  onCone: (v: ConeFilter) => void;
  onFinish: (v: FinishFilter) => void;
  onColor: (v: ColorFilter) => void;
  onClear: () => void;
}) {
  const hasActive = coneFilter !== 'all' || finishFilter !== 'all' || colorFilter !== 'all';

  return (
    <View className="mb-4 rounded-2xl border border-border bg-card p-4 gap-3.5">
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
