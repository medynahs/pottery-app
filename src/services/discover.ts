import type { DiscoverInspiration, DiscoverRecipe } from '@/src/screens/library/discover/types';
import { API_BASE_URL } from './index';
import { apiErrorFromResponse } from './api';

async function fetchDiscoverJson<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw await apiErrorFromResponse(res, 'Discover request failed');
  }
  return (await res.json()) as T;
}

/** GET /public/discover/recipes — public, no auth. */
export async function fetchDiscoverRecipes(): Promise<DiscoverRecipe[]> {
  const data = await fetchDiscoverJson<DiscoverRecipe[]>('/public/discover/recipes');
  return Array.isArray(data) ? data : [];
}

/** GET /public/discover/inspirations — public, no auth. */
export async function fetchDiscoverInspirations(): Promise<DiscoverInspiration[]> {
  const data = await fetchDiscoverJson<DiscoverInspiration[]>('/public/discover/inspirations');
  return Array.isArray(data) ? data : [];
}
