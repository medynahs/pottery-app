import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { buildDevDiscoverRecipes, devDiscoverSourceGlazeId } from './glazeToDiscoverRecipe';
import { DISCOVER_INSPIRATIONS } from './inspirations';
import { DISCOVER_RECIPES } from './recipes';
import type { DiscoverInspiration, DiscoverRecipe } from './types';

export function getDiscoverRecipe(
  id: string,
  glazes: GlazeLibraryItem[] = [],
  authorName?: string,
): DiscoverRecipe | undefined {
  const staticRecipe = DISCOVER_RECIPES.find((recipe) => recipe.id === id);
  if (staticRecipe) return staticRecipe;

  const sourceGlazeId = devDiscoverSourceGlazeId(id);
  if (!sourceGlazeId) return undefined;

  const devRecipe = buildDevDiscoverRecipes(glazes, [sourceGlazeId], authorName)[0];
  return devRecipe?.id === id ? devRecipe : undefined;
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
