import { Text } from '@/src/components/ui/text';
import {
  deriveCustomCollectionNames,
  SAVED_FROM_COMMUNITY_COLLECTION,
  sanitizeCustomCollections,
} from '@/src/screens/library/atlas/collections';
import type { CommunityGlazeRecipePayload } from '@/src/screens/glazes/shareGlazeRecipe/glazePostPayload';
import { Check, FolderPlus } from 'lucide-react-native';
import React from 'react';
import { Modal, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SaveCommunityGlazeSheetProps = {
  payload: CommunityGlazeRecipePayload | null;
  postId: string | null;
  collections: string[];
  onClose: () => void;
  onSave: (selectedCollections: string[]) => void;
};

export function SaveCommunityGlazeSheet({
  payload,
  postId,
  collections,
  onClose,
  onSave,
}: SaveCommunityGlazeSheetProps) {
  const insets = useSafeAreaInsets();
  const visible = payload !== null && postId !== null;

  const [selected, setSelected] = React.useState<string[]>([SAVED_FROM_COMMUNITY_COLLECTION]);
  const [newInput, setNewInput] = React.useState('');
  const [showNewInput, setShowNewInput] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setSelected([SAVED_FROM_COMMUNITY_COLLECTION]);
      setNewInput('');
      setShowNewInput(false);
    }
  }, [visible, payload?.name, postId]);

  const toggle = (name: string) => {
    if (name === SAVED_FROM_COMMUNITY_COLLECTION) return;
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  };

  const addNewCollection = () => {
    const name = sanitizeCustomCollections([newInput])[0];
    if (!name) return;
    setSelected((prev) => [...new Set([...prev, name])]);
    setNewInput('');
    setShowNewInput(false);
  };

  const extraCollections = deriveCustomCollectionNames([], collections).filter(
    (c) => c !== SAVED_FROM_COMMUNITY_COLLECTION,
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.46)' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: '#FDFAF5',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: '#D9C9A8',
              borderRadius: 2,
              alignSelf: 'center',
              marginTop: 14,
              marginBottom: 10,
            }}
          />
          <View
            style={{
              paddingHorizontal: 24,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#E8D9BE',
            }}
          >
            <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 19, color: '#3A2810' }}>
              Save to Glaze Atlas
            </Text>
            {payload ? (
              <Text style={{ fontSize: 12, color: '#A68555', marginTop: 3 }}>
                {payload.name} · {payload.defaultCone}
              </Text>
            ) : null}
            <Text style={{ fontSize: 11, color: '#A68555', marginTop: 6, lineHeight: 16 }}>
              Saved to “{SAVED_FROM_COMMUNITY_COLLECTION}”. You can add more collections below.
            </Text>
          </View>

          <ScrollView
            style={{ paddingHorizontal: 24, maxHeight: 260 }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 13,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: '#C9963A',
                  backgroundColor: '#FFF3DC',
                }}
              >
                <Check size={11} color="#8B5E1A" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#8B5E1A' }}>
                  {SAVED_FROM_COMMUNITY_COLLECTION}
                </Text>
              </View>

              {extraCollections.map((col) => {
                const active = selected.includes(col);
                return (
                  <TouchableOpacity
                    key={col}
                    onPress={() => toggle(col)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      paddingHorizontal: 13,
                      paddingVertical: 8,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: active ? '#C9963A' : '#E8D9BE',
                      backgroundColor: active ? '#FFF3DC' : '#FFFBF4',
                    }}
                  >
                    {active ? <Check size={11} color="#8B5E1A" /> : null}
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: active ? '#8B5E1A' : '#A68555',
                      }}
                    >
                      {col}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={() => setShowNewInput((v) => !v)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 13,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: '#D9C9A8',
                  backgroundColor: '#FFFBF4',
                }}
              >
                <FolderPlus size={11} color="#A68555" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#A68555' }}>New</Text>
              </TouchableOpacity>
            </View>

            {showNewInput ? (
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 14 }}>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#D9C9A8',
                    backgroundColor: '#FFFBF4',
                    paddingHorizontal: 13,
                    paddingVertical: 9,
                  }}
                >
                  <TextInput
                    value={newInput}
                    onChangeText={setNewInput}
                    placeholder="Collection name…"
                    placeholderTextColor="#C4B48C"
                    style={{ fontSize: 13, color: '#3A2810', padding: 0 }}
                    autoFocus
                    maxLength={32}
                    returnKeyType="done"
                    onSubmitEditing={addNewCollection}
                  />
                </View>
                <TouchableOpacity
                  onPress={addNewCollection}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: '#C9963A',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: 'white' }}>Add</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: insets.bottom + 24,
              borderTopWidth: 1,
              borderTopColor: '#E8D9BE',
            }}
          >
            <TouchableOpacity
              onPress={() => onSave(selected)}
              activeOpacity={0.82}
              style={{
                borderRadius: 16,
                backgroundColor: '#C9963A',
                paddingVertical: 15,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>Save Glaze</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
