import { GLAZE_FINISH_LABELS } from '@/src/screens/glazes/types';
import type { GlazeFinish } from '@/src/screens/glazes/types';
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { GlazePhotoTile } from '../GlazePhotoTile';
import type { DiscoverItem } from './types';

function DiscoverTile({
  item,
  width,
  saved,
  onPress,
}: {
  item: DiscoverItem;
  width: number;
  saved: boolean;
  onPress: () => void;
}) {
  if (item.kind === 'inspiration') {
    const { inspiration } = item;
    return (
      <GlazePhotoTile
        width={width}
        name={inspiration.title}
        coneLabel={inspiration.coneLabel}
        finishLabel="Layering idea"
        previewUri={inspiration.previewUri}
        colorHex={inspiration.colorHex}
        cornerBadge={undefined}
        onPress={onPress}
      />
    );
  }

  const { recipe } = item;
  const finishLabel = GLAZE_FINISH_LABELS[recipe.finish as GlazeFinish] ?? recipe.finish;

  return (
    <GlazePhotoTile
      width={width}
      name={recipe.name}
      coneLabel={recipe.coneLabel}
      finishLabel={finishLabel}
      previewUri={recipe.previewUri}
      colorHex={recipe.colorHex}
      cornerBadge={saved ? { label: 'Saved', tone: 'success' } : undefined}
      onPress={onPress}
    />
  );
}

export function DiscoverGrid({
  items,
  savedRecipeIds,
  onPressItem,
}: {
  items: DiscoverItem[];
  savedRecipeIds?: Set<string>;
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
