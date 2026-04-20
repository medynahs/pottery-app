import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { FolderPlus } from 'lucide-react-native';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { CollectionCard } from './CollectionCard';
import { CARD_TINTS } from './constants';
import { getGlazeColor } from './helpers';

export function CollectionsGrid({
  allCollectionKeys,
  collectionRows,
  glazesByCollection,
  showAddFolder,
  setShowAddFolder,
  newFolder,
  setNewFolder,
  onAddFolder,
  onPressCollection,
}: {
  allCollectionKeys: string[];
  collectionRows: string[][];
  glazesByCollection: Record<string, GlazeLibraryItem[]>;
  showAddFolder: boolean;
  setShowAddFolder: (v: boolean | ((prev: boolean) => boolean)) => void;
  newFolder: string;
  setNewFolder: (v: string) => void;
  onAddFolder: () => void;
  onPressCollection: (name: string) => void;
}) {
  return (
    <>
      {/* Collections header */}
      <View
        style={{
          marginHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#3A2810' }}>
          Collections
        </Text>
        <TouchableOpacity
          onPress={() => setShowAddFolder((v) => !v)}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E8D9BE',
            backgroundColor: '#FFFBF4',
          }}
        >
          <FolderPlus size={13} color="#A68555" />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#A68555' }}>New</Text>
        </TouchableOpacity>
      </View>

      {/* New folder input */}
      {showAddFolder && (
        <View
          style={{
            marginHorizontal: 24,
            marginBottom: 14,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#E8D9BE',
              backgroundColor: '#FFFBF4',
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <TextInput
              value={newFolder}
              onChangeText={setNewFolder}
              placeholder="Collection name…"
              placeholderTextColor="#C4B48C"
              style={{ fontSize: 13, color: '#3A2810', padding: 0 }}
              maxLength={32}
              returnKeyType="done"
              onSubmitEditing={onAddFolder}
              autoFocus
            />
          </View>
          <TouchableOpacity
            onPress={onAddFolder}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: '#C9963A',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>Create</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Grid or empty state */}
      {allCollectionKeys.length === 0 ? (
        <View
          style={{
            marginHorizontal: 24,
            borderRadius: 20,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: '#E8D9BE',
            padding: 28,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 30, marginBottom: 8 }}>🏺</Text>
          <Text
            style={{
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 14,
              color: '#3A2810',
              marginBottom: 4,
            }}
          >
            No collections yet
          </Text>
          <Text
            style={{ fontSize: 12, color: '#A68555', textAlign: 'center', lineHeight: 18 }}
          >
            Add your first glaze and it will appear here as a collection.
          </Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 24, gap: 10 }}>
          {collectionRows.map((row, rowIdx) => (
            <View key={rowIdx} style={{ flexDirection: 'row', gap: 10 }}>
              {row.map((collectionName, colIdx) => {
                const collGlazes = glazesByCollection[collectionName] ?? [];
                const colors = collGlazes
                  .map((g) => getGlazeColor(g.colorFamily))
                  .filter((c, i, arr) => arr.indexOf(c) === i);
                const tint = CARD_TINTS[(rowIdx * 2 + colIdx) % CARD_TINTS.length];
                return (
                  <CollectionCard
                    key={collectionName}
                    name={collectionName}
                    glazeColors={colors}
                    count={collGlazes.length}
                    tint={tint}
                    onPress={() => onPressCollection(collectionName)}
                  />
                );
              })}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      )}
    </>
  );
}
