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
  GLAZE_APPLICATION_METHOD_LABELS,
  GLAZE_APPLICATION_METHOD_OPTIONS,
  GLAZE_DEFECT_LABELS,
  GLAZE_DEFECT_OPTIONS,
  GLAZE_KILN_TYPE_LABELS,
  GLAZE_KILN_TYPE_OPTIONS,
  GLAZE_RESULT_LABELS,
  GLAZE_RESULT_OPTIONS,
  GLAZE_THICKNESS_LABELS,
  GLAZE_THICKNESS_OPTIONS,
  type GlazeLibraryItem,
} from '@/src/screens/glazes/types';
import { GLAZE_TEMPS } from '@/src/screens/pieces/utils/constants';
import {
  labelForMappedOutcome,
  previewTestTileOutcome,
} from '@/src/screens/glazes/glazeOutcomeMap';
import { useAppStore } from '@/src/store';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { FormField } from './FormField';
import { createEmptyTestDraft } from './helpers';
import { isValidTestDraft, buildGlazeTestFromDraft, kilnTypeFromStudioKiln } from './glazeTestDraft';
import { KilnPickerField } from './KilnPickerField';
import { MediaSlot } from './MediaSlot';
import { Pill } from './Pill';
import type { TestDraft } from './types';

export function LogTestModal({
  visible,
  onClose,
  onSave,
  glazes,
  clayBodies,
  defaultGlazeTemp,
  preselectedGlazeId,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (draft: TestDraft) => void;
  glazes: GlazeLibraryItem[];
  clayBodies: Array<{ id: string; name: string }>;
  defaultGlazeTemp: string | null;
  preselectedGlazeId?: string;
}) {
  const showToast = useAppStore((s) => s.showToast);
  const defaultClayBodyId = useAppStore((s) => s.defaultClayBodyId);
  const { openPickSheet } = usePhotoPicker();
  const sheetHeight = useModalSheetHeight();
  const resolveDefaultClayBody = React.useCallback(() => {
    if (defaultClayBodyId) {
      const match = clayBodies.find((body) => body.id === defaultClayBodyId);
      if (match?.name) return match.name;
    }
    return clayBodies[0]?.name ?? '';
  }, [clayBodies, defaultClayBodyId]);

  const buildDraft = React.useCallback(
    () =>
      createEmptyTestDraft(
        preselectedGlazeId ?? glazes[0]?.id ?? '',
        defaultGlazeTemp,
        resolveDefaultClayBody(),
      ),
    [glazes, defaultGlazeTemp, preselectedGlazeId, resolveDefaultClayBody],
  );

  const [testDraft, setTestDraft] = React.useState<TestDraft>(buildDraft);

  React.useEffect(() => {
    if (visible) {
      setTestDraft(buildDraft());
    }
  }, [visible, buildDraft]);

  const canSave = isValidTestDraft(testDraft);

  const mappedOutcomePreview = previewTestTileOutcome(testDraft.resultRating, testDraft.defects);

  const handleSavePress = () => {
    if (!testDraft.glazeId) {
      showToast('Choose a glaze first', 'error');
      return;
    }
    if (!testDraft.clayBody?.trim()) {
      showToast('Add a clay body for this test', 'error');
      return;
    }
    if (!testDraft.cone?.trim()) {
      showToast('Add a firing cone', 'error');
      return;
    }
    onSave(testDraft);
  };

  return (
    <ModalShell visible={visible} onClose={onClose}>
        <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
          <ModalSheetHeader>
            <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              Log Test Tile
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Photo, result, clay, and cone: the essentials for a useful record.
            </Text>
          </ModalSheetHeader>

          <ScrollView
            className="px-6"
            style={{ flex: 1, minHeight: 0 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FormField label="Test tile photo" first>
              <MediaSlot
                label="Tap to add tile photo"
                uri={testDraft.photoUri}
                onPress={() => openPickSheet((uri) => setTestDraft((d) => ({ ...d, photoUri: uri })))}
                large
              />
            </FormField>

            <FormField label="Glaze">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {glazes.map((glaze) => (
                  <Pill
                    key={glaze.id}
                    label={glaze.name}
                    active={testDraft.glazeId === glaze.id}
                    onPress={() =>
                      setTestDraft((d) => ({
                        ...d,
                        glazeId: glaze.id,
                        cone: glaze.defaultCone || d.cone,
                      }))
                    }
                  />
                ))}
              </ScrollView>
            </FormField>

            <FormField label="Result">
              <View className="flex-row flex-wrap gap-2">
                {GLAZE_RESULT_OPTIONS.map((option) => (
                  <Pill
                    key={option}
                    label={GLAZE_RESULT_LABELS[option]}
                    active={testDraft.resultRating === option}
                    onPress={() => setTestDraft((d) => ({ ...d, resultRating: option }))}
                  />
                ))}
              </View>
            </FormField>

            {mappedOutcomePreview ? (
              <Text className="text-xs text-muted-foreground mt-2 leading-5">
                Rolls up in glaze stats as{' '}
                <Text className="font-semibold text-foreground">
                  {labelForMappedOutcome(mappedOutcomePreview)}
                </Text>
                . Test tiles stay in your lab notebook, piece firings use the same outcome labels.
              </Text>
            ) : null}

            <View className="flex-row gap-3 mt-4">
              <View className="flex-1">
                <FormField label="Clay body">
                  <Input
                    value={testDraft.clayBody}
                    onChangeText={(v) => setTestDraft((d) => ({ ...d, clayBody: v }))}
                    placeholder={resolveDefaultClayBody() || 'Stoneware'}
                  />
                </FormField>
              </View>
              <View className="flex-1">
                <FormField label="Cone">
                  <Input
                    value={testDraft.cone}
                    onChangeText={(v) => setTestDraft((d) => ({ ...d, cone: v }))}
                    placeholder={defaultGlazeTemp ?? GLAZE_TEMPS[0]}
                  />
                </FormField>
              </View>
            </View>

            {clayBodies.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, marginTop: 8 }}
              >
                {clayBodies.map((body) => (
                  <Pill
                    key={body.id}
                    label={body.name}
                    active={testDraft.clayBody === body.name}
                    onPress={() => setTestDraft((d) => ({ ...d, clayBody: body.name }))}
                  />
                ))}
              </ScrollView>
            ) : null}

            <FormField label="Firing date">
              <DatePickerField
                valueIso={
                  testDraft.firingDate.length >= 10
                    ? testDraft.firingDate.slice(0, 10)
                    : testDraft.firingDate
                }
                onChangeIso={(iso) => setTestDraft((d) => ({ ...d, firingDate: iso }))}
              />
            </FormField>

            <FormField label="Notes">
              <Input
                value={testDraft.notes}
                onChangeText={(v) => setTestDraft((d) => ({ ...d, notes: v }))}
                placeholder="Color, texture, lesson learned"
                multiline
                numberOfLines={2}
                style={{ minHeight: 64, textAlignVertical: 'top' }}
              />
            </FormField>

            <View className="mt-6 border-t border-border" />

            <FormField label="Kiln (optional)">
              <KilnPickerField
                value={testDraft.kilnName ?? ''}
                onChange={(kilnName, kiln) => {
                  setTestDraft((d) => ({
                    ...d,
                    kilnName,
                    kilnType: kiln ? kilnTypeFromStudioKiln(kiln.type) : d.kilnType,
                  }));
                }}
              />
            </FormField>

            <FormField label="Application">
              <View className="flex-row flex-wrap gap-2">
                {GLAZE_APPLICATION_METHOD_OPTIONS.map((option) => (
                  <Pill
                    key={option}
                    label={GLAZE_APPLICATION_METHOD_LABELS[option]}
                    active={testDraft.applicationMethod === option}
                    onPress={() => setTestDraft((d) => ({ ...d, applicationMethod: option }))}
                  />
                ))}
              </View>
            </FormField>

            <FormField label="Thickness">
              <View className="flex-row flex-wrap gap-2">
                {GLAZE_THICKNESS_OPTIONS.map((option) => (
                  <Pill
                    key={option}
                    label={GLAZE_THICKNESS_LABELS[option]}
                    active={testDraft.thickness === option}
                    onPress={() => setTestDraft((d) => ({ ...d, thickness: option }))}
                  />
                ))}
              </View>
            </FormField>

            <FormField label="Defects">
              <View className="flex-row flex-wrap gap-2">
                {GLAZE_DEFECT_OPTIONS.map((option) => {
                  const active = testDraft.defects.includes(option);
                  return (
                    <Pill
                      key={option}
                      label={GLAZE_DEFECT_LABELS[option]}
                      active={active}
                      onPress={() =>
                        setTestDraft((d) => ({
                          ...d,
                          defects: active
                            ? d.defects.filter((item) => item !== option)
                            : [...d.defects, option],
                        }))
                      }
                    />
                  );
                })}
              </View>
            </FormField>

            <FormField label="Layered with">
              <Input
                value={testDraft.layeredWith}
                onChangeText={(v) => setTestDraft((d) => ({ ...d, layeredWith: v }))}
                placeholder="Liner glaze, accent coat"
              />
            </FormField>

            {!testDraft.kilnName ? (
              <FormField label="Kiln type">
                <View className="flex-row flex-wrap gap-2">
                  {GLAZE_KILN_TYPE_OPTIONS.map((option) => (
                    <Pill
                      key={option}
                      label={GLAZE_KILN_TYPE_LABELS[option]}
                      active={testDraft.kilnType === option}
                      onPress={() => setTestDraft((d) => ({ ...d, kilnType: option }))}
                    />
                  ))}
                </View>
              </FormField>
            ) : null}
          </ScrollView>

          <ModalSheetFooter>
            <TouchableOpacity
              onPress={handleSavePress}
              activeOpacity={0.82}
              disabled={!canSave}
              className={`rounded-2xl bg-primary py-4 items-center ${canSave ? '' : 'opacity-45'}`}
            >
              <Text className="text-sm font-semibold text-white">Save Test Tile</Text>
            </TouchableOpacity>
          </ModalSheetFooter>
        </ModalCard>
      </ModalShell>
  );
}
