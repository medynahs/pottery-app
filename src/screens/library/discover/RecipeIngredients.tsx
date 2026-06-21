import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import type { RecipeIngredient } from './types';

function IngredientRow({
  ingredient,
  maxPct,
}: {
  ingredient: RecipeIngredient;
  maxPct: number;
}) {
  const barPct = Math.min((ingredient.percentage / maxPct) * 100, 100);
  return (
    <View className="flex-row items-center mb-2">
      <Text
        className={`w-[130px] text-[11px] ${ingredient.isAddition ? 'text-primary' : 'text-foreground'}`}
        numberOfLines={1}
      >
        {ingredient.material}
      </Text>
      <View className="flex-1 h-1.5 bg-muted rounded-full mx-2 overflow-hidden">
        <View
          className={`h-1.5 rounded-full ${ingredient.isAddition ? 'bg-primary' : 'bg-primary/60'}`}
          style={{ width: `${barPct}%` }}
        />
      </View>
      <Text className="w-9 text-[11px] text-muted-foreground text-right">
        {ingredient.percentage}%
      </Text>
    </View>
  );
}

export function RecipeIngredients({
  ingredients,
  estimatedCostPer100g,
}: {
  ingredients: RecipeIngredient[];
  estimatedCostPer100g: number;
}) {
  const baseIngredients = ingredients.filter((i) => !i.isAddition);
  const additions = ingredients.filter((i) => i.isAddition);
  const maxBasePct = Math.max(...baseIngredients.map((i) => i.percentage), 1);
  const maxAdditionPct = Math.max(...additions.map((i) => i.percentage), 1);

  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Recipe
        </Text>
        <View className="px-2.5 py-1 rounded-lg bg-muted">
          <Text className="text-[11px] font-semibold text-primary">
            ~${estimatedCostPer100g.toFixed(2)} / 100 g
          </Text>
        </View>
      </View>

      {baseIngredients.map((ing, idx) => (
        <IngredientRow key={`base-${idx}`} ingredient={ing} maxPct={maxBasePct} />
      ))}

      {additions.length > 0 ? (
        <>
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-primary mt-3 mb-2">
            Additions
          </Text>
          {additions.map((ing, idx) => (
            <IngredientRow key={`add-${idx}`} ingredient={ing} maxPct={maxAdditionPct} />
          ))}
        </>
      ) : null}

      <Text className="text-[10px] text-muted-foreground mt-3 leading-4">
        Approximate batch cost. Verify with your supplier.
      </Text>
    </View>
  );
}
