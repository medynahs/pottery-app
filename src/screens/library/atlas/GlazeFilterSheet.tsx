import {
  ModalCard,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { FolderPlus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { FORM_FIELD_GAP } from './FormField';
import {
  GLAZE_ATMOSPHERE_FILTER_OPTIONS,
  GLAZE_CLAY_FILTER_OPTIONS,
  GLAZE_FINISH_FILTER_OPTIONS,
  GLAZE_SOURCE_FILTER_OPTIONS,
  GLAZE_STATUS_FILTER_OPTIONS,
  type GlazeFilters,
} from './glazeListUtils';
import { GlazeFilterPill, GlazeStatusPill } from '@/src/screens/glazes/components/GlazeStatusPill';
import { Pill } from './Pill';

const SECTION_GAP = 24;

type GlazeFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  filters: GlazeFilters;
  collectionOptions: Array<{ key: string; label: string }>;
  resultCount: number;
  userConeLabel: string | null;
  onPatchFilters: (patch: Partial<GlazeFilters>) => void;
  onCreateCollection: () => void;
  onClearAll: () => void;
};

function FilterSection({
  title,
  hint,
  children,
  first,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <View style={{ marginTop: first ? 0 : SECTION_GAP }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: 'hsl(24 20% 20%)',
          marginBottom: hint ? 4 : 10,
        }}
      >
        {title}
      </Text>
      {hint ? (
        <Text
          style={{
            fontSize: 12,
            color: 'hsl(24 20% 55%)',
            marginBottom: 10,
            lineHeight: 18,
          }}
        >
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

function PillRow({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap gap-2">{children}</View>;
}

export function GlazeFilterSheet({
  visible,
  onClose,
  filters,
  collectionOptions,
  resultCount,
  userConeLabel,
  onPatchFilters,
  onCreateCollection,
  onClearAll,
}: GlazeFilterSheetProps) {
  const sheetHeight = useModalSheetHeight(0.74);
  const hasActiveFilters =
    filters.status !== 'all'
    || filters.clay !== 'all'
    || filters.finish !== 'all'
    || filters.atmosphere !== 'all'
    || filters.source !== 'all'
    || filters.collection !== 'all'
    || filters.productionOnly
    || filters.matchesMyCone;

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard
        radius={MODAL_SHEET_RADIUS}
        height={sheetHeight}
        maxHeight={sheetHeight}
        withHandle={false}
      >
        <ModalSheetHeader>
          <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Filter glazes
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Refine your atlas by batch details and studio tags.
          </Text>
        </ModalSheetHeader>

        <ScrollView
          className="px-6"
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{
            paddingTop: FORM_FIELD_GAP,
            paddingBottom: FORM_FIELD_GAP,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FilterSection title="Status" first>
            <PillRow>
              {GLAZE_STATUS_FILTER_OPTIONS.map((option) =>
                option.key === 'all' ? (
                  <GlazeFilterPill
                    key={option.key}
                    label={option.label}
                    active={filters.status === option.key}
                    accessibilityLabel={`Filter by status: ${option.label}`}
                    onPress={() => onPatchFilters({ status: option.key })}
                  />
                ) : (
                  <GlazeStatusPill
                    key={option.key}
                    status={option.key}
                    active={filters.status === option.key}
                    accessibilityLabel={`Filter by status: ${option.label}`}
                    onPress={() => onPatchFilters({ status: option.key })}
                  />
                ),
              )}
            </PillRow>
          </FilterSection>

          <FilterSection title="Surface finish">
            <PillRow>
              {GLAZE_FINISH_FILTER_OPTIONS.map((option) => (
                <Pill
                  key={option.key}
                  label={option.label}
                  active={filters.finish === option.key}
                  onPress={() => onPatchFilters({ finish: option.key })}
                />
              ))}
            </PillRow>
          </FilterSection>

          <FilterSection title="Works on">
            <PillRow>
              {GLAZE_CLAY_FILTER_OPTIONS.map((option) => (
                <Pill
                  key={option.key}
                  label={option.label}
                  active={filters.clay === option.key}
                  onPress={() => onPatchFilters({ clay: option.key })}
                />
              ))}
            </PillRow>
          </FilterSection>

          <FilterSection title="Firing atmosphere">
            <PillRow>
              {GLAZE_ATMOSPHERE_FILTER_OPTIONS.map((option) => (
                <Pill
                  key={option.key}
                  label={option.label}
                  active={filters.atmosphere === option.key}
                  onPress={() => onPatchFilters({ atmosphere: option.key })}
                />
              ))}
            </PillRow>
          </FilterSection>

          <FilterSection title="Source">
            <PillRow>
              {GLAZE_SOURCE_FILTER_OPTIONS.map((option) => (
                <Pill
                  key={option.key}
                  label={option.label}
                  active={filters.source === option.key}
                  onPress={() => onPatchFilters({ source: option.key })}
                />
              ))}
            </PillRow>
          </FilterSection>

          <FilterSection title="Quick filters" hint="Toggle studio shortcuts on or off.">
            <PillRow>
              <Pill
                label="Production only"
                active={filters.productionOnly}
                onPress={() => onPatchFilters({ productionOnly: !filters.productionOnly })}
              />
              {userConeLabel ? (
                <Pill
                  label={`My cone (${userConeLabel})`}
                  active={filters.matchesMyCone}
                  onPress={() => onPatchFilters({ matchesMyCone: !filters.matchesMyCone })}
                />
              ) : null}
            </PillRow>
          </FilterSection>

          <FilterSection title="Collection">
            <PillRow>
              {collectionOptions.map((option) => (
                <Pill
                  key={option.key}
                  label={option.label}
                  active={filters.collection === option.key}
                  onPress={() => onPatchFilters({ collection: option.key })}
                />
              ))}
              <TouchableOpacity
                onPress={onCreateCollection}
                activeOpacity={0.8}
                className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-border bg-card"
              >
                <FolderPlus size={11} color="hsl(24 20% 40%)" />
                <Text className="text-xs font-semibold text-muted-foreground">New</Text>
              </TouchableOpacity>
            </PillRow>
          </FilterSection>
        </ScrollView>

        <ModalSheetFooter>
          <View className="flex-row gap-3">
            {hasActiveFilters ? (
              <TouchableOpacity
                onPress={onClearAll}
                activeOpacity={0.82}
                className="flex-1 rounded-2xl border border-border py-3.5 items-center"
              >
                <Text className="text-sm font-semibold text-foreground">Clear all</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.82}
              className={`rounded-2xl bg-primary py-3.5 items-center ${hasActiveFilters ? 'flex-1' : 'w-full'}`}
            >
              <Text className="text-sm font-semibold text-white">
                Show {resultCount} glaze{resultCount === 1 ? '' : 's'}
              </Text>
            </TouchableOpacity>
          </View>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
