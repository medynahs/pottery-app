import { Text } from '@/src/components/ui/text';
import { GLAZE_FINISH_LABELS } from '@/src/screens/glazes/types';
import type { GlazeFinish } from '@/src/screens/glazes/types';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { DiscoverRecipe } from './types';

function DiscoverTile({
  recipe,
  width,
  matchesCone,
}: {
  recipe: DiscoverRecipe;
  width: number;
  matchesCone: boolean;
}) {
  const router = useRouter();
  const finishLabel =
    GLAZE_FINISH_LABELS[recipe.finish as GlazeFinish] ?? recipe.finish;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/discover-recipe?id=${encodeURIComponent(recipe.id)}` as never)}
      style={{ width }}
      className="mb-3 rounded-2xl overflow-hidden border border-border bg-card"
    >
      <View style={{ width, height: width * 1.25 }} className="relative bg-muted">
        {recipe.previewUri ? (
          <Image
            source={{ uri: recipe.previewUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: recipe.colorHex }} />
        )}

        <View className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/55">
          <Text className="text-[10px] font-bold text-white">{recipe.coneLabel}</Text>
        </View>

        {matchesCone ? (
          <View className="absolute top-2 right-2 px-2 py-1 rounded-full bg-green-600/90">
            <Text className="text-[9px] font-bold text-white">Your cone</Text>
          </View>
        ) : null}

        <View
          className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-8"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <Text className="text-sm text-white font-semibold" numberOfLines={2} style={{ fontFamily: 'Fraunces_600SemiBold' }}>
            {recipe.name}
          </Text>
          <Text className="text-[10px] text-white/80 mt-0.5">{finishLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function DiscoverGrid({
  recipes,
  userConeNorm,
}: {
  recipes: DiscoverRecipe[];
  userConeNorm: string | null;
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
          />
        ))}
      </View>
    </View>
  );
}
