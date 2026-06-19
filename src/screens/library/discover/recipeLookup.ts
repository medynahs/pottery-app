import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { DISCOVER_INSPIRATIONS } from './inspirations';
import { DISCOVER_RECIPES } from './recipes';
import type { DiscoverInspiration, DiscoverRecipe } from './types';

export function getDiscoverRecipe(id: string): DiscoverRecipe | undefined {
  return DISCOVER_RECIPES.find((r) => r.id === id);
}

export function getDiscoverInspiration(id: string): DiscoverInspiration | undefined {
  return DISCOVER_INSPIRATIONS.find((i) => i.id === id);
}

export function isDiscoverRecipeSaved(
  recipeId: string,
  glazes: Pick<GlazeLibraryItem, 'id' | 'discoverSourceRecipeId'>[],
): boolean {
  return glazes.some(
    (glaze) =>
      glaze.discoverSourceRecipeId === recipeId
      || glaze.id === `discover-${recipeId}`
      || glaze.id.startsWith(`discover-${recipeId}-`),
  );
}
