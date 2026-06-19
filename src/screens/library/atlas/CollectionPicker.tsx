import { Text } from '@/src/components/ui/text';
import { Check, FolderPlus } from 'lucide-react-native';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { FAVORITES_COLLECTION, MY_GLAZES_COLLECTION, sanitizeCustomCollections } from './collections';

export function CollectionPicker({
  availableCollections,
  selected,
  onChange,
  onCreateCollection,
  hideHeader = false,
  hideFooterTip = false,
}: {
  availableCollections: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  onCreateCollection: (name: string) => void;
  /** When true, omit title and intro — use with FormField. */
  hideHeader?: boolean;
  hideFooterTip?: boolean;
}) {
  const [newInput, setNewInput] = React.useState('');
  const [showNewInput, setShowNewInput] = React.useState(false);

  const displayCollections = React.useMemo(() => {
    const custom = sanitizeCustomCollections(availableCollections);
    const merged = [...new Set([...custom, ...sanitizeCustomCollections(selected)])];
    return merged.sort((a, b) => a.localeCompare(b));
  }, [availableCollections, selected]);

  function toggle(name: string) {
    onChange(
      selected.includes(name) ? selected.filter((c) => c !== name) : [...selected, name],
    );
  }

  function addNewCollection() {
    const name = sanitizeCustomCollections([newInput])[0];
    if (!name) return;
    onCreateCollection(name);
    if (!selected.includes(name)) {
      onChange([...selected, name]);
    }
    setNewInput('');
    setShowNewInput(false);
  }

  return (
    <View>
      {!hideHeader ? (
        <>
          <Text className="text-sm font-semibold text-foreground mb-2">Collections</Text>
          <Text className="text-xs text-muted-foreground mb-3 leading-5">
            Every glaze lives in {MY_GLAZES_COLLECTION}. Add custom collections to group your studio.
          </Text>
        </>
      ) : null}

      <View className="flex-row flex-wrap gap-2">
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
              {active ? <Check size={11} color="hsl(24 20% 35%)" /> : null}
              <Text className={`text-xs font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
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
          <FolderPlus size={11} color="hsl(24 20% 40%)" />
          <Text className="text-xs font-semibold text-muted-foreground">New</Text>
        </TouchableOpacity>
      </View>

      {showNewInput ? (
        <View className="flex-row gap-2 items-center mt-3">
          <TextInput
            value={newInput}
            onChangeText={setNewInput}
            placeholder="Collection name…"
            placeholderTextColor="hsl(24 20% 65%)"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
            autoFocus
            maxLength={32}
            returnKeyType="done"
            onSubmitEditing={addNewCollection}
          />
          <TouchableOpacity
            onPress={addNewCollection}
            activeOpacity={0.82}
            className="px-4 py-2.5 rounded-xl bg-primary"
          >
            <Text className="text-xs font-semibold text-white">Add</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!hideFooterTip ? (
        <Text className="text-[11px] text-muted-foreground mt-3">
          Tip: star a glaze on its detail page to add it to {FAVORITES_COLLECTION}.
        </Text>
      ) : null}
    </View>
  );
}
