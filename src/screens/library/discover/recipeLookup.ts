import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import {
  buildDevDiscoverRecipes,
  devDiscoverSourceGlazeId,
} from './glazeToDiscoverRecipe';
import type { DiscoverCatalog } from './useDiscoverCatalog';
import type { DiscoverInspiration, DiscoverRecipe } from './types';

export function getDiscoverRecipe(
  id: string,
  catalog: DiscoverCatalog | undefined,
  glazes: GlazeLibraryItem[] = [],
  authorName?: string,
): DiscoverRecipe | undefined {
  const apiRecipe = catalog?.recipes.find((recipe) => recipe.id === id);
  if (apiRecipe) return apiRecipe;

  const sourceGlazeId = devDiscoverSourceGlazeId(id);
  if (!sourceGlazeId) return undefined;

  const devRecipe = buildDevDiscoverRecipes(glazes, [sourceGlazeId], authorName)[0];
  return devRecipe?.id === id ? devRecipe : undefined;
}

export function getDiscoverInspiration(
  id: string,
  catalog: DiscoverCatalog | undefined,
): DiscoverInspiration | undefined {
  return catalog?.inspirations.find((i) => i.id === id);
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
