import type { DiscoverInspiration, DiscoverRecipe } from '@/src/screens/library/discover/types';
import { API_BASE_URL } from './index';

export type DiscoverRecipesResponse = {
  version: string;
  recipes: DiscoverRecipe[];
};

async function fetchDiscoverJson<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Discover request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/** GET /glazes/discover/recipes — public, no auth. */
export async function fetchDiscoverRecipes(): Promise<DiscoverRecipesResponse> {
  const data = await fetchDiscoverJson<DiscoverRecipesResponse>('/glazes/discover/recipes');
  return {
    version: data.version ?? '',
    recipes: Array.isArray(data.recipes) ? data.recipes : [],
  };
}

/** GET /glazes/discover/inspirations — public, no auth. */
export async function fetchDiscoverInspirations(): Promise<DiscoverInspiration[]> {
  const data = await fetchDiscoverJson<DiscoverInspiration[]>('/glazes/discover/inspirations');
  return Array.isArray(data) ? data : [];
}
