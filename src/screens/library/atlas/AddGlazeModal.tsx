import {
    MODAL_SHEET_RADIUS,
    ModalCard,
    ModalFormScrollView,
    ModalSheetFooter,
    ModalSheetHeader,
    ModalShell,
    useModalSheetHeight,
} from '@/src/components/AppSheets';
import { DatePickerField } from '@/src/components/DatePickerField';
import { FormField } from '@/src/components/form/FormField';
import { CollapsibleFormSection, FormSectionCard } from '@/src/components/form/FormSectionCard';
import { NotesInput } from '@/src/components/NotesInput';
import { PhotoPickField } from '@/src/components/PhotoPickField';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { GlazeStatusPill, GlazeStatusPillRow } from '@/src/screens/glazes/components/GlazeStatusPill';
import {
    GLAZE_ATMOSPHERE_LABELS,
    GLAZE_ATMOSPHERE_OPTIONS,
    GLAZE_CLAY_TYPE_LABELS,
    GLAZE_CLAY_TYPE_OPTIONS,
    GLAZE_FINISH_LABELS,
    GLAZE_FINISH_OPTIONS,
    GLAZE_SOURCE_LABELS,
    GLAZE_STATUS_LABELS,
    GLAZE_STATUS_OPTIONS,
    type GlazeSource,
} from '@/src/screens/glazes/types';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CollectionPicker } from './CollectionPicker';
import {
    GLAZE_BRAND_OPTIONS,
    glazeBrandChipSelection,
    isKnownGlazeBrand,
} from './glazeFormConstants';
import { GlazeRecipeBuilder, hasValidRecipeIngredients } from './GlazeRecipeBuilder';
import { createEmptyGlazeDraft } from './helpers';
import { Pill } from './Pill';
import type { GlazeDraft } from './types';

