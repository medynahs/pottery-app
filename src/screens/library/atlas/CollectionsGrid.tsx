import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import React from 'react';
import { View } from 'react-native';
import { CollectionCard } from './CollectionCard';
import { CARD_TINTS } from './constants';
import { getGlazeColor } from './helpers';

export function CollectionsGrid({
  allCollectionKeys,
  collectionRows,
  glazesByCollection,
  onPressCollection,
}: {
  allCollectionKeys: string[];
  collectionRows: string[][];
  glazesByCollection: Record<string, GlazeLibraryItem[]>;
  onPressCollection: (name: string) => void;
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
            {row.length === 1 ? <View className="flex-1" /> : null}
          </View>
        ))}
      </View>
    </>
  );
}
