import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import {
    GLAZE_FINISH_LABELS,
    GLAZE_FINISH_OPTIONS,
    GLAZE_SOURCE_LABELS,
    GLAZE_SOURCE_OPTIONS,
} from '@/src/screens/glazes/types';
import React from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { CollectionChip } from './CollectionChip';
import { createEmptyGlazeDraft, pickImage } from './helpers';
import { MediaSlot } from './MediaSlot';
import { Pill } from './Pill';
import type { AddMode, GlazeDraft } from './types';

export function AddGlazeModal({
  visible,
  onClose,
  onSave,
  defaultCone,
  collections,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (draft: GlazeDraft) => void;
  defaultCone: string | null;
  collections: string[];
}) {
  const [addMode, setAddMode] = React.useState<AddMode>('quick');
  const [draft, setDraft] = React.useState<GlazeDraft>(() =>
    createEmptyGlazeDraft(defaultCone, collections),
  );

  React.useEffect(() => {
    if (visible) {
      setDraft(createEmptyGlazeDraft(defaultCone, collections));
      setAddMode('quick');
    }
  }, [visible, defaultCone]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.46)' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View
            style={{
              backgroundColor: '#FDFAF5',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              maxHeight: 780,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: '#D9C9A8',
                borderRadius: 2,
                alignSelf: 'center',
                marginTop: 16,
                marginBottom: 12,
              }}
            />
            <View
              style={{
                paddingHorizontal: 24,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E8D9BE',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, color: '#3A2810' }}>
                  Add Glaze
                </Text>
                <Text style={{ fontSize: 13, color: '#A68555', marginTop: 4 }}>
                  Quick add keeps the barrier low. Advanced mode captures the full profile.
                </Text>
              </View>
            </View>

            <ScrollView
              style={{ paddingHorizontal: 24 }}
              contentContainerStyle={{ paddingBottom: 28 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Mode toggle */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 4 }}>
                <Pill label="Quick" active={addMode === 'quick'} onPress={() => setAddMode('quick')} />
                <Pill
                  label="Advanced"
                  active={addMode === 'advanced'}
                  onPress={() => setAddMode('advanced')}
                />
              </View>

              {/* Glaze name */}
              <View style={{ marginTop: 16 }}>
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
                  Glaze name
                </Text>
                <Input
                  value={draft.name}
                  onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
                  placeholder="e.g. Quiet Satin Blue"
                />
              </View>

              {/* Cone row */}
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
                    Default cone
                  </Text>
                  <Input
                    value={draft.defaultCone}
                    onChangeText={(v) => setDraft((d) => ({ ...d, defaultCone: v }))}
                    placeholder="Cone 6"
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
                    Cone range
                  </Text>
                  <Input
                    value={draft.coneRange}
                    onChangeText={(v) => setDraft((d) => ({ ...d, coneRange: v }))}
                    placeholder="Cone 5-6"
                  />
                </View>
              </View>

              {/* Finish */}
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
                Finish
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GLAZE_FINISH_OPTIONS.map((option) => (
                  <Pill
                    key={option}
                    label={GLAZE_FINISH_LABELS[option]}
                    active={draft.finish === option}
                    onPress={() => setDraft((d) => ({ ...d, finish: option }))}
                  />
                ))}
              </View>

              {/* Source */}
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
                Source
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {GLAZE_SOURCE_OPTIONS.map((option) => (
                  <Pill
                    key={option}
                    label={GLAZE_SOURCE_LABELS[option]}
                    active={draft.source === option}
                    onPress={() => setDraft((d) => ({ ...d, source: option }))}
                  />
                ))}
              </View>

              {/* Save to collection */}
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
                Save to collection
              </Text>
              {collections.length === 0 ? (
                <Text style={{ fontSize: 12, color: '#A68555' }}>
                  No collections yet — glaze will be saved to "My Glazes".
                </Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {collections.map((col) => (
                    <CollectionChip
                      key={col}
                      name={col}
                      selected={draft.collections.includes(col)}
                      onPress={() =>
                        setDraft((d) => ({
                          ...d,
                          collections: d.collections.includes(col)
                            ? d.collections.filter((c) => c !== col)
                            : [...d.collections, col],
                        }))
                      }
                    />
                  ))}
                </View>
              )}

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
                  Quick notes
                </Text>
                <Input
                  value={draft.notes}
                  onChangeText={(v) => setDraft((d) => ({ ...d, notes: v }))}
                  placeholder="How this glaze usually behaves"
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
              </View>

              {/* Advanced fields */}
              {addMode === 'advanced' ? (
                <>
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
                        Color family
                      </Text>
                      <Input
                        value={draft.colorFamily}
                        onChangeText={(v) => setDraft((d) => ({ ...d, colorFamily: v }))}
                        placeholder="Blue Grey"
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
                        Supplier
                      </Text>
                      <Input
                        value={draft.supplier}
                        onChangeText={(v) => setDraft((d) => ({ ...d, supplier: v }))}
                        placeholder="Amaco, Mayco, Studio"
                      />
                    </View>
                  </View>

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
                        Batch size
                      </Text>
                      <Input
                        value={draft.batchSize}
                        onChangeText={(v) => setDraft((d) => ({ ...d, batchSize: v }))}
                        placeholder="5000 g batch"
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
                        Tags
                      </Text>
                      <Input
                        value={draft.tags}
                        onChangeText={(v) => setDraft((d) => ({ ...d, tags: v }))}
                        placeholder="matte, blue, cone 6"
                      />
                    </View>
                  </View>

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
                      Application notes
                    </Text>
                    <Input
                      value={draft.applicationNotes}
                      onChangeText={(v) => setDraft((d) => ({ ...d, applicationNotes: v }))}
                      placeholder="Brush thin, dip medium, watch the rim"
                      multiline
                      numberOfLines={3}
                      style={{ minHeight: 80, textAlignVertical: 'top' }}
                    />
                  </View>

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
                      Recipe notes
                    </Text>
                    <Input
                      value={draft.recipeNotes}
                      onChangeText={(v) => setDraft((d) => ({ ...d, recipeNotes: v }))}
                      placeholder="Batch notes, sieve notes, weirdness"
                      multiline
                      numberOfLines={3}
                      style={{ minHeight: 80, textAlignVertical: 'top' }}
                    />
                  </View>

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
                    Starter media
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <MediaSlot
                      label="Bucket photo"
                      uri={draft.bucketPhotoUri}
                      onPress={() =>
                        pickImage((uri) => setDraft((d) => ({ ...d, bucketPhotoUri: uri })))
                      }
                    />
                    <MediaSlot
                      label="Test tile"
                      uri={draft.firstTilePhotoUri}
                      onPress={() =>
                        pickImage((uri) => setDraft((d) => ({ ...d, firstTilePhotoUri: uri })))
                      }
                    />
                    <MediaSlot
                      label="Finished piece"
                      uri={draft.firstPiecePhotoUri}
                      onPress={() =>
                        pickImage((uri) => setDraft((d) => ({ ...d, firstPiecePhotoUri: uri })))
                      }
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
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
                  if (draft.name.trim()) onSave(draft);
                }}
                activeOpacity={0.82}
                style={{
                  borderRadius: 18,
                  backgroundColor: '#C9963A',
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>Save Glaze</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
