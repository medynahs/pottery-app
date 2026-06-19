import { Text } from '@/src/components/ui/text';
import type { GlazeIngredient } from '@/src/screens/glazes/types';
import React from 'react';
import { View } from 'react-native';

function validRows(ingredients: GlazeIngredient[]) {
  return ingredients.filter(
    (row) => row.material.trim().length > 0 && row.percentage.trim().length > 0,
  );
}

function RecipeSection({
  title,
  rows,
  batchSizeG,
  tone = 'default',
}: {
  title?: string;
  rows: GlazeIngredient[];
  batchSizeG?: number;
  tone?: 'default' | 'addition';
}) {
  if (rows.length === 0) return null;

  return (
    <>
      {title ? (
        <Text
          className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${
            tone === 'addition' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {title}
        </Text>
      ) : null}
      {rows.map((row) => {
        const pct = Number.parseFloat(row.percentage.replace(',', '.'));
        const grams =
          batchSizeG && Number.isFinite(pct)
            ? Math.round((batchSizeG * pct) / 100)
            : null;
        return (
          <View
            key={row.id}
            className="flex-row items-center py-1.5 border-b border-border/60 last:border-b-0"
          >
            <Text className="w-12 text-sm font-semibold text-foreground">{row.percentage}%</Text>
            <Text className="flex-1 text-sm text-foreground">{row.material}</Text>
            {grams != null ? (
              <Text className="text-xs text-muted-foreground">{grams}g</Text>
            ) : null}
          </View>
        );
      })}
    </>
  );
}

/** Read-only recipe list for glaze detail screens. */
export function GlazeRecipeSummary({
  ingredients,
  batchSizeG,
}: {
  ingredients: GlazeIngredient[];
  batchSizeG?: string;
}) {
  const rows = validRows(ingredients);
  if (rows.length === 0) return null;

  const base = rows.filter((row) => !row.isAddition);
  const additions = rows.filter((row) => row.isAddition);
  const batchG = batchSizeG ? Number.parseFloat(batchSizeG) : NaN;
  const parsedBatch = Number.isFinite(batchG) && batchG > 0 ? batchG : undefined;

  return (
    <View className="rounded-2xl border border-border bg-card px-4 py-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Recipe
        </Text>
        {parsedBatch ? (
          <Text className="text-[11px] text-muted-foreground">{parsedBatch}g batch</Text>
        ) : null}
      </View>
      <RecipeSection rows={base.length > 0 && additions.length > 0 ? base : rows} batchSizeG={parsedBatch} />
      {additions.length > 0 ? (
        <View className="mt-3">
          <RecipeSection title="Additions" rows={additions} batchSizeG={parsedBatch} tone="addition" />
        </View>
      ) : null}
    </View>
  );
}
