import { GLAZE_FINISH_LABELS } from '@/src/screens/glazes/types';
import type { GlazeFinish } from '@/src/screens/glazes/types';
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { GlazePhotoTile } from '../GlazePhotoTile';
import { inspirationProductLabel } from './products';
import type { DiscoverItem } from './types';

function DiscoverTile({
  item,
  width,
  saved,
  usesOwnedGlaze,
  onPress,
}: {
  item: DiscoverItem;
  width: number;
  saved: boolean;
  usesOwnedGlaze: boolean;
  onPress: () => void;
}) {
  if (item.kind === 'inspiration') {
    const { inspiration } = item;
    return (
      <GlazePhotoTile
        width={width}
        name={inspiration.title}
        coneLabel={inspiration.coneLabel}
        finishLabel={inspirationProductLabel(inspiration)}
        previewUri={inspiration.previewUri}
        colorHex={inspiration.colorHex}
        cornerBadge={
          usesOwnedGlaze ? { label: 'You have this', tone: 'success' } : { label: 'Combo', tone: 'accent' }
        }
        onPress={onPress}
      />
    );
  }

  const { recipe } = item;
  const finishLabel = GLAZE_FINISH_LABELS[recipe.finish as GlazeFinish] ?? recipe.finish;
  const devBadge = recipe.devSourceGlazeId ? { label: 'Dev', tone: 'accent' as const } : undefined;

  return (
    <GlazePhotoTile
      width={width}
      name={recipe.name}
      coneLabel={recipe.coneLabel}
      finishLabel={finishLabel}
      previewUri={recipe.previewUri}
      colorHex={recipe.colorHex}
      cornerBadge={
        devBadge ?? (saved ? { label: 'Saved', tone: 'success' } : undefined)
      }
      onPress={onPress}
    />
  );
}

export function DiscoverGrid({
  items,
  savedRecipeIds,
  ownedGlazeIds,
  onPressItem,
}: {
  items: DiscoverItem[];
  savedRecipeIds?: Set<string>;
  ownedGlazeIds?: Set<string>;
  onPressItem: (item: DiscoverItem) => void;
}) {
  const { width } = useWindowDimensions();
  const gap = 10;
  const horizontalPad = 24;
  const tileWidth = (width - horizontalPad * 2 - gap) / 2;

  const leftColumn = items.filter((_, i) => i % 2 === 0);
  const rightColumn = items.filter((_, i) => i % 2 === 1);

  return (
    <View className="px-6 flex-row" style={{ gap }}>
      <View style={{ width: tileWidth }}>
        {leftColumn.map((item) => (
          <DiscoverTile
            key={itemId(item)}
            item={item}
            width={tileWidth}
            saved={item.kind === 'recipe' ? savedRecipeIds?.has(item.recipe.id) ?? false : false}
            usesOwnedGlaze={
              item.kind === 'inspiration' ? ownedGlazeIds?.has(item.inspiration.id) ?? false : false
            }
            onPress={() => onPressItem(item)}
          />
        ))}
      </View>
      <View style={{ width: tileWidth }}>
        {rightColumn.map((item) => (
          <DiscoverTile
            key={itemId(item)}
            item={item}
            width={tileWidth}
            saved={item.kind === 'recipe' ? savedRecipeIds?.has(item.recipe.id) ?? false : false}
            usesOwnedGlaze={
              item.kind === 'inspiration' ? ownedGlazeIds?.has(item.inspiration.id) ?? false : false
            }
            onPress={() => onPressItem(item)}
          />
        ))}
      </View>
    </View>
  );
}

function itemId(item: DiscoverItem): string {
  return item.kind === 'recipe' ? item.recipe.id : item.inspiration.id;
}
