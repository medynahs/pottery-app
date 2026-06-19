import {
  ModalCard,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { DatePickerField } from '@/src/components/DatePickerField';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import {
  GLAZE_ATMOSPHERE_LABELS,
  GLAZE_ATMOSPHERE_OPTIONS,
  GLAZE_CLAY_TYPE_LABELS,
  GLAZE_CLAY_TYPE_OPTIONS,
  GLAZE_FINISH_LABELS,
  GLAZE_FINISH_OPTIONS,
  GLAZE_STATUS_EMOJI,
  GLAZE_STATUS_LABELS,
  GLAZE_STATUS_OPTIONS,
} from '@/src/screens/glazes/types';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { CollectionPicker } from './CollectionPicker';
import { createEmptyGlazeDraft } from './helpers';
import { FormField, FormFieldRow } from './FormField';
import { GlazeRecipeBuilder, hasValidRecipeIngredients } from './GlazeRecipeBuilder';
import { MediaSlot } from './MediaSlot';
import { Pill } from './Pill';
import type { GlazeDraft } from './types';

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
  /** Override header when creating a new version from a parent batch. */
  mode?: 'create' | 'edit' | 'new-version';
  versionLabel?: string;
}) {
  const isEdit = initialDraft != null && mode !== 'new-version';
  const isNewVersion = mode === 'new-version';
  const [draft, setDraft] = React.useState<GlazeDraft>(() =>
    initialDraft ?? createEmptyGlazeDraft(defaultCone, collections),
  );
  const { openPickSheet } = usePhotoPicker();
  const sheetHeight = useModalSheetHeight();

  React.useEffect(() => {
    if (visible) {
      setDraft(initialDraft ?? createEmptyGlazeDraft(defaultCone, collections));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const canSave =
    draft.name.trim().length > 0 && hasValidRecipeIngredients(draft.recipeIngredients);

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            {isNewVersion
              ? `New Version${versionLabel ? ` (${versionLabel})` : ''}`
              : isEdit
                ? 'Edit Glaze'
                : 'New Glaze Batch'}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {isNewVersion
              ? 'Recipe and notes carry over — tweak the mix and save as the next batch.'
              : isEdit
                ? 'Update this batch’s recipe, firing notes, and collections.'
                : 'Name your batch and build the recipe row by row.'}
          </Text>
        </ModalSheetHeader>

        <ScrollView
          className="px-6"
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormField label="Photo" first>
            <MediaSlot
              label="Tap to add a photo"
              uri={draft.bucketPhotoUri ?? draft.firstTilePhotoUri}
              onPress={() =>
                openPickSheet((uri) => setDraft((d) => ({ ...d, bucketPhotoUri: uri })))
              }
              large
            />
          </FormField>

          <FormFieldRow>
            <FormField label="Name" required inline>
              <Input
                value={draft.name}
                onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
                placeholder="Cobalt Blue v1"
              />
            </FormField>
            <FormField label="Date mixed" inline>
              <DatePickerField
                valueIso={draft.dateMixed}
                onChangeIso={(dateMixed) => setDraft((d) => ({ ...d, dateMixed }))}
              />
            </FormField>
          </FormFieldRow>

          <FormField label="Recipe" required>
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
          </FormField>

          <FormField label="Status">
            <View className="flex-row flex-wrap gap-2">
              {GLAZE_STATUS_OPTIONS.map((option) => (
                <Pill
                  key={option}
                  label={`${GLAZE_STATUS_EMOJI[option]} ${GLAZE_STATUS_LABELS[option]}`}
                  active={draft.status === option}
                  onPress={() => setDraft((d) => ({ ...d, status: option }))}
                />
              ))}
            </View>
          </FormField>

          <FormFieldRow>
            <FormField label="Firing cone" inline>
              <Input
                value={draft.defaultCone}
                onChangeText={(v) => setDraft((d) => ({ ...d, defaultCone: v, coneRange: v }))}
                placeholder="Cone 6"
              />
            </FormField>
            <FormField label="Best temp (°C)" inline>
              <Input
                value={draft.bestFiringTempC}
                onChangeText={(v) => setDraft((d) => ({ ...d, bestFiringTempC: v.replace(/[^\d]/g, '') }))}
                placeholder="1240"
                keyboardType="number-pad"
              />
            </FormField>
          </FormFieldRow>

          <FormField label="Works best on">
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

          <FormField label="Surface finish">
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

          <FormField
            label="Notes"
            hint="Mixing, application, and firing tips for this batch."
            spacedBelow
          >
            <Input
              value={draft.notes}
              onChangeText={(v) => setDraft((d) => ({ ...d, notes: v }))}
              placeholder="Brush two thin coats; best on stoneware at 1240°C"
              multiline
              numberOfLines={3}
              style={{ minHeight: 72, textAlignVertical: 'top' }}
            />
          </FormField>

          <FormField
            label="Collections"
            hint="Every glaze is in My Glazes. Add custom groups here."
            sectionStart
            last
          >
            <CollectionPicker
              availableCollections={collections}
              selected={draft.collections}
              onChange={(next) => setDraft((d) => ({ ...d, collections: next }))}
              onCreateCollection={onCreateCollection}
              hideHeader
              hideFooterTip
            />
          </FormField>
        </ScrollView>

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
