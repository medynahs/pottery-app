import { Text } from '@/src/components/ui/text';
import type { GlazeIngredient } from '@/src/screens/glazes/types';
import {
  computeGlazeBatchForPieces,
  GLAZE_COVERAGE_PRESETS,
} from '@/src/screens/glazes/utils/glazeBatchScaler';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

type GlazeBatchScalerCardProps = {
  ingredients: GlazeIngredient[];
  linkedPieceCount?: number;
};

export function GlazeBatchScalerCard({
  ingredients,
  linkedPieceCount = 0,
}: GlazeBatchScalerCardProps) {
  const [pieceCount, setPieceCount] = React.useState(
    linkedPieceCount > 0 ? String(linkedPieceCount) : '6',
  );
  const [presetId, setPresetId] = React.useState('standard');
  const [customGrams, setCustomGrams] = React.useState('');
  const [wastePercent, setWastePercent] = React.useState('10');

  const preset = GLAZE_COVERAGE_PRESETS.find((p) => p.id === presetId) ?? GLAZE_COVERAGE_PRESETS[1];
  const gramsPerPiece = customGrams.trim()
    ? Number.parseFloat(customGrams.replace(',', '.'))
    : preset.gramsPerPiece;
  const parsedPieces = Number.parseInt(pieceCount, 10);
  const parsedWaste = Number.parseFloat(wastePercent.replace(',', '.'));

  const scaled = computeGlazeBatchForPieces({
    pieceCount: Number.isFinite(parsedPieces) && parsedPieces > 0 ? parsedPieces : 1,
    gramsPerPiece: Number.isFinite(gramsPerPiece) && gramsPerPiece > 0 ? gramsPerPiece : preset.gramsPerPiece,
    wastePercent: Number.isFinite(parsedWaste) ? parsedWaste : 10,
    ingredients,
  });

  const base = scaled.rows.filter((r) => !r.isAddition);
  const additions = scaled.rows.filter((r) => r.isAddition);

  return (
    <View className="rounded-2xl border border-border bg-card px-4 py-3 mt-5">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Scale batch for pieces
      </Text>
      <Text className="text-xs text-muted-foreground mb-3 leading-5">
        Estimate total mix from piece count and coverage per piece.
      </Text>

      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Text className="text-[10px] font-semibold text-muted-foreground mb-1.5">Pieces</Text>
          <TextInput
            value={pieceCount}
            onChangeText={setPieceCount}
            keyboardType="number-pad"
            maxLength={4}
            style={{
              borderWidth: 1,
              borderColor: 'hsl(24 15% 88%)',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 15,
              color: 'hsl(24 25% 15%)',
              backgroundColor: 'hsl(40 40% 98%)',
            }}
          />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-semibold text-muted-foreground mb-1.5">Waste %</Text>
          <TextInput
            value={wastePercent}
            onChangeText={setWastePercent}
            keyboardType="decimal-pad"
            maxLength={4}
            style={{
              borderWidth: 1,
              borderColor: 'hsl(24 15% 88%)',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 15,
              color: 'hsl(24 25% 15%)',
              backgroundColor: 'hsl(40 40% 98%)',
            }}
          />
        </View>
      </View>

      <Text className="text-[10px] font-semibold text-muted-foreground mb-2">Coverage per piece</Text>
      <View className="flex-row flex-wrap gap-2 mb-2">
        {GLAZE_COVERAGE_PRESETS.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => {
              setPresetId(option.id);
              setCustomGrams('');
            }}
            activeOpacity={0.78}
            className={`px-3 py-2 rounded-full border ${
              presetId === option.id && !customGrams.trim()
                ? 'bg-primary/10 border-primary/35'
                : 'bg-muted/40 border-border'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                presetId === option.id && !customGrams.trim() ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {option.label} · {option.gramsPerPiece}g
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-[11px] text-muted-foreground mb-2">{preset.hint}</Text>

      <Text className="text-[10px] font-semibold text-muted-foreground mb-1.5">Custom g / piece</Text>
      <TextInput
        value={customGrams}
        onChangeText={setCustomGrams}
        placeholder={`${preset.gramsPerPiece} (preset)`}
        placeholderTextColor="hsl(24 10% 65%)"
        keyboardType="decimal-pad"
        maxLength={6}
        style={{
          borderWidth: 1,
          borderColor: 'hsl(24 15% 88%)',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          color: 'hsl(24 25% 15%)',
          backgroundColor: 'hsl(40 40% 98%)',
          marginBottom: 12,
        }}
      />

      <View className="rounded-xl bg-muted/30 px-3 py-2.5 mb-2">
        <Text className="text-sm font-semibold text-foreground">
          Mix about {scaled.totalBatchG.toLocaleString()}g total
        </Text>
        <Text className="text-[11px] text-muted-foreground mt-0.5">
          {parsedPieces || 1} piece{(parsedPieces || 1) === 1 ? '' : 's'} × {Math.round(gramsPerPiece)}g
          {Number.isFinite(parsedWaste) && parsedWaste > 0 ? ` + ${parsedWaste}% waste` : ''}
        </Text>
      </View>

      {base.map((row) => (
        <View
          key={`${row.material}-${row.percentage}`}
          className="flex-row items-center py-1.5 border-b border-border/60 last:border-b-0"
        >
          <Text className="w-12 text-sm font-semibold text-foreground">{row.percentage}%</Text>
          <Text className="flex-1 text-sm text-foreground">{row.material}</Text>
          <Text className="text-xs text-muted-foreground">{row.grams}g</Text>
        </View>
      ))}

      {additions.length > 0 ? (
        <View className="mt-3">
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">
            Additions
          </Text>
          {additions.map((row) => (
            <View
              key={`add-${row.material}-${row.percentage}`}
              className="flex-row items-center py-1.5 border-b border-border/60 last:border-b-0"
            >
              <Text className="w-12 text-sm font-semibold text-foreground">{row.percentage}%</Text>
              <Text className="flex-1 text-sm text-foreground">{row.material}</Text>
              <Text className="text-xs text-muted-foreground">{row.grams}g</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