function SourceToggle({
  value,
  onChange,
}: {
  value: GlazeSource;
  onChange: (source: GlazeSource) => void;
}) {
  return (
    <View className="flex-row rounded-xl border border-border bg-muted/50 p-1">
      {(['store-bought', 'custom'] as const).map((source) => {
        const active = value === source;
        return (
          <TouchableOpacity
            key={source}
            onPress={() => onChange(source)}
            activeOpacity={0.85}
            className={`flex-1 rounded-lg py-2.5 px-2 ${active ? 'bg-background border border-border' : ''}`}
          >
            <Text
              className={`text-sm font-semibold text-center ${active ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {source === 'store-bought' ? 'Jar from store' : 'My own mix'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function AddGlazeModal({
  visible,
  onClose,
  onSave,
  defaultCone,
  collections,
  onCreateCollection,
  initialDraft,
  mode = initialDraft != null ? 'edit' : 'create',
  versionLabel,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (draft: GlazeDraft) => void;
  defaultCone: string | null;
  collections: string[];
  onCreateCollection: (name: string) => void;
  initialDraft?: GlazeDraft;
  mode?: 'create' | 'edit' | 'new-version';
  versionLabel?: string;
}) {
  const isEdit = initialDraft != null && mode !== 'new-version';
  const isNewVersion = mode === 'new-version';
  const [draft, setDraft] = React.useState<GlazeDraft>(() =>
    initialDraft ?? createEmptyGlazeDraft(defaultCone, collections),
  );
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const sheetHeight = useModalSheetHeight();
  const wasVisibleRef = React.useRef(visible);

  React.useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    wasVisibleRef.current = visible;
    if (!visible || wasVisible) return;

    setDraft(initialDraft ?? createEmptyGlazeDraft(defaultCone, collections));
    setShowAdvanced(Boolean(
      initialDraft?.bestClayType
      || initialDraft?.atmosphere
      || initialDraft?.bestFiringTempC,
    ));
  }, [visible, initialDraft, defaultCone, collections]);

  const isStoreBought = draft.source === 'store-bought';
  const brandChip = glazeBrandChipSelection(draft.supplier);
  const showCustomBrandInput = isStoreBought && brandChip === 'Other';
  const dateLabel = isStoreBought ? 'Date added' : 'Date mixed';

  const canSave =
    draft.name.trim().length > 0
    && (isStoreBought || hasValidRecipeIngredients(draft.recipeIngredients));

  const headerTitle = isNewVersion
    ? `New Version${versionLabel ? ` (${versionLabel})` : ''}`
    : isEdit
      ? 'Edit Glaze'
      : 'Add Glaze';

  const headerSubtitle = isNewVersion
    ? 'Tweak the recipe and save as your next batch.'
    : isEdit
      ? 'Update this entry in your atlas.'
      : 'Start with a photo, then fill in the basics.';

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            {headerTitle}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">{headerSubtitle}</Text>
        </ModalSheetHeader>

        <ModalFormScrollView
          className="px-6"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <FormField label="Photo" sectionStart first>
            <PhotoPickField
              photo={draft.bucketPhotoUri ?? draft.firstTilePhotoUri}
              onPhotoChange={(uri) => setDraft((d) => ({ ...d, bucketPhotoUri: uri }))}
              aspect={[1, 1]}
              iconColor="hsl(24 20% 45%)"
              hint={isStoreBought ? 'Jar or test tile photo' : 'Bucket or test tile photo'}
            />
          </FormField>

          {!isEdit && !isNewVersion ? (
            <View className="mt-5">
              <SourceToggle
                value={draft.source}
                onChange={(source) => setDraft((d) => ({ ...d, source }))}
              />
            </View>
          ) : (
            <View className="mt-5 px-1">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {GLAZE_SOURCE_LABELS[draft.source]}
              </Text>
            </View>
          )}

          <FormSectionCard
            title="Basics"
            subtitle={
              isStoreBought
                ? 'One jar or bottle per entry. Layering combos (e.g. Green Tea over Alabaster) need each product saved separately — browse stacks in Discover.'
                : 'What is it called, and when did you get or mix it?'
            }
            topGap
          >
              <FormField label="Glaze name" required first>
                <Input
                  value={draft.name}
                  onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
                  placeholder={isStoreBought ? 'Green Tea' : 'Floating Blue'}
                  accessibilityLabel="Glaze name"
                />
              </FormField>

              <FormField label={dateLabel}>
                <DatePickerField
                  valueIso={draft.dateMixed}
                  onChangeIso={(dateMixed) => setDraft((d) => ({ ...d, dateMixed }))}
                />
              </FormField>

              {isStoreBought ? (
                <FormField
                  label="Brand"
                  hint="Pick a brand so Discover combos can match glazes you own."
                  last
                >
                  <View className="flex-row flex-wrap gap-2">
                    {GLAZE_BRAND_OPTIONS.map((brand) => {
                      const active =
                        brand === 'Other' ? brandChip === 'Other' : draft.supplier === brand;
                      return (
                        <Pill
                          key={brand}
                          label={brand}
                          active={active}
                          onPress={() =>
                            setDraft((d) => ({
                              ...d,
                              supplier: brand === 'Other'
                                ? isKnownGlazeBrand(d.supplier) ? '' : d.supplier
                                : brand,
                            }))
                          }
                        />
                      );
                    })}
                  </View>
                  {showCustomBrandInput ? (
                    <View style={{ marginTop: 12 }}>
                      <Input
                        value={draft.supplier}
                        onChangeText={(v) => setDraft((d) => ({ ...d, supplier: v }))}
                        placeholder="Enter brand name"
                        accessibilityLabel="Custom glaze brand"
                      />
                    </View>
                  ) : null}
                </FormField>
              ) : null}
            </FormSectionCard>

            <FormSectionCard title="Firing">
              <FormField label="Firing cone" first>
                <Input
                  value={draft.defaultCone}
                  onChangeText={(v) => setDraft((d) => ({ ...d, defaultCone: v, coneRange: v }))}
                  placeholder="Cone 6"
                />
              </FormField>

              <FormField label="Surface finish" last>
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_FINISH_OPTIONS.map((option) => (
                    <Pill
                      key={option}
                      label={GLAZE_FINISH_LABELS[option]}
                      active={draft.finish === option}
                      onPress={() => setDraft((d) => ({ ...d, finish: option }))}
                    />
                  ))}
                </View>
              </FormField>
            </FormSectionCard>

            {!isStoreBought ? (
              <FormSectionCard title="Recipe" subtitle="At least one ingredient with a percentage.">
                <GlazeRecipeBuilder
                  ingredients={draft.recipeIngredients}
                  onChange={(recipeIngredients) =>
                    setDraft((d) => ({ ...d, recipeIngredients }))
                  }
                  batchSizeG={draft.batchSize}
                  onBatchSizeChange={(batchSize) =>
                    setDraft((d) => ({ ...d, batchSize }))
                  }
                />
                <View className="h-px bg-border mx-4" style={{ marginTop: 16, marginBottom: 12 }} />
                <Text className="text-[12px] font-semibold text-foreground mb-2">Batch status</Text>
                <GlazeStatusPillRow>
                  {GLAZE_STATUS_OPTIONS.map((option) => (
                    <GlazeStatusPill
                      key={option}
                      status={option}
                      active={draft.status === option}
                      accessibilityLabel={`Set status to ${GLAZE_STATUS_LABELS[option]}`}
                      onPress={() => setDraft((d) => ({ ...d, status: option }))}
                    />
                  ))}
                </GlazeStatusPillRow>
              </FormSectionCard>
            ) : null}

            <NotesInput
              label="Notes"
              hint={
                isStoreBought
                  ? 'Application tips, layering ideas, or how it fired.'
                  : 'Mixing steps, application, or firing tips for this batch.'
              }
              value={draft.notes}
              onChangeText={(v) => setDraft((d) => ({ ...d, notes: v }))}
              placeholder={
                isStoreBought
                  ? '2 thin brush coats on stoneware'
                  : 'Whisk 5 min, sieve 80 mesh'
              }
            />

            <CollapsibleFormSection
              title="More firing details"
              subtitle="Clay body, atmosphere, target temp — optional."
              open={showAdvanced}
              onOpenChange={setShowAdvanced}
            >
                  <FormField label="Works best on" first>
                    <View className="flex-row flex-wrap gap-2">
                      {GLAZE_CLAY_TYPE_OPTIONS.map((option) => (
                        <Pill
                          key={option}
                          label={GLAZE_CLAY_TYPE_LABELS[option]}
                          active={draft.bestClayType === option}
                          onPress={() =>
                            setDraft((d) => ({
                              ...d,
                              bestClayType: d.bestClayType === option ? undefined : option,
                            }))
                          }
                        />
                      ))}
                    </View>
                  </FormField>

                  <FormField label="Firing atmosphere">
                    <View className="flex-row flex-wrap gap-2">
                      {GLAZE_ATMOSPHERE_OPTIONS.map((option) => (
                        <Pill
                          key={option}
                          label={GLAZE_ATMOSPHERE_LABELS[option]}
                          active={draft.atmosphere === option}
                          onPress={() =>
                            setDraft((d) => ({
                              ...d,
                              atmosphere: d.atmosphere === option ? undefined : option,
                            }))
                          }
                        />
                      ))}
                    </View>
                  </FormField>

                  <FormField label="Best temp (°C)" last={!isStoreBought}>
                    <Input
                      value={draft.bestFiringTempC}
                      onChangeText={(v) =>
                        setDraft((d) => ({ ...d, bestFiringTempC: v.replace(/[^\d]/g, '') }))
                      }
                      placeholder="1240"
                      keyboardType="number-pad"
                    />
                  </FormField>

                  {!isStoreBought ? (
                    <FormField label="Material supplier (optional)" last>
                      <Input
                        value={draft.supplier}
                        onChangeText={(v) => setDraft((d) => ({ ...d, supplier: v }))}
                        placeholder="Clay supplier or brand"
                      />
                    </FormField>
                  ) : null}
            </CollapsibleFormSection>

            <FormSectionCard title="Collections" subtitle="Optional groups on top of My Glazes." last>
              <CollectionPicker
                availableCollections={collections}
                selected={draft.collections}
                onChange={(next) => setDraft((d) => ({ ...d, collections: next }))}
                onCreateCollection={onCreateCollection}
                hideHeader
                hideFooterTip
              />
            </FormSectionCard>
        </ModalFormScrollView>

        <ModalSheetFooter>
          <TouchableOpacity
            onPress={() => {
              if (canSave) onSave(draft);
            }}
            activeOpacity={0.82}
            disabled={!canSave}
            className={`rounded-2xl bg-primary py-4 items-center ${canSave ? '' : 'opacity-45'}`}
          >
            <Text className="text-sm font-semibold text-white">
              {isEdit ? 'Save Changes' : 'Save Glaze'}
            </Text>
          </TouchableOpacity>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
