export type ConeFilter = 'all' | 'cone-06' | 'cone-6' | 'cone-10';
export type FinishFilter = 'all' | 'glossy' | 'matte' | 'satin' | 'crystalline';
export type ColorFilter = 'all' | 'blue' | 'green' | 'amber' | 'red' | 'white' | 'black';

export interface RecipeIngredient {
  material: string;
  /** Percentage of batch weight (base ingredients sum ~100; additions listed over 100) */
  percentage: number;
  /** True for colorant / opacifier additions that sit on top of the base 100 */
  isAddition?: boolean;
}

export interface DiscoverRecipe {
  id: string;
  name: string;
  author: string;
  colorFamily: string;
  finish: string;
  cone: string;
  coneLabel: string;
  colorHex: string;
  description: string;
  ingredients: RecipeIngredient[];
  /** Pre-computed USD cost for a 100 g test batch */
  estimatedCostPer100g: number;
  previewUri?: string;
}

/** Photo + notes layering idea — no formula, not saved to atlas. */
export interface DiscoverInspiration {
  id: string;
  title: string;
  description: string;
  applicationNotes: string;
  cone: string;
  coneLabel: string;
  colorHex: string;
  colorFamily?: string;
  previewUri?: string;
}

export type DiscoverItem =
  | { kind: 'recipe'; recipe: DiscoverRecipe }
  | { kind: 'inspiration'; inspiration: DiscoverInspiration };

export const CONE_OPTIONS: { key: ConeFilter; label: string }[] = [
  { key: 'all', label: 'All Cones' },
  { key: 'cone-06', label: 'Low Fire (06)' },
  { key: 'cone-6', label: 'Mid Fire (6)' },
  { key: 'cone-10', label: 'High Fire (10)' },
];

export const FINISH_OPTIONS: { key: FinishFilter; label: string }[] = [
  { key: 'all', label: 'All Finishes' },
  { key: 'glossy', label: 'Glossy' },
  { key: 'matte', label: 'Matte' },
  { key: 'satin', label: 'Satin' },
  { key: 'crystalline', label: 'Crystalline' },
];

export const COLOR_OPTIONS: { key: ColorFilter; label: string; hex: string }[] = [
  { key: 'all', label: 'Any', hex: '#E8D9BE' },
  { key: 'blue', label: 'Blue', hex: '#7BA7CC' },
  { key: 'green', label: 'Green', hex: '#7BAF7B' },
  { key: 'amber', label: 'Amber', hex: '#D4B88C' },
  { key: 'red', label: 'Red', hex: '#C45C5C' },
  { key: 'white', label: 'White', hex: '#EFEBE0' },
  { key: 'black', label: 'Black', hex: '#3A2810' },
];

export const CORE_FINISHES = ['glossy', 'matte', 'satin'] as const;
export const FINISH_LABEL: Record<string, string> = {
  glossy: 'Glossy',
  matte: 'Matte',
  satin: 'Satin',
};

export function normalizeCone(cone: string): string {
  return cone.toLowerCase().replace(/\s+/g, '-');
}
