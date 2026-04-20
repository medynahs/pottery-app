import type { DiscoverRecipe, RecipeIngredient } from './types';

// Material price reference: approximate USD per lb, US suppliers 2025.
// Used only for cost estimation -- not authoritative for purchasing.
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
  'Cobalt Oxide': 22.00,
  'Rutile': 3.00,
  'Spodumene': 2.80,
  'Soda Ash': 0.65,
  'Lithium Carbonate': 8.00,
  'Tin Oxide': 14.00,
  'Zircopax': 1.80,
  'Strontium Carbonate': 2.50,
  'Manganese Dioxide': 3.20,
  'Copper Carbonate': 8.50,
};

const G_PER_LB = 453.592;

/** Compute USD cost for a ~100 g batch given the recipe ingredient list. */
function costPer100g(ingredients: RecipeIngredient[]): number {
  const total = ingredients.reduce((s, i) => s + i.percentage, 0);
  const cost = ingredients.reduce((s, i) => {
    const pricePerG = (PRICE_PER_LB[i.material] ?? 1.50) / G_PER_LB;
    const grams = (i.percentage / total) * 100;
    return s + grams * pricePerG;
  }, 0);
  return Math.round(cost * 100) / 100;
}

function make(recipe: Omit<DiscoverRecipe, 'estimatedCostPer100g'>): DiscoverRecipe {
  return { ...recipe, estimatedCostPer100g: costPer100g(recipe.ingredients) };
}

export const DISCOVER_RECIPES: DiscoverRecipe[] = [
  make({
    id: 'rec-floating-blue',
    name: 'Floating Blue',
    author: 'Community Classic',
    colorFamily: 'blue',
    finish: 'glossy',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#7BA7CC',
    description: 'A beloved cone 6 blue that pools beautifully at texture, breaks lighter on edges.',
    savedCount: 1240,
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
  make({
    id: 'rec-oatmeal-matte',
    name: 'Oatmeal Matte',
    author: 'Community Classic',
    colorFamily: 'amber',
    finish: 'matte',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#D4B88C',
    description: 'Warm, buttery matte. Works on nearly every clay body. Great layering base.',
    savedCount: 876,
    ingredients: [
      { material: 'Custer Feldspar', percentage: 40 },
      { material: 'Silica', percentage: 20 },
      { material: 'Whiting', percentage: 15 },
      { material: 'EPK Kaolin', percentage: 15 },
      { material: 'Talc', percentage: 10 },
      { material: 'Titanium Dioxide', percentage: 5, isAddition: true },
    ],
  }),
  make({
    id: 'rec-iron-red',
    name: 'Bauer Iron Red',
    author: 'Community Classic',
    colorFamily: 'red',
    finish: 'glossy',
    cone: 'cone-10',
    coneLabel: 'Cone 10',
    colorHex: '#C45C5C',
    description: 'Classic reduction iron red. Needs thick application -- thinner areas go amber.',
    savedCount: 654,
    ingredients: [
      { material: 'Custer Feldspar', percentage: 40 },
      { material: 'Silica', percentage: 30 },
      { material: 'Whiting', percentage: 15 },
      { material: 'EPK Kaolin', percentage: 10 },
      { material: 'Talc', percentage: 5 },
      { material: 'Red Iron Oxide', percentage: 8, isAddition: true },
    ],
  }),
  make({
    id: 'rec-clear-liner',
    name: 'Clear Liner Glaze',
    author: 'Studio Staple',
    colorFamily: 'white',
    finish: 'glossy',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#EFEBE0',
    description: 'A clean, food-safe clear for interiors. Stays true over slips and underglazes.',
    savedCount: 2100,
    ingredients: [
      { material: 'Custer Feldspar', percentage: 30 },
      { material: 'Silica', percentage: 30 },
      { material: 'Whiting', percentage: 20 },
      { material: 'EPK Kaolin', percentage: 15 },
      { material: 'Zinc Oxide', percentage: 5 },
    ],
  }),
  make({
    id: 'rec-shino',
    name: 'Malcolm Davis Shino',
    author: 'Community Classic',
    colorFamily: 'amber',
    finish: 'matte',
    cone: 'cone-10',
    coneLabel: 'Cone 10',
    colorHex: '#C48B5A',
    description: 'Carbon-trapping shino. Orange flashing in reduction. Apply thick over texture.',
    savedCount: 988,
    ingredients: [
      { material: 'Nepheline Syenite', percentage: 40 },
      { material: 'Spodumene', percentage: 30 },
      { material: 'EPK Kaolin', percentage: 20 },
      { material: 'Soda Ash', percentage: 10 },
    ],
  }),
  make({
    id: 'rec-tenmoku',
    name: 'Simple Tenmoku',
    author: 'Studio Staple',
    colorFamily: 'black',
    finish: 'glossy',
    cone: 'cone-10',
    coneLabel: 'Cone 10',
    colorHex: '#3A2810',
    description: 'Deep iron black that breaks rust-brown on edges and ridges.',
    savedCount: 432,
    ingredients: [
      { material: 'Custer Feldspar', percentage: 40 },
      { material: 'Silica', percentage: 30 },
      { material: 'Whiting', percentage: 20 },
      { material: 'EPK Kaolin', percentage: 10 },
      { material: 'Red Iron Oxide', percentage: 10, isAddition: true },
    ],
  }),
];

export const RECIPE_SUCCESS_RATES: Record<string, number> = {
  'rec-floating-blue': 87,
  'rec-oatmeal-matte': 91,
  'rec-iron-red': 68,
  'rec-clear-liner': 95,
  'rec-shino': 72,
  'rec-tenmoku': 76,
};

export const TRENDING_IDS = new Set(
  [...DISCOVER_RECIPES]
    .sort((a, b) => b.savedCount - a.savedCount)
    .slice(0, 2)
    .map((r) => r.id),
);
