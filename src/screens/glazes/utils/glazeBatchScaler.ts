import type { GlazeIngredient } from '@/src/screens/glazes/types';

export type GlazeCoveragePreset = {
  id: string;
  label: string;
  gramsPerPiece: number;
  hint: string;
};

export const GLAZE_COVERAGE_PRESETS: GlazeCoveragePreset[] = [
  { id: 'light', label: 'Light dip', gramsPerPiece: 15, hint: 'Thin liner or small test tile' },
  { id: 'standard', label: 'Standard mug', gramsPerPiece: 25, hint: 'Typical dipped mug or small bowl' },
  { id: 'heavy', label: 'Heavy coat', gramsPerPiece: 40, hint: 'Thick application or large piece' },
  { id: 'plate', label: 'Plate / platter', gramsPerPiece: 55, hint: 'Wide surface area' },
];

export type ScaledIngredientRow = {
  material: string;
  percentage: number;
  grams: number;
  isAddition?: boolean;
};

export function computeGlazeBatchForPieces(input: {
  pieceCount: number;
  gramsPerPiece: number;
  wastePercent?: number;
  ingredients: GlazeIngredient[];
}): { totalBatchG: number; rows: ScaledIngredientRow[] } {
  const count = Math.max(1, Math.floor(input.pieceCount));
  const perPiece = Math.max(1, input.gramsPerPiece);
  const waste = Math.max(0, input.wastePercent ?? 10);
  const subtotal = count * perPiece;
  const totalBatchG = Math.round(subtotal * (1 + waste / 100));

  const valid = input.ingredients.filter(
    (row) => row.material.trim() && row.percentage.trim(),
  );

  const rows: ScaledIngredientRow[] = valid.map((row) => {
    const percentage = Number.parseFloat(row.percentage.replace(',', '.'));
    const grams = Number.isFinite(percentage)
      ? Math.round((totalBatchG * percentage) / 100)
      : 0;
    return {
      material: row.material.trim(),
      percentage: Number.isFinite(percentage) ? percentage : 0,
      grams,
      isAddition: row.isAddition,
    };
  });

  return { totalBatchG, rows };
}
