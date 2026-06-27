import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { glazeCardColor } from '@/src/screens/library/atlas/helpers';
import { resolveGlazePhotoUri } from '@/src/screens/glazes/glazePieceLink';
import { estimateRecipeCostPer100g } from './recipeCost';
import type { DiscoverRecipe, RecipeIngredient } from './types';
import { normalizeCone } from './types';

export const DEV_DISCOVER_RECIPE_PREFIX = 'dev-glaze-';

export function devDiscoverRecipeId(glazeId: string): string {
  return `${DEV_DISCOVER_RECIPE_PREFIX}${glazeId}`;
}

export function devDiscoverSourceGlazeId(recipeId: string): string | undefined {
  if (!recipeId.startsWith(DEV_DISCOVER_RECIPE_PREFIX)) return undefined;
  return recipeId.slice(DEV_DISCOVER_RECIPE_PREFIX.length);
}

export function isDevDiscoverRecipeId(recipeId: string): boolean {
  return recipeId.startsWith(DEV_DISCOVER_RECIPE_PREFIX);
}

function normalizeColorFamily(colorFamily: string): string {
  const n = colorFamily.trim().toLowerCase();
  if (n.includes('blue')) return 'blue';
  if (n.includes('green') || n.includes('mint')) return 'green';
  if (n.includes('amber') || n.includes('honey') || n.includes('brown')) return 'amber';
  if (n.includes('red') || n.includes('iron') || n.includes('rust')) return 'red';
  if (n.includes('white') || n.includes('cream')) return 'white';
  if (n.includes('black')) return 'black';
  return n || 'amber';
}

function coneToFilterKey(coneLabel: string): string {
  const n = normalizeCone(coneLabel);
  if (n.includes('06') || n.includes('018') || n.includes('04')) return 'cone-06';
  if (n.includes('10')) return 'cone-10';
  if (n.includes('6') || n.includes('5')) return 'cone-6';
  return n;
}

function glazeIngredientsToRecipe(glaze: GlazeLibraryItem): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];
  for (const ing of glaze.recipeIngredients) {
    const pct = parseFloat(ing.percentage);
    if (!ing.material.trim() || Number.isNaN(pct)) continue;
    ingredients.push({
      material: ing.material.trim(),
      percentage: pct,
      ...(ing.isAddition ? { isAddition: true } : {}),
    });
  }
  return ingredients;
}

export function glazeToDiscoverRecipe(
  glaze: GlazeLibraryItem,
  authorName = 'My Studio',
): DiscoverRecipe {
  const coneLabel = glaze.defaultCone || glaze.coneRange || 'Cone 6';
  const ingredients = glazeIngredientsToRecipe(glaze);
  const colorFamily = normalizeColorFamily(glaze.colorFamily || '');

  return {
    id: devDiscoverRecipeId(glaze.id),
    name: glaze.name.replace(/\s+v\d+\s*$/i, '').trim() || glaze.name,
    author: authorName,
    colorFamily,
    finish: glaze.finish,
    cone: coneToFilterKey(coneLabel),
    coneLabel,
    colorHex: glazeCardColor(glaze.colorFamily),
    previewUri: resolveGlazePhotoUri(glaze),
    description: [glaze.notes, glaze.applicationNotes].filter(Boolean).join('\n\n') || 'No description yet.',
    ingredients,
    estimatedCostPer100g: estimateRecipeCostPer100g(ingredients),
    devSourceGlazeId: glaze.id,
  };
}

export function buildDevDiscoverRecipes(
  glazes: GlazeLibraryItem[],
  glazeIds: string[],
  authorName?: string,
): DiscoverRecipe[] {
  if (!__DEV__) return [];

  const byId = new Map(glazes.map((glaze) => [glaze.id, glaze]));
  return glazeIds
    .map((id) => byId.get(id))
    .filter((glaze): glaze is GlazeLibraryItem => Boolean(glaze))
    .map((glaze) => glazeToDiscoverRecipe(glaze, authorName));
}
