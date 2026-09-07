import { MODAL_SHEET_BORDER, MODAL_SHEET_SURFACE } from '@/src/components/ModalShell';
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

  React.useEffect(() => {
    if (recipe) {
      setSelected([]);
      setNewInput('');
      setShowNewInput(false);
    }
  }, [recipe]);

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
      <View className="flex-1 justify-end bg-black/45">
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: MODAL_SHEET_SURFACE,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderColor: MODAL_SHEET_BORDER,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              backgroundColor: MODAL_SHEET_BORDER,
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
              borderBottomColor: MODAL_SHEET_BORDER,
            }}
          >
            <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
              Save to collection
            </Text>
            {recipe ? (
              <Text className="text-xs text-muted-foreground mt-1">
                {recipe.name} · {recipe.coneLabel}
              </Text>
            ) : null}
          </View>

          <ScrollView
            className="px-6"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {collections.length === 0 ? (
              <Text className="text-xs text-muted-foreground mb-3">
                Optional: create a collection to group this glaze, or save without one.
              </Text>
            ) : null}

            <View className="flex-row flex-wrap gap-2 mb-3.5">
              {displayCollections.map((col) => {
                const active = selected.includes(col);
                return (
                  <TouchableOpacity
                    key={col}
                    onPress={() => toggle(col)}
                    activeOpacity={0.8}
                    className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                      active ? 'border-primary bg-primary/10' : 'border-border bg-card'
                    }`}
                  >
                    {active ? <Check size={11} color="hsl(39 57% 45%)" /> : null}
                    <Text
                      className={`text-sm font-semibold ${
                        active ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {col}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={() => setShowNewInput((v) => !v)}
                activeOpacity={0.8}
                className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-border bg-card"
              >
                <FolderPlus size={11} color="hsl(24 20% 55%)" />
                <Text className="text-sm font-semibold text-muted-foreground">New</Text>
              </TouchableOpacity>
            </View>

            {showNewInput ? (
              <View className="flex-row gap-2 items-center mb-3.5">
                <View className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5">
                  <TextInput
                    value={newInput}
                    onChangeText={setNewInput}
                    placeholder="Collection name…"
                    placeholderTextColor="hsl(24 10% 65%)"
                    className="text-sm text-foreground p-0"
                    autoFocus
                    maxLength={32}
                    returnKeyType="done"
                    onSubmitEditing={addNewCollection}
                  />
                </View>
                <TouchableOpacity
                  onPress={addNewCollection}
                  activeOpacity={0.8}
                  className="px-3.5 py-2.5 rounded-xl bg-primary"
                >
                  <Text className="text-xs font-bold text-white">Add</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>

          <View
            className="px-6 pt-3 border-t border-border"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <TouchableOpacity
              onPress={() => onSave(selected)}
              activeOpacity={0.82}
              className="rounded-2xl bg-primary py-4 items-center"
            >
              <Text className="text-sm font-bold text-white">Save Glaze</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
