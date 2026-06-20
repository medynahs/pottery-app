import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store/appStore';
import { Check, SlidersHorizontal, X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import type { Piece } from '../../../types/pieces';
import { FIRING_TYPES, PIECE_STATUSES } from '../utils/constants';

export type SortKey = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'updated';

export type ActiveFilters = {
  clays: string[];
  forms: string[];
  formingMethods: string[];
  statuses: string[];
  firingTypes: string[];
  forSaleOnly: boolean;
};

export const EMPTY_FILTERS: ActiveFilters = {
  clays: [],
  forms: [],
  formingMethods: [],
  statuses: [],
  firingTypes: [],
  forSaleOnly: false,
};

export function countActiveFilters(filters: ActiveFilters): number {
  return (
    filters.clays.length +
    filters.forms.length +
    filters.formingMethods.length +
    filters.statuses.length +
    filters.firingTypes.length +
    (filters.forSaleOnly ? 1 : 0)
  );
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'name-asc', label: 'A → Z' },
  { key: 'name-desc', label: 'Z → A' },
  { key: 'updated', label: 'Last updated' },
];

interface FilterSortSheetProps {
  visible: boolean;
  onClose: () => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  filters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  allPieces: Piece[];
}

export function FilterSortSheet({
  visible,
  onClose,
  sortKey,
  onSortChange,
  filters,
  onFiltersChange,
  allPieces,
}: FilterSortSheetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const storeFormOptions = useAppStore(s => s.pieceFormOptions);
  const storeFormingMethods = useAppStore(s => s.formingMethods);

  const clayOptions = React.useMemo(() => {
    const set = new Set(allPieces.map(p => p.clay));
    return Array.from(set).sort();
  }, [allPieces]);

  const formOptions = storeFormOptions.map(f => f.name);
  const methodOptions = storeFormingMethods.map(m => m.name);
  const filterCount = countActiveFilters(filters);
  const hasAnyActive = filterCount > 0 || sortKey !== 'newest';

  const toggleMulti = <K extends keyof ActiveFilters>(key: K, value: string) => {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  };

  const clearAll = () => {
    onFiltersChange(EMPTY_FILTERS);
    onSortChange('newest');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />
        <View className="bg-background rounded-t-3xl" style={{ maxHeight: '88%' }}>
          {/* Handle */}
          <View className="w-9 h-1 bg-muted rounded-full self-center mt-4 mb-3" />

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pb-4 border-b border-border">
            <View className="flex-row items-center gap-2">
              <SlidersHorizontal size={16} color={colors.foreground} />
              <Text className="text-lg font-serif font-bold text-foreground">Filter & Sort</Text>
            </View>
            <View className="flex-row items-center gap-3">
              {hasAnyActive && (
                <TouchableOpacity onPress={clearAll} activeOpacity={0.7}>
                  <Text className="text-xs font-body-medium text-primary">Clear all</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} className="p-1">
                <X size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 }}
          >
            {/* Sort */}
            <Section label="Sort by">
              <PillRow>
                {SORT_OPTIONS.map(opt => (
                  <Pill
                    key={opt.key}
                    label={opt.label}
                    active={sortKey === opt.key}
                    onPress={() => onSortChange(opt.key)}
                    colors={colors}
                  />
                ))}
              </PillRow>
            </Section>

            {/* Clay body */}
            {clayOptions.length > 0 && (
              <Section label="Clay body">
                <PillRow>
                  {clayOptions.map(clay => (
                    <Pill
                      key={clay}
                      label={clay}
                      active={filters.clays.includes(clay)}
                      onPress={() => toggleMulti('clays', clay)}
                      colors={colors}
                    />
                  ))}
                </PillRow>
              </Section>
            )}

            {/* Form */}
            <Section label="Form">
              <PillRow>
                {formOptions.map(f => (
                  <Pill
                    key={f}
                    label={f}
                    active={filters.forms.includes(f)}
                    onPress={() => toggleMulti('forms', f)}
                    colors={colors}
                  />
                ))}
              </PillRow>
            </Section>

            {/* Forming method */}
            <Section label="Forming method">
              <PillRow>
                {methodOptions.map(m => (
                  <Pill
                    key={m}
                    label={m}
                    active={filters.formingMethods.includes(m)}
                    onPress={() => toggleMulti('formingMethods', m)}
                    colors={colors}
                  />
                ))}
              </PillRow>
            </Section>

            {/* Listing */}
            <Section label="Listing">
              <PillRow>
                <Pill
                  label="For sale"
                  active={filters.forSaleOnly}
                  onPress={() => onFiltersChange({ ...filters, forSaleOnly: !filters.forSaleOnly })}
                  colors={colors}
                />
              </PillRow>
            </Section>

            {/* Status */}
            <Section label="Status">
              <PillRow>
                {PIECE_STATUSES.map(s => (
                  <Pill
                    key={s}
                    label={s}
                    active={filters.statuses.includes(s)}
                    onPress={() => toggleMulti('statuses', s)}
                    colors={colors}
                  />
                ))}
              </PillRow>
            </Section>

            {/* Firing type */}
            <Section label="Firing type">
              <PillRow>
                {FIRING_TYPES.map(t => (
                  <Pill
                    key={t}
                    label={t}
                    active={filters.firingTypes.includes(t)}
                    onPress={() => toggleMulti('firingTypes', t)}
                    colors={colors}
                  />
                ))}
              </PillRow>
            </Section>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
        {label}
      </Text>
      {children}
    </View>
  );
}

function PillRow({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap gap-2">{children}</View>;
}

function Pill({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: { background: string; mutedForeground: string };
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
        active ? 'bg-foreground border-foreground' : 'bg-card border-border'
      }`}
    >
      {active && <Check size={11} color={colors.background} strokeWidth={3} />}
      <Text className={`text-xs font-medium ${active ? 'text-background' : 'text-muted-foreground'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
