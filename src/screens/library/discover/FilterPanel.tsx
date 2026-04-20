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

// ── Primitive pills ───────────────────────────────────────────────────────────

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
      style={{
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: active ? '#3A2810' : '#FFFBF4',
        borderWidth: 1,
        borderColor: active ? '#3A2810' : '#D9C9A8',
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#FFFBF4' : '#A68555' }}>
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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: active ? '#3A2810' : '#FFFBF4',
        borderWidth: 1,
        borderColor: active ? '#3A2810' : '#D9C9A8',
      }}
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
      <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#FFFBF4' : '#A68555' }}>
        {color.label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Search bar ────────────────────────────────────────────────────────────────

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
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
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
          value={value}
          onChangeText={onChange}
          placeholder="Search recipes…"
          placeholderTextColor="#C4B48C"
          style={{ flex: 1, fontSize: 13, color: '#3A2810', padding: 0 }}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange('')} activeOpacity={0.7}>
            <X size={14} color="#A68555" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={onToggleFilters}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: filtersOpen ? '#3A2810' : '#D9C9A8',
          backgroundColor: filtersOpen ? '#3A2810' : '#FFFBF4',
          paddingHorizontal: 14,
        }}
      >
        <SlidersHorizontal size={15} color={filtersOpen ? '#FFFBF4' : '#A68555'} />
        {activeFilterCount > 0 && (
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: '#C9963A',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: '700', color: 'white' }}>
              {activeFilterCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ── Filter panel ──────────────────────────────────────────────────────────────

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
    <View
      style={{
        marginBottom: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#D9C9A8',
        backgroundColor: '#FFFBF4',
        padding: 16,
        gap: 14,
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 10,
            color: '#A68555',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            marginBottom: 8,
          }}
        >
          Cone
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
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
        <Text
          style={{
            fontSize: 10,
            color: '#A68555',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            marginBottom: 8,
          }}
        >
          Finish
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
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
        <Text
          style={{
            fontSize: 10,
            color: '#A68555',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            marginBottom: 8,
          }}
        >
          Colour
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
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

      {hasActive && (
        <TouchableOpacity onPress={onClear} activeOpacity={0.75} style={{ alignSelf: 'flex-start' }}>
          <Text style={{ fontSize: 12, color: '#C45C5C', fontWeight: '600' }}>Clear all filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
