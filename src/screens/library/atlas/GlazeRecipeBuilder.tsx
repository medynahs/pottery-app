import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import type { GlazeIngredient } from '@/src/screens/glazes/types';
import { Check, Copy, Plus, Trash2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Pill } from './Pill';

const QUICK_MATERIALS = [
  'Feldspar',
  'Kaolin',
  'Silica',
  'Whiting',
  'Dolomite',
  'Ball clay',
  'Bone ash',
  'Zinc oxide',
  'Copper carb.',
  'Iron oxide',
  'Cobalt carb.',
];

function newIngredientRow(isAddition = false): GlazeIngredient {
  return {
    id: `ing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    material: '',
    percentage: '',
    isAddition,
  };
}

function parsePercent(value: string): number {
  const parsed = Number.parseFloat(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function sumPercent(rows: GlazeIngredient[]): number {
  return rows.reduce((sum, row) => sum + parsePercent(row.percentage), 0);
}

function formatGrams(batchG: number, pct: number): string {
  if (!batchG || !pct) return '—';
  const grams = (batchG * pct) / 100;
  if (grams >= 100) return `${Math.round(grams)}g`;
  if (grams >= 10) return `${grams.toFixed(1)}g`;
  return `${grams.toFixed(2)}g`;
}

export function hasValidRecipeIngredients(ingredients: GlazeIngredient[]): boolean {
  return ingredients.some(
    (row) => row.material.trim().length > 0 && row.percentage.trim().length > 0,
  );
}

type GlazeRecipeBuilderProps = {
  ingredients: GlazeIngredient[];
  onChange: (next: GlazeIngredient[]) => void;
  batchSizeG?: string;
  onBatchSizeChange?: (value: string) => void;
};

export function GlazeRecipeBuilder({
  ingredients,
  onChange,
  batchSizeG = '',
  onBatchSizeChange,
}: GlazeRecipeBuilderProps) {
  const baseRows = ingredients.filter((row) => !row.isAddition);
  const additionRows = ingredients.filter((row) => row.isAddition);
  const baseTotal = Math.round(sumPercent(baseRows) * 10) / 10;
  const additionTotal = Math.round(sumPercent(additionRows) * 10) / 10;
  const batchG = parsePercent(batchSizeG);
  const showGrams = batchG > 0;
  const baseBalanced = baseRows.length > 0 && Math.abs(baseTotal - 100) < 0.5;

  const updateRow = (id: string, patch: Partial<GlazeIngredient>) => {
    onChange(ingredients.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    onChange(ingredients.filter((row) => row.id !== id));
  };

  const duplicateRow = (row: GlazeIngredient) => {
    onChange([
      ...ingredients,
      {
        ...row,
        id: newIngredientRow(row.isAddition).id,
        material: row.material,
        percentage: '',
      },
    ]);
  };

  const addRow = (isAddition = false) => {
    onChange([...ingredients, newIngredientRow(isAddition)]);
  };

  const quickAdd = (material: string, isAddition = false) => {
    onChange([
      ...ingredients,
      { ...newIngredientRow(isAddition), material },
    ]);
  };

  const renderRow = (row: GlazeIngredient, index: number) => {
    const pct = parsePercent(row.percentage);
    return (
      <View
        key={row.id}
        className={`rounded-xl border px-2.5 py-2 ${
          row.isAddition ? 'border-primary/25 bg-primary/5' : 'border-border bg-background'
        }`}
      >
        <View className="flex-row items-center gap-2">
          <View className="w-[64px]">
            <Input
              value={row.percentage}
              onChangeText={(v) =>
                updateRow(row.id, { percentage: v.replace(/[^\d.,]/g, '') })
              }
              placeholder="0"
              keyboardType="decimal-pad"
              className="text-center native:h-10 h-9 text-sm"
            />
          </View>
          <Text className="text-[11px] text-muted-foreground w-3">%</Text>
          <View className="flex-1">
            <Input
              value={row.material}
              onChangeText={(v) => updateRow(row.id, { material: v })}
              placeholder={index === 0 ? 'Feldspar' : 'Material'}
              className="native:h-10 h-9 text-sm"
            />
          </View>
          {showGrams ? (
            <Text className="w-12 text-[11px] font-medium text-muted-foreground text-right">
              {formatGrams(batchG, pct)}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={() => duplicateRow(row)}
            hitSlop={6}
            className="w-8 h-8 rounded-lg items-center justify-center bg-muted"
          >
            <Copy size={13} color="hsl(24 20% 55%)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeRow(row.id)}
            hitSlop={6}
            className="w-8 h-8 rounded-lg items-center justify-center bg-muted"
          >
            <Trash2 size={13} color="hsl(24 20% 55%)" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => updateRow(row.id, { isAddition: !row.isAddition })}
          hitSlop={8}
          className="mt-1.5 self-start"
        >
          <Text className="text-[10px] font-medium text-muted-foreground">
            {row.isAddition ? 'Listed as addition · tap for base' : 'Base material · tap for addition'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="rounded-2xl border border-border bg-card overflow-hidden">
      <View className="px-4 py-3 border-b border-border bg-muted/30 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recipe
          </Text>
          {baseBalanced ? (
            <View className="flex-row items-center gap-1">
              <Check size={12} color="hsl(142 45% 38%)" />
              <Text className="text-[11px] font-semibold text-green-700">Base at 100%</Text>
            </View>
          ) : baseTotal > 0 ? (
            <Text className="text-[11px] font-medium text-muted-foreground">
              Base {baseTotal}%
              {additionTotal > 0 ? ` · +${additionTotal}% additions` : ''}
            </Text>
          ) : null}
        </View>

        {onBatchSizeChange ? (
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-muted-foreground shrink-0">Batch</Text>
            <View className="w-24">
              <Input
                value={batchSizeG}
                onChangeText={(v) => onBatchSizeChange(v.replace(/[^\d]/g, ''))}
                placeholder="1000"
                keyboardType="number-pad"
                className="native:h-9 h-9 text-sm text-center"
              />
            </View>
            <Text className="text-xs text-muted-foreground">g — shows weights per row</Text>
          </View>
        ) : null}

        {baseTotal > 0 ? (
          <View className="h-1.5 rounded-full bg-muted overflow-hidden">
            <View
              className={`h-1.5 rounded-full ${baseBalanced ? 'bg-green-600' : 'bg-primary/70'}`}
              style={{ width: `${Math.min(baseTotal, 100)}%` }}
            />
          </View>
        ) : null}
      </View>

      {showGrams && ingredients.length > 0 ? (
        <View className="flex-row items-center px-4 py-2 border-b border-border/60">
          <Text className="w-[76px] text-[10px] font-semibold uppercase text-muted-foreground">%</Text>
          <Text className="flex-1 text-[10px] font-semibold uppercase text-muted-foreground">Material</Text>
          <Text className="w-12 text-[10px] font-semibold uppercase text-muted-foreground text-right">Weight</Text>
          <View className="w-[72px]" />
        </View>
      ) : null}

      {ingredients.length === 0 ? (
        <View className="px-4 py-4">
          <Text className="text-sm text-muted-foreground leading-5">
            Add each material and its percentage. Colorants can be marked as additions — they sit on top of your base 100%.
          </Text>
        </View>
      ) : (
        <View className="px-3 py-3 gap-2">
          {baseRows.length > 0 ? (
            <>
              {baseRows.length > 0 && additionRows.length > 0 ? (
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  Base
                </Text>
              ) : null}
              {baseRows.map((row, index) => renderRow(row, index))}
            </>
          ) : null}
          {additionRows.length > 0 ? (
            <>
              <Text className="text-[10px] font-semibold uppercase tracking-wider text-primary px-1 mt-1">
                Additions
              </Text>
              {additionRows.map((row, index) => renderRow(row, index))}
            </>
          ) : null}
        </View>
      )}

      <View className="px-4 pb-3">
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Quick add
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-2">
            {QUICK_MATERIALS.map((material) => (
              <Pill
                key={material}
                label={material}
                active={false}
                onPress={() => quickAdd(material)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="flex-row border-t border-border">
        <TouchableOpacity
          onPress={() => addRow(false)}
          activeOpacity={0.85}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3.5 bg-muted/20"
        >
          <Plus size={15} color="hsl(24 45% 45%)" />
          <Text className="text-sm font-semibold text-primary">Base material</Text>
        </TouchableOpacity>
        <View className="w-px bg-border" />
        <TouchableOpacity
          onPress={() => addRow(true)}
          activeOpacity={0.85}
          className="flex-1 flex-row items-center justify-center gap-1.5 py-3.5 bg-muted/20"
        >
          <Plus size={15} color="hsl(24 45% 45%)" />
          <Text className="text-sm font-semibold text-primary">Addition</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
