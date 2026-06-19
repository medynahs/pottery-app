import { Text } from '@/src/components/ui/text';
import { GLAZE_FINISH_LABELS } from '@/src/screens/glazes/types';
import type { GlazeFinish } from '@/src/screens/glazes/types';
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { GlazePhotoTile } from '../GlazePhotoTile';
import type { DiscoverRecipe } from './types';

function DiscoverTile({
  recipe,
  width,
  matchesCone,
  saved,
  onPress,
}: {
  recipe: DiscoverRecipe;
  width: number;
  matchesCone: boolean;
  saved: boolean;
  onPress: () => void;
}) {
  const finishLabel =
    GLAZE_FINISH_LABELS[recipe.finish as GlazeFinish] ?? recipe.finish;

  return (
    <GlazePhotoTile
      width={width}
      name={recipe.name}
      coneLabel={recipe.coneLabel}
      finishLabel={finishLabel}
      previewUri={recipe.previewUri}
      colorHex={recipe.colorHex}
      matchesCone={matchesCone}
      cornerBadge={saved ? { label: 'Saved', tone: 'success' } : undefined}
      onPress={onPress}
    />
  );
}

export function DiscoverGrid({
  recipes,
  userConeNorm,
  savedRecipeIds,
  onPressRecipe,
}: {
  recipes: DiscoverRecipe[];
  userConeNorm: string | null;
  savedRecipeIds?: Set<string>;
  onPressRecipe: (recipe: DiscoverRecipe) => void;
}) {
  const { width } = useWindowDimensions();
  const gap = 10;
  const horizontalPad = 24;
  const tileWidth = (width - horizontalPad * 2 - gap) / 2;

  const leftColumn = recipes.filter((_, i) => i % 2 === 0);
  const rightColumn = recipes.filter((_, i) => i % 2 === 1);

  return (
    <View className="px-6 flex-row" style={{ gap }}>
      <View style={{ width: tileWidth }}>
        {leftColumn.map((recipe) => (
          <DiscoverTile
            key={recipe.id}
            recipe={recipe}
            width={tileWidth}
            matchesCone={userConeNorm !== null && recipe.cone === userConeNorm}
            saved={savedRecipeIds?.has(recipe.id) ?? false}
            onPress={() => onPressRecipe(recipe)}
          />
        ))}
      </View>
      <View style={{ width: tileWidth }}>
        {rightColumn.map((recipe) => (
          <DiscoverTile
            key={recipe.id}
            recipe={recipe}
            width={tileWidth}
            matchesCone={userConeNorm !== null && recipe.cone === userConeNorm}
            saved={savedRecipeIds?.has(recipe.id) ?? false}
            onPress={() => onPressRecipe(recipe)}
          />
        ))}
      </View>
    </View>
  );
}
