import { ModalCard, ModalShell } from '@/src/components/AppSheets';
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
import { useAppStore } from '@/src/store';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { FormField } from './FormField';
import { createEmptyTestDraft } from './helpers';
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
  const kilns = useAppStore((s) => s.kilns);
  const { openPickSheet } = usePhotoPicker();
  const [showDetails, setShowDetails] = React.useState(false);

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
      setShowDetails(false);
    }
  }, [visible, buildDraft]);

  const canSave =
    Boolean(testDraft.glazeId)
    && testDraft.clayBody.trim().length > 0
    && testDraft.cone.trim().length > 0;

  const handleSavePress = () => {
    if (!testDraft.glazeId) {
      showToast('Choose a glaze first', 'error');
      return;
    }
    if (!testDraft.clayBody.trim()) {
      showToast('Add a clay body for this test', 'error');
      return;
    }
    if (!testDraft.cone.trim()) {
      showToast('Add a firing cone', 'error');
      return;
    }
    onSave(testDraft);
  };

  return (
    <ModalShell visible={visible} onClose={onClose} backdropColor="rgba(0,0,0,0.46)">
        <ModalCard radius={32} maxHeight={760}>
          <View className="px-6 pb-4 border-b border-border">
            <Text className="text-2xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              Log Test Tile
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              Photo, result, clay, and cone — the essentials for a useful record.
            </Text>
          </View>

          <ScrollView
            className="px-6"
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
              <Input
                value={testDraft.firingDate}
                onChangeText={(v) => setTestDraft((d) => ({ ...d, firingDate: v }))}
                placeholder="2026-03-18"
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

            <TouchableOpacity
              onPress={() => setShowDetails((v) => !v)}
              activeOpacity={0.8}
              className="mt-4 flex-row items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
            >
              <Text className="text-sm font-semibold text-foreground">Kiln & application details</Text>
              <ChevronDown
                size={16}
                color="hsl(24 20% 40%)"
                style={{ transform: [{ rotate: showDetails ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>

            {showDetails ? (
              <View className="mt-3">
                {kilns.length > 0 ? (
                  <FormField label="Kiln" first>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {kilns.map((kiln) => (
                        <Pill
                          key={kiln.id}
                          label={kiln.name}
                          active={testDraft.kilnName === kiln.name}
                          onPress={() => setTestDraft((d) => ({ ...d, kilnName: kiln.name }))}
                        />
                      ))}
                    </ScrollView>
                  </FormField>
                ) : (
                  <FormField label="Kiln" first>
                    <Input
                      value={testDraft.kilnName}
                      onChangeText={(v) => setTestDraft((d) => ({ ...d, kilnName: v }))}
                      placeholder="Studio kiln"
                    />
                  </FormField>
                )}

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
              </View>
            ) : null}
          </ScrollView>

          <View className="px-6 pt-4 pb-8 border-t border-border">
            <TouchableOpacity
              onPress={handleSavePress}
              activeOpacity={0.82}
              disabled={!canSave}
              className={`rounded-2xl bg-primary py-4 items-center ${canSave ? '' : 'opacity-45'}`}
            >
              <Text className="text-sm font-semibold text-white">Save Test Tile</Text>
            </TouchableOpacity>
          </View>
        </ModalCard>
      </ModalShell>
  );
}
