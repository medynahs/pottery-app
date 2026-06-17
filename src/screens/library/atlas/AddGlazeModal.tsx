import { ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import {
  GLAZE_FINISH_LABELS,
  GLAZE_FINISH_OPTIONS,
  GLAZE_SOURCE_LABELS,
  GLAZE_SOURCE_OPTIONS,
} from '@/src/screens/glazes/types';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { CollectionPicker } from './CollectionPicker';
import { createEmptyGlazeDraft } from './helpers';
import { FormField } from './FormField';
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
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (draft: GlazeDraft) => void;
  defaultCone: string | null;
  collections: string[];
  onCreateCollection: (name: string) => void;
  initialDraft?: GlazeDraft;
}) {
  const isEdit = initialDraft != null;
  const [draft, setDraft] = React.useState<GlazeDraft>(() =>
    initialDraft ?? createEmptyGlazeDraft(defaultCone, collections),
  );
  const { openPickSheet } = usePhotoPicker();

  React.useEffect(() => {
    if (visible) {
      setDraft(initialDraft ?? createEmptyGlazeDraft(defaultCone, collections));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const canSave = draft.name.trim().length > 0;

  return (
    <ModalShell visible={visible} onClose={onClose} backdropColor="rgba(0,0,0,0.46)">
      <ModalCard radius={32} maxHeight={700}>
        <View className="px-6 pb-4 border-b border-border">
          <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            {isEdit ? 'Edit Glaze' : 'Add Glaze'}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {isEdit
              ? 'Update your glaze details.'
              : 'Name it, pick a finish — you can fill in the rest later.'}
          </Text>
        </View>

        <ScrollView
          className="px-6"
          contentContainerStyle={{ paddingBottom: 24 }}
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

          <FormField label="Name">
            <Input
              value={draft.name}
              onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
              placeholder="Quiet Satin Blue"
            />
          </FormField>

          <FormField label="Firing cone">
            <Input
              value={draft.defaultCone}
              onChangeText={(v) => setDraft((d) => ({ ...d, defaultCone: v, coneRange: v }))}
              placeholder="Cone 6"
            />
          </FormField>

          <FormField label="Finish">
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

          {isEdit ? (
            <>
              <View className="mt-6 border-t border-border" />

              <FormField label="Source">
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_SOURCE_OPTIONS.map((option) => (
                    <Pill
                      key={option}
                      label={GLAZE_SOURCE_LABELS[option]}
                      active={draft.source === option}
                      onPress={() => setDraft((d) => ({ ...d, source: option }))}
                    />
                  ))}
                </View>
              </FormField>

              <FormField label="Notes">
                <Input
                  value={draft.notes}
                  onChangeText={(v) => setDraft((d) => ({ ...d, notes: v }))}
                  placeholder="How this glaze behaves in your studio"
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 72, textAlignVertical: 'top' }}
                />
              </FormField>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormField label="Color family">
                    <Input
                      value={draft.colorFamily}
                      onChangeText={(v) => setDraft((d) => ({ ...d, colorFamily: v }))}
                      placeholder="Blue grey"
                    />
                  </FormField>
                </View>
                <View className="flex-1">
                  <FormField label="Supplier">
                    <Input
                      value={draft.supplier}
                      onChangeText={(v) => setDraft((d) => ({ ...d, supplier: v }))}
                      placeholder="Amaco, studio mix"
                    />
                  </FormField>
                </View>
              </View>

              <FormField label="Application notes">
                <Input
                  value={draft.applicationNotes}
                  onChangeText={(v) => setDraft((d) => ({ ...d, applicationNotes: v }))}
                  placeholder="Brush thin, dip medium"
                  multiline
                  numberOfLines={2}
                  style={{ minHeight: 64, textAlignVertical: 'top' }}
                />
              </FormField>

              <View className="mt-4">
                <CollectionPicker
                  availableCollections={collections}
                  selected={draft.collections}
                  onChange={(next) => setDraft((d) => ({ ...d, collections: next }))}
                  onCreateCollection={onCreateCollection}
                />
              </View>

              <View className="flex-row flex-wrap gap-2 mt-4">
                <Pill
                  label="Favorite"
                  active={draft.favorite}
                  onPress={() => setDraft((d) => ({ ...d, favorite: !d.favorite }))}
                />
                <Pill
                  label="Production"
                  active={draft.production}
                  onPress={() => setDraft((d) => ({ ...d, production: !d.production }))}
                />
              </View>
            </>
          ) : null}
        </ScrollView>

        <View className="px-6 pt-4 pb-8 border-t border-border">
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
        </View>
      </ModalCard>
    </ModalShell>
  );
}
