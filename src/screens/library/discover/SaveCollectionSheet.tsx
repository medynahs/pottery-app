import { Text } from '@/src/components/ui/text';
import { Check, FolderPlus } from 'lucide-react-native';
import React from 'react';
import {
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DiscoverRecipe } from './types';

export function SaveCollectionSheet({
  recipe,
  collections,
  onClose,
  onSave,
}: {
  recipe: DiscoverRecipe | null;
  collections: string[];
  onClose: () => void;
  onSave: (selectedCollections: string[]) => void;
}) {
  const insets = useSafeAreaInsets();

  const [selected, setSelected] = React.useState<string[]>([]);
  const [newInput, setNewInput] = React.useState('');
  const [showNewInput, setShowNewInput] = React.useState(false);

  // Reset selections when a new recipe is targeted
  React.useEffect(() => {
    if (recipe) {
      setSelected([]);
      setNewInput('');
      setShowNewInput(false);
    }
  }, [recipe?.id]);

  function toggle(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  }

  function addNewCollection() {
    const name = newInput.trim();
    if (!name) return;
    if (!selected.includes(name)) {
      setSelected((prev) => [...prev, name]);
    }
    setNewInput('');
    setShowNewInput(false);
  }

  const displayCollections = collections.length === 0 ? [] : collections;

  return (
    <Modal
      visible={recipe !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.46)' }}
      >
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
          {/* Handle */}
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
            <Text
              style={{ fontFamily: 'Fraunces_700Bold', fontSize: 19, color: '#3A2810' }}
            >
              Save to collection
            </Text>
            {recipe && (
              <Text style={{ fontSize: 12, color: '#A68555', marginTop: 3 }}>
                {recipe.name} · {recipe.coneLabel}
              </Text>
            )}
          </View>

          <ScrollView
            style={{ paddingHorizontal: 24 }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {collections.length === 0 && (
              <Text style={{ fontSize: 12, color: '#A68555', marginBottom: 12 }}>
                Optional — create a collection to group this glaze, or save without one.
              </Text>
            )}

            {/* Collection chips */}
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}
            >
              {displayCollections.map((col) => {
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
                    {active && <Check size={11} color="#8B5E1A" />}
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

              {/* New collection toggle */}
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

            {/* Inline new-collection input */}
            {showNewInput && (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
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
            )}
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
