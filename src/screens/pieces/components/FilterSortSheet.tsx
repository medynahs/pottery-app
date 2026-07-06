import {
  ModalCard,
  ModalSheetFooter,
  ModalShell,
  ModalSheetHeader,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useAppStore, useVisibleGlazes } from '@/src/store/appStore';
import { Pill } from '@/src/screens/library/atlas/Pill';
import { Search, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import type { Piece } from '../../../types/pieces';
import {
  buildBisqueTempFilterOptions,
  buildClayFilterOptions,
  buildGlazeFilterOptions,
  buildGlazeOutcomeFilterOptions,
  buildGlazeTempFilterOptions,
  buildStatusFilterOptions,
  buildUsedStringOptions,
  filterGlazeOptions,
  type ActiveFilters,
  countActiveFilters,
  EMPTY_FILTERS,
  type SortKey,
} from '../utils/pieceFilterUtils';

export type { ActiveFilters, SortKey };
export { EMPTY_FILTERS, countActiveFilters };

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'name-asc', label: 'A → Z' },
  { key: 'name-desc', label: 'Z → A' },
  { key: 'updated', label: 'Last updated' },
];

const SECTION_GAP = 24;

interface FilterSortSheetProps {
  visible: boolean;
  onClose: () => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  filters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  allPieces: Piece[];
  resultCount: number;
}

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
      <Text className="text-sm font-semibold text-foreground">{title}</Text>
      {hint ? (
        <Text className="text-xs text-muted-foreground mt-1 mb-2.5 leading-[18px]">{hint}</Text>
      ) : (
        <View className="h-2.5" />
      )}
      {children}
    </View>
  );
}

