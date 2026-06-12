import { DISCOVER_RECIPES } from './recipes';
import type { DiscoverRecipe } from './types';

export function getDiscoverRecipe(id: string): DiscoverRecipe | undefined {
  return DISCOVER_RECIPES.find((r) => r.id === id);
}

export function isDiscoverRecipeSaved(recipeId: string, glazeIds: string[]): boolean {
  const prefix = `discover-${recipeId}-`;
  return glazeIds.some((id) => id.startsWith(prefix));
}
