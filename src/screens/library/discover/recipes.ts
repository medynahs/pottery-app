import type { DiscoverRecipe, RecipeIngredient } from './types';

const PRICE_PER_LB: Record<string, number> = {
  'Custer Feldspar': 0.70,
  'Minspar 200': 0.65,
  'Nepheline Syenite': 0.65,
  'Silica': 0.60,
  'Whiting': 0.55,
  'Dolomite': 0.55,
  'Talc': 0.80,
  'EPK Kaolin': 0.75,
  'Gerstley Borate': 1.00,
  'Zinc Oxide': 4.50,
  'Titanium Dioxide': 3.50,
  'Red Iron Oxide': 2.20,
  'Cobalt Carbonate': 28.00,
  'Rutile': 3.00,
  'Spodumene': 2.80,
  'Soda Ash': 0.65,
  'Tin Oxide': 14.00,
};

const G_PER_LB = 453.592;

/** Curated ceramic / glaze swatch photos (Unsplash, stable IDs). */
export const PREVIEW = {
  blue: 'https://images.unsplash.com/photo-1610701596007-d2f5ddfa5b0e?w=480&q=80',
  amber: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=480&q=80',
  red: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=480&q=80',
  white: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=480&q=80',
  green: 'https://images.unsplash.com/photo-1598300047939-4eb6c8e798c2?w=480&q=80',
  black: 'https://images.unsplash.com/photo-1578743527088-29667b16934e?w=480&q=80',
  satin: 'https://images.unsplash.com/photo-1610701596007-d2f5ddfa5b0e?w=480&q=80',
} as const;

export function estimateRecipeCostPer100g(ingredients: RecipeIngredient[]): number {
  const total = ingredients.reduce((s, i) => s + i.percentage, 0);
  const cost = ingredients.reduce((s, i) => {
    const pricePerG = (PRICE_PER_LB[i.material] ?? 1.50) / G_PER_LB;
    const grams = (i.percentage / total) * 100;
    return s + grams * pricePerG;
  }, 0);
  return Math.round(cost * 100) / 100;
}

function make(recipe: Omit<DiscoverRecipe, 'estimatedCostPer100g'>): DiscoverRecipe {
  return { ...recipe, estimatedCostPer100g: estimateRecipeCostPer100g(recipe.ingredients) };
}

export const DISCOVER_RECIPES: DiscoverRecipe[] = [
  make({
    id: 'rec-floating-blue',
    name: 'Floating Blue',
    author: 'Classic Cone 6',
    colorFamily: 'blue',
    finish: 'glossy',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#7BA7CC',
    previewUri: PREVIEW.blue,
    description: 'Beloved cone 6 blue that pools at texture and breaks lighter on edges.',
    ingredients: [
      { material: 'Custer Feldspar', percentage: 30 },
      { material: 'Silica', percentage: 30 },
      { material: 'Whiting', percentage: 20 },
      { material: 'EPK Kaolin', percentage: 10 },
      { material: 'Dolomite', percentage: 10 },
      { material: 'Cobalt Carbonate', percentage: 0.5, isAddition: true },
      { material: 'Rutile', percentage: 4, isAddition: true },
    ],
  }),
];
