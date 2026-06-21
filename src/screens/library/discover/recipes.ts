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
  make({
    id: 'rec-oatmeal-matte',
    name: 'Oatmeal Matte',
    author: 'Classic Cone 6',
    colorFamily: 'amber',
    finish: 'matte',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#D4B88C',
    previewUri: PREVIEW.amber,
    description: 'Warm buttery matte. Works on nearly every clay body. Great layering base.',
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
    id: 'rec-clear-liner',
    name: 'Clear Liner Glaze',
    author: 'Studio Staple',
    colorFamily: 'white',
    finish: 'glossy',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#EFEBE0',
    previewUri: PREVIEW.white,
    description: 'Clean clear for interiors. Stays true over slips and underglazes.',
    ingredients: [
      { material: 'Custer Feldspar', percentage: 30 },
      { material: 'Silica', percentage: 30 },
      { material: 'Whiting', percentage: 20 },
      { material: 'EPK Kaolin', percentage: 15 },
      { material: 'Zinc Oxide', percentage: 5 },
    ],
  }),
  make({
    id: 'rec-sea-glass',
    name: 'Sea Glass Satin',
    author: 'Mid-Fire Favorite',
    colorFamily: 'green',
    finish: 'satin',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#8FBFA0',
    previewUri: PREVIEW.green,
    description: 'Soft green satin with subtle breaking on rims. Stable on stoneware and porcelain.',
    ingredients: [
      { material: 'Nepheline Syenite', percentage: 32 },
      { material: 'Silica', percentage: 28 },
      { material: 'Whiting', percentage: 18 },
      { material: 'EPK Kaolin', percentage: 14 },
      { material: 'Talc', percentage: 8 },
    ],
  }),
  make({
    id: 'rec-iron-red',
    name: 'Bauer Iron Red',
    author: 'High Fire Classic',
    colorFamily: 'red',
    finish: 'glossy',
    cone: 'cone-10',
    coneLabel: 'Cone 10',
    colorHex: '#C45C5C',
    previewUri: PREVIEW.red,
    description: 'Reduction iron red. Needs thick application. Thin areas go amber.',
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
    id: 'rec-shino',
    name: 'Malcolm Davis Shino',
    author: 'High Fire Classic',
    colorFamily: 'amber',
    finish: 'matte',
    cone: 'cone-10',
    coneLabel: 'Cone 10',
    colorHex: '#C48B5A',
    previewUri: PREVIEW.amber,
    description: 'Carbon-trapping shino. Orange flashing in reduction. Apply thick over texture.',
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
    author: 'High Fire Staple',
    colorFamily: 'black',
    finish: 'glossy',
    cone: 'cone-10',
    coneLabel: 'Cone 10',
    colorHex: '#3A2810',
    previewUri: PREVIEW.black,
    description: 'Deep iron black that breaks rust-brown on edges and ridges.',
    ingredients: [
      { material: 'Custer Feldspar', percentage: 40 },
      { material: 'Silica', percentage: 30 },
      { material: 'Whiting', percentage: 20 },
      { material: 'EPK Kaolin', percentage: 10 },
      { material: 'Red Iron Oxide', percentage: 10, isAddition: true },
    ],
  }),
  make({
    id: 'rec-celadon',
    name: 'Pale Celadon',
    author: 'Mid-Fire Favorite',
    colorFamily: 'green',
    finish: 'glossy',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#A8CBB7',
    previewUri: PREVIEW.green,
    description: 'Soft translucent green. Best on white stoneware with a thin dip.',
    ingredients: [
      { material: 'Custer Feldspar', percentage: 35 },
      { material: 'Silica', percentage: 30 },
      { material: 'Whiting', percentage: 15 },
      { material: 'EPK Kaolin', percentage: 15 },
      { material: 'Talc', percentage: 5 },
    ],
  }),
  make({
    id: 'rec-obsidian',
    name: 'Obsidian Gloss',
    author: 'Mid-Fire Favorite',
    colorFamily: 'black',
    finish: 'glossy',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorHex: '#2A2018',
    previewUri: PREVIEW.black,
    description: 'Near-black gloss with brown breaks. Reliable on textured surfaces.',
    ingredients: [
      { material: 'Nepheline Syenite', percentage: 34 },
      { material: 'Silica', percentage: 26 },
      { material: 'Whiting', percentage: 16 },
      { material: 'EPK Kaolin', percentage: 14 },
      { material: 'Red Iron Oxide', percentage: 6, isAddition: true },
    ],
  }),
];
