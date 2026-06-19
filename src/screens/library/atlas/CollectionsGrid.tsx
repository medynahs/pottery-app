import { ModalCard, ModalShell } from '@/src/components/AppSheets';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { FolderPlus } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { sanitizeCustomCollections } from './collections';
import { CollectionCard } from './CollectionCard';
import { CARD_TINTS } from './constants';
import { getGlazeColor } from './helpers';

export function NewCollectionCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        flex: 1,
        borderRadius: 18,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#D9C9A8',
        backgroundColor: '#FFFBF4',
        minHeight: 132,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <FolderPlus size={20} color="#A68555" />
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#A68555' }}>New collection</Text>
    </TouchableOpacity>
  );
}

export function CreateCollectionModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (visible) setName('');
  }, [visible]);

  const canSave = sanitizeCustomCollections([name]).length > 0;

  return (
    <ModalShell visible={visible} onClose={onClose} backdropColor="rgba(0,0,0,0.46)">
      <ModalCard radius={28} maxHeight={320}>
        <View className="px-6 pb-4 border-b border-border">
          <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            New collection
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Group glazes by cone, color story, or production line.
          </Text>
        </View>
        <View className="px-6 py-5">
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Cone 6 blues, Dinnerware…"
            autoFocus
            maxLength={32}
          />
        </View>
        <View className="px-6 pb-6 flex-row gap-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 rounded-2xl border border-border py-3.5 items-center"
          >
            <Text className="text-sm font-semibold text-muted-foreground">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const clean = sanitizeCustomCollections([name])[0];
              if (!clean) return;
              onCreate(clean);
              onClose();
            }}
            disabled={!canSave}
            className={`flex-1 rounded-2xl bg-primary py-3.5 items-center ${canSave ? '' : 'opacity-45'}`}
          >
            <Text className="text-sm font-semibold text-white">Create</Text>
          </TouchableOpacity>
        </View>
      </ModalCard>
    </ModalShell>
  );
}

export function CollectionsGrid({
  collectionRows,
  glazesByCollection,
  onPressCollection,
  onCreateCollection,
}: {
  collectionRows: string[][];
  glazesByCollection: Record<string, { length: number; colors: string[] }>;
  onPressCollection: (name: string) => void;
  onCreateCollection: () => void;
}) {
  return (
    <>
      <View className="mx-6 mb-3 flex-row items-center justify-between">
        <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
          Collections
        </Text>
      </View>

      <View className="px-6 gap-2.5">
        {collectionRows.map((row, rowIdx) => (
          <View key={rowIdx} className="flex-row gap-2.5">
            {row.map((collectionName, colIdx) => {
              const meta = glazesByCollection[collectionName] ?? { length: 0, colors: [] };
              const tint = CARD_TINTS[(rowIdx * 2 + colIdx) % CARD_TINTS.length];
              return (
                <View key={collectionName} style={{ flex: 1 }}>
                  <CollectionCard
                    name={collectionName}
                    glazeColors={meta.colors}
                    count={meta.length}
                    tint={tint}
                    onPress={() => onPressCollection(collectionName)}
                  />
                </View>
              );
            })}
            {row.length === 1 ? <View className="flex-1" /> : null}
          </View>
        ))}

        <View className="flex-row gap-2.5">
          <NewCollectionCard onPress={onCreateCollection} />
          <View className="flex-1" />
        </View>
      </View>
    </>
  );
}
