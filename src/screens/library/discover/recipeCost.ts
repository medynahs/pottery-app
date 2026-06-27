import type { RecipeIngredient } from './types';

const PRICE_PER_LB: Record<string, number> = {
  'Custer Feldspar': 0.70,
  'Minspar 200': 0.65,
  'Nepheline Syenite': 0.65,
  Silica: 0.60,
  Whiting: 0.55,
  Dolomite: 0.55,
  Talc: 0.80,
  'EPK Kaolin': 0.75,
  'Gerstley Borate': 1.00,
  'Zinc Oxide': 4.50,
  'Titanium Dioxide': 3.50,
  'Red Iron Oxide': 2.20,
  'Cobalt Carbonate': 28.00,
  Rutile: 3.00,
  Spodumene: 2.80,
  'Soda Ash': 0.65,
  'Tin Oxide': 14.00,
};

const G_PER_LB = 453.592;

export function estimateRecipeCostPer100g(ingredients: RecipeIngredient[]): number {
  const total = ingredients.reduce((s, i) => s + i.percentage, 0);
  const cost = ingredients.reduce((s, i) => {
    const pricePerG = (PRICE_PER_LB[i.material] ?? 1.50) / G_PER_LB;
    const grams = (i.percentage / total) * 100;
    return s + grams * pricePerG;
  }, 0);
  return Math.round(cost * 100) / 100;
}