function PillRow({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap gap-2">{children}</View>;
}

export function FilterSortSheet({
  visible,
  onClose,
  sortKey,
  onSortChange,
  filters,
  onFiltersChange,
  allPieces,
  resultCount,
}: FilterSortSheetProps) {
  const sheetHeight = useModalSheetHeight(0.88);
  const clayBodies = useAppStore((s) => s.clayBodies);
  const glazes = useVisibleGlazes();
  const piecesCompactCards = useAppStore((s) => s.piecesCompactCards);
  const setPiecesCompactCards = useAppStore((s) => s.setPiecesCompactCards);
  const [glazeQuery, setGlazeQuery] = React.useState('');

  React.useEffect(() => {
    if (!visible) setGlazeQuery('');
  }, [visible]);

  const clayOptions = React.useMemo(
    () => buildClayFilterOptions(allPieces, clayBodies),
    [allPieces, clayBodies],
  );

  const glazeOptions = React.useMemo(
    () => buildGlazeFilterOptions(glazes, allPieces),
    [glazes, allPieces],
  );

  const visibleGlazeOptions = React.useMemo(
    () => filterGlazeOptions(glazeOptions, glazeQuery),
    [glazeOptions, glazeQuery],
  );

  const formOptions = React.useMemo(
    () => buildUsedStringOptions(allPieces, (piece) => piece.form),
    [allPieces],
  );

  const methodOptions = React.useMemo(
    () => buildUsedStringOptions(allPieces, (piece) => piece.formingMethod),
    [allPieces],
  );

  const statusOptions = React.useMemo(
    () => buildStatusFilterOptions(allPieces),
    [allPieces],
  );

  const firingTypeOptions = React.useMemo(
    () => buildUsedStringOptions(allPieces, (piece) => piece.firingType),
    [allPieces],
  );

  const locationOptions = React.useMemo(
    () => buildUsedStringOptions(allPieces, (piece) => piece.location),
    [allPieces],
  );

  const bisqueTempOptions = React.useMemo(
    () => buildBisqueTempFilterOptions(allPieces),
    [allPieces],
  );

  const glazeTempOptions = React.useMemo(
    () => buildGlazeTempFilterOptions(allPieces),
    [allPieces],
  );

  const glazeOutcomeOptions = React.useMemo(
    () => buildGlazeOutcomeFilterOptions(allPieces),
    [allPieces],
  );

  const noGlazeCount = React.useMemo(
    () => allPieces.filter((piece) => !piece.glazeId).length,
    [allPieces],
  );

  const filterCount = countActiveFilters(filters);
  const hasAnyActive = filterCount > 0 || sortKey !== 'newest' || piecesCompactCards;

  type ArrayFilterKey =
    | 'clays'
    | 'forms'
    | 'formingMethods'
    | 'glazes'
    | 'statuses'
    | 'firingTypes'
    | 'glazeOutcomes'
    | 'locations'
    | 'bisqueTemps'
    | 'glazeTemps';

  const toggleMulti = (key: ArrayFilterKey, value: string) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  };

  type FlagFilterKey =
    | 'forSaleOnly'
    | 'noGlazeOnly'
    | 'batchOnly'
    | 'hasPhotosOnly'
    | 'problemOnly'
    | 'soldOnly';

  const toggleFlag = (key: FlagFilterKey) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  const clearAll = () => {
    onFiltersChange(EMPTY_FILTERS);
    onSortChange('newest');
    setPiecesCompactCards(false);
  };

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
            Filter pieces
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Narrow your studio list by material, glaze, and listing details.
          </Text>
        </ModalSheetHeader>

        <ScrollView
          className="px-6"
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FilterSection title="Sort by" first>
            <PillRow>
              {SORT_OPTIONS.map((opt) => (
                <Pill
                  key={opt.key}
                  label={opt.label}
                  active={sortKey === opt.key}
                  onPress={() => onSortChange(opt.key)}
                />
              ))}
            </PillRow>
          </FilterSection>

          {clayOptions.length > 0 ? (
            <FilterSection title="Clay body">
              <PillRow>
                {clayOptions.map((clay) => (
                  <Pill
                    key={clay}
                    label={clay}
                    active={filters.clays.includes(clay)}
                    onPress={() => toggleMulti('clays', clay)}
                  />
                ))}
              </PillRow>
            </FilterSection>
          ) : null}

          <FilterSection
            title="Glaze"
            hint={
              glazes.length === 0
                ? 'Add glazes in your atlas to filter pieces by batch.'
                : 'Filter by linked studio glaze batches.'
            }
          >
            {glazes.length === 0 ? (
              noGlazeCount > 0 ? (
                <PillRow>
                  <Pill
                    label={`No glaze linked (${noGlazeCount})`}
                    active={filters.noGlazeOnly}
                    onPress={() => toggleFlag('noGlazeOnly')}
                  />
                </PillRow>
              ) : (
                <View className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-5">
                  <Text className="text-sm text-muted-foreground text-center leading-5">
                    No glazes in your atlas yet.
                  </Text>
                </View>
              )
            ) : (
              <>
                {glazeOptions.length > 6 ? (
                  <View className="relative justify-center mb-3">
                    <View className="absolute left-4 z-10">
                      <Search size={16} color="hsl(24 20% 40%)" />
                    </View>
                    {glazeQuery.length > 0 ? (
                      <TouchableOpacity
                        onPress={() => setGlazeQuery('')}
                        hitSlop={8}
                        activeOpacity={0.7}
                        className="absolute right-4 z-10"
                      >
                        <X size={16} color="hsl(24 20% 40%)" />
                      </TouchableOpacity>
                    ) : null}
                    <Input
                      value={glazeQuery}
                      onChangeText={setGlazeQuery}
                      placeholder="Search glazes…"
                      className={`pl-11 rounded-2xl bg-card border-border ${glazeQuery.length > 0 ? 'pr-11' : ''}`}
                    />
                  </View>
                ) : null}
                {visibleGlazeOptions.length === 0 ? (
                  <Text className="text-sm text-muted-foreground">No glazes match your search.</Text>
                ) : (
                  <PillRow>
                    {noGlazeCount > 0 ? (
                      <Pill
                        label={`No glaze linked (${noGlazeCount})`}
                        active={filters.noGlazeOnly}
                        onPress={() => toggleFlag('noGlazeOnly')}
                      />
                    ) : null}
                    {visibleGlazeOptions.map(({ id, label, pieceCount }) => (
                      <Pill
                        key={id}
                        label={pieceCount > 0 ? `${label} (${pieceCount})` : label}
                        active={filters.glazes.includes(id)}
                        onPress={() => toggleMulti('glazes', id)}
                      />
                    ))}
                  </PillRow>
                )}
              </>
            )}
          </FilterSection>

          {formOptions.length > 0 ? (
            <FilterSection title="Form">
              <PillRow>
                {formOptions.map((form) => (
                  <Pill
                    key={form}
                    label={form}
                    active={filters.forms.includes(form)}
                    onPress={() => toggleMulti('forms', form)}
                  />
                ))}
              </PillRow>
            </FilterSection>
          ) : null}

          {methodOptions.length > 0 ? (
            <FilterSection title="Forming method">
              <PillRow>
                {methodOptions.map((method) => (
                  <Pill
                    key={method}
                    label={method}
                    active={filters.formingMethods.includes(method)}
                    onPress={() => toggleMulti('formingMethods', method)}
                  />
                ))}
              </PillRow>
            </FilterSection>
          ) : null}

          {glazeOutcomeOptions.length > 0 ? (
            <FilterSection title="Glaze outcome" hint="How the linked glaze performed after firing.">
              <PillRow>
                {glazeOutcomeOptions.map(({ key, label }) => (
                  <Pill
                    key={key}
                    label={label}
                    active={filters.glazeOutcomes.includes(key)}
                    onPress={() => toggleMulti('glazeOutcomes', key)}
                  />
                ))}
              </PillRow>
            </FilterSection>
          ) : null}

          {locationOptions.length > 0 ? (
            <FilterSection title="Studio location">
              <PillRow>
                {locationOptions.map((location) => (
                  <Pill
                    key={location}
                    label={location}
                    active={filters.locations.includes(location)}
                    onPress={() => toggleMulti('locations', location)}
                  />
                ))}
              </PillRow>
            </FilterSection>
          ) : null}

          {firingTypeOptions.length > 0 ? (
            <FilterSection title="Firing atmosphere">
              <PillRow>
                {firingTypeOptions.map((firingType) => (
                  <Pill
                    key={firingType}
                    label={firingType}
                    active={filters.firingTypes.includes(firingType)}
                    onPress={() => toggleMulti('firingTypes', firingType)}
                  />
                ))}
              </PillRow>
            </FilterSection>
          ) : null}

          {bisqueTempOptions.length > 0 ? (
            <FilterSection title="Bisque cone">
              <PillRow>
                {bisqueTempOptions.map((temp) => (
                  <Pill
                    key={temp}
                    label={temp}
                    active={filters.bisqueTemps.includes(temp)}
                    onPress={() => toggleMulti('bisqueTemps', temp)}
                  />
                ))}
              </PillRow>
            </FilterSection>
          ) : null}

          {glazeTempOptions.length > 0 ? (
            <FilterSection title="Glaze cone">
              <PillRow>
                {glazeTempOptions.map((temp) => (
                  <Pill
                    key={temp}
                    label={temp}
                    active={filters.glazeTemps.includes(temp)}
                    onPress={() => toggleMulti('glazeTemps', temp)}
                  />
                ))}
              </PillRow>
            </FilterSection>
          ) : null}

          {statusOptions.length > 0 ? (
            <FilterSection title="Status">
              <PillRow>
                {statusOptions.map((status) => (
                  <Pill
                    key={status}
                    label={status}
                    active={filters.statuses.includes(status)}
                    onPress={() => toggleMulti('statuses', status)}
                  />
                ))}
              </PillRow>
            </FilterSection>
          ) : null}

          <FilterSection title="Quick filters" hint="Shortcuts for common studio views.">
            <PillRow>
              <Pill
                label="For sale"
                active={filters.forSaleOnly}
                onPress={() => toggleFlag('forSaleOnly')}
              />
              <Pill
                label="Sold"
                active={filters.soldOnly}
                onPress={() => toggleFlag('soldOnly')}
              />
              <Pill
                label="Has issues"
                active={filters.problemOnly}
                onPress={() => toggleFlag('problemOnly')}
              />
              <Pill
                label="In a batch"
                active={filters.batchOnly}
                onPress={() => toggleFlag('batchOnly')}
              />
              <Pill
                label="Has photos"
                active={filters.hasPhotosOnly}
                onPress={() => toggleFlag('hasPhotosOnly')}
              />
              <Pill
                label="Compact cards"
                active={piecesCompactCards}
                onPress={() => setPiecesCompactCards(!piecesCompactCards)}
              />
            </PillRow>
            <Text className="text-xs text-muted-foreground mt-2 leading-[18px]">
              Compact cards hide pricing. Has issues matches cracked or warped pieces.
            </Text>
          </FilterSection>
        </ScrollView>

        <ModalSheetFooter>
          <View className="flex-row gap-3">
            {hasAnyActive ? (
              <TouchableOpacity
                onPress={clearAll}
                activeOpacity={0.82}
                className="flex-1 rounded-2xl border border-border py-3.5 items-center"
              >
                <Text className="text-sm font-semibold text-foreground">Clear all</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.82}
              className={`rounded-2xl bg-primary py-3.5 items-center ${hasAnyActive ? 'flex-1' : 'w-full'}`}
            >
              <Text className="text-sm font-semibold text-white">
                Show {resultCount} piece{resultCount === 1 ? '' : 's'}
              </Text>
            </TouchableOpacity>
          </View>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
