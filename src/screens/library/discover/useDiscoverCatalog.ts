import {
  fetchDiscoverInspirations,
  fetchDiscoverRecipes,
} from '@/src/services/discover';
import { useQuery } from '@tanstack/react-query';
import type { DiscoverInspiration, DiscoverItem, DiscoverRecipe } from './types';
import { buildDevDiscoverRecipes, devDiscoverSourceGlazeId } from './glazeToDiscoverRecipe';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';

export const DISCOVER_CATALOG_QUERY_KEY = ['discover', 'catalog'] as const;

export type DiscoverCatalog = {
  version: string;
  recipes: DiscoverRecipe[];
  inspirations: DiscoverInspiration[];
  items: DiscoverItem[];
};

function buildCatalogItems(
  recipes: DiscoverRecipe[],
  inspirations: DiscoverInspiration[],
  devRecipes: DiscoverRecipe[],
): DiscoverItem[] {
  return [
    ...devRecipes.map((recipe) => ({ kind: 'recipe' as const, recipe })),
    ...recipes.map((recipe) => ({ kind: 'recipe' as const, recipe })),
    ...inspirations.map((inspiration) => ({ kind: 'inspiration' as const, inspiration })),
  ];
}

export function useDiscoverCatalog(options?: {
  glazes?: GlazeLibraryItem[];
  devDiscoverGlazeIds?: string[];
  authorName?: string;
}) {
  const glazes = options?.glazes ?? [];
  const devDiscoverGlazeIds = options?.devDiscoverGlazeIds ?? [];
  const authorName = options?.authorName ?? 'My Studio';

  return useQuery({
    queryKey: [...DISCOVER_CATALOG_QUERY_KEY, devDiscoverGlazeIds.join(',')],
    queryFn: async (): Promise<DiscoverCatalog> => {
      const [recipesRes, inspirations] = await Promise.all([
        fetchDiscoverRecipes(),
        fetchDiscoverInspirations(),
      ]);
      const devRecipes = buildDevDiscoverRecipes(glazes, devDiscoverGlazeIds, authorName);
      const recipes = recipesRes.recipes;
      return {
        version: recipesRes.version,
        recipes,
        inspirations,
        items: buildCatalogItems(recipes, inspirations, devRecipes),
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function findDiscoverRecipe(
  catalog: DiscoverCatalog | undefined,
  id: string,
  glazes: GlazeLibraryItem[],
  authorName?: string,
): DiscoverRecipe | undefined {
  const fromApi = catalog?.recipes.find((recipe) => recipe.id === id);
  if (fromApi) return fromApi;
  const sourceGlazeId = devDiscoverSourceGlazeId(id);
  if (!sourceGlazeId) return undefined;
  return buildDevDiscoverRecipes(glazes, [sourceGlazeId], authorName).find(
    (recipe) => recipe.id === id,
  );
}

export function findDiscoverInspiration(
  catalog: DiscoverCatalog | undefined,
  id: string,
): DiscoverInspiration | undefined {
  return catalog?.inspirations.find((inspiration) => inspiration.id === id);
}
