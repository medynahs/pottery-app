import { ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
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
import React from 'react';
import {
    ScrollView,
    TouchableOpacity,
    View
} from 'react-native';
import { createEmptyTestDraft, pickImage } from './helpers';
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
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (draft: TestDraft) => void;
  glazes: GlazeLibraryItem[];
  clayBodies: Array<{ name: string }>;
  defaultGlazeTemp: string | null;
}) {
  const [testDraft, setTestDraft] = React.useState<TestDraft>(() =>
    createEmptyTestDraft(glazes[0]?.id ?? '', defaultGlazeTemp),
  );

  React.useEffect(() => {
    if (visible) {
      setTestDraft(createEmptyTestDraft(glazes[0]?.id ?? '', defaultGlazeTemp));
    }
  }, [visible]);

  React.useEffect(() => {
    if (!testDraft.glazeId && glazes[0]?.id) {
      setTestDraft((d) => ({ ...d, glazeId: glazes[0].id }));
    }
  }, [glazes]);

  return (
    <ModalShell visible={visible} onClose={onClose} backdropColor="rgba(0,0,0,0.46)">
      <ModalCard variant="pottery" radius={32} maxHeight={760}>
            <View
              style={{
                paddingHorizontal: 24,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E8D9BE',
              }}
            >
              <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, color: '#3A2810' }}>
                Log Test Tile
              </Text>
              <Text style={{ fontSize: 13, color: '#A68555', marginTop: 4 }}>
                Keep it fast: glaze, clay, cone, method, thickness, result.
              </Text>
            </View>

            <ScrollView
              style={{ paddingHorizontal: 24 }}
              contentContainerStyle={{ paddingBottom: 28 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Glaze selector */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: '#A68555',
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                Glaze
              </Text>
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

              {/* Clay + cone */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: '#A68555',
                      marginBottom: 6,
                    }}
                  >
                    Clay body
                  </Text>
                  <Input
                    value={testDraft.clayBody}
                    onChangeText={(v) => setTestDraft((d) => ({ ...d, clayBody: v }))}
                    placeholder={clayBodies[0]?.name ?? 'Stoneware'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: '#A68555',
                      marginBottom: 6,
                    }}
                  >
                    Cone
                  </Text>
                  <Input
                    value={testDraft.cone}
                    onChangeText={(v) => setTestDraft((d) => ({ ...d, cone: v }))}
                    placeholder={defaultGlazeTemp ?? GLAZE_TEMPS[0]}
                  />
                </View>
              </View>

              {/* Kiln + shelf */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: '#A68555',
                      marginBottom: 6,
                    }}
                  >
                    Kiln
                  </Text>
                  <Input
                    value={testDraft.kilnName}
                    onChangeText={(v) => setTestDraft((d) => ({ ...d, kilnName: v }))}
                    placeholder="North Skutt"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1.5,
                      color: '#A68555',
                      marginBottom: 6,
                    }}
                  >
                    Shelf position
                  </Text>
                  <Input
                    value={testDraft.shelfPosition}
                    onChangeText={(v) => setTestDraft((d) => ({ ...d, shelfPosition: v }))}
                    placeholder="Top shelf"
                  />
                </View>
              </View>

              {/* Kiln type */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: '#A68555',
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                Kiln type
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GLAZE_KILN_TYPE_OPTIONS.map((option) => (
                  <Pill
                    key={option}
                    label={GLAZE_KILN_TYPE_LABELS[option]}
                    active={testDraft.kilnType === option}
                    onPress={() => setTestDraft((d) => ({ ...d, kilnType: option }))}
                  />
                ))}
              </View>

              {/* Application method */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: '#A68555',
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                Application method
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GLAZE_APPLICATION_METHOD_OPTIONS.map((option) => (
                  <Pill
                    key={option}
                    label={GLAZE_APPLICATION_METHOD_LABELS[option]}
                    active={testDraft.applicationMethod === option}
                    onPress={() => setTestDraft((d) => ({ ...d, applicationMethod: option }))}
                  />
                ))}
              </View>

              {/* Thickness */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: '#A68555',
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                Thickness
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GLAZE_THICKNESS_OPTIONS.map((option) => (
                  <Pill
                    key={option}
                    label={GLAZE_THICKNESS_LABELS[option]}
                    active={testDraft.thickness === option}
                    onPress={() => setTestDraft((d) => ({ ...d, thickness: option }))}
                  />
                ))}
              </View>

              {/* Layered with */}
              <View style={{ marginTop: 14 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginBottom: 6,
                  }}
                >
                  Layered with
                </Text>
                <Input
                  value={testDraft.layeredWith}
                  onChangeText={(v) => setTestDraft((d) => ({ ...d, layeredWith: v }))}
                  placeholder="Top glaze, bottom glaze, liner"
                />
              </View>

              {/* Firing date */}
              <View style={{ marginTop: 14 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginBottom: 6,
                  }}
                >
                  Firing date
                </Text>
                <Input
                  value={testDraft.firingDate}
                  onChangeText={(v) => setTestDraft((d) => ({ ...d, firingDate: v }))}
                  placeholder="2026-03-18"
                />
              </View>

              {/* Result feeling */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: '#A68555',
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                Result feeling
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GLAZE_RESULT_OPTIONS.map((option) => (
                  <Pill
                    key={option}
                    label={GLAZE_RESULT_LABELS[option]}
                    active={testDraft.resultRating === option}
                    onPress={() => setTestDraft((d) => ({ ...d, resultRating: option }))}
                  />
                ))}
              </View>

              {/* Defects */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: '#A68555',
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                Defects
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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

              {/* Notes */}
              <View style={{ marginTop: 14 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#A68555',
                    marginBottom: 6,
                  }}
                >
                  Notes
                </Text>
                <Input
                  value={testDraft.notes}
                  onChangeText={(v) => setTestDraft((d) => ({ ...d, notes: v }))}
                  placeholder="Surface, color, texture, lesson learned"
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
              </View>

              {/* Photo */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: '#A68555',
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                Photo
              </Text>
              <MediaSlot
                label="Tap to add tile photo"
                uri={testDraft.photoUri}
                onPress={() => pickImage((uri) => setTestDraft((d) => ({ ...d, photoUri: uri })))}
              />
            </ScrollView>

            <View
              style={{
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: 32,
                borderTopWidth: 1,
                borderTopColor: '#E8D9BE',
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (testDraft.glazeId && testDraft.clayBody.trim() && testDraft.cone.trim()) {
                    onSave(testDraft);
                  }
                }}
                activeOpacity={0.82}
                style={{
                  borderRadius: 18,
                  backgroundColor: '#C9963A',
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>
                  Save Test Tile
                </Text>
              </TouchableOpacity>
            </View>
      </ModalCard>
    </ModalShell>
  );
}
