import type {
  ColorFilter,
  ConeFilter,
  DiscoverInspiration,
  DiscoverItem,
  DiscoverRecipe,
  FinishFilter,
} from './types';
import { DISCOVER_INSPIRATIONS } from './inspirations';
import { DISCOVER_RECIPES } from './recipes';

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function tokensMatch(haystack: string, query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

export function recipeMatchesSearch(recipe: DiscoverRecipe, query: string): boolean {
  const haystack = [
    recipe.name,
    recipe.description,
    recipe.author,
    recipe.coneLabel,
    recipe.finish,
    recipe.colorFamily,
    ...recipe.ingredients.map((ing) => ing.material),
  ]
    .join(' ')
    .toLowerCase();
  return tokensMatch(haystack, query);
}

export function inspirationMatchesSearch(inspiration: DiscoverInspiration, query: string): boolean {
  const haystack = [
    inspiration.title,
    inspiration.description,
    inspiration.applicationNotes,
    inspiration.coneLabel,
    inspiration.colorFamily ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return tokensMatch(haystack, query);
}

export function itemMatchesSearch(item: DiscoverItem, query: string): boolean {
  return item.kind === 'recipe'
    ? recipeMatchesSearch(item.recipe, query)
    : inspirationMatchesSearch(item.inspiration, query);
}

export function itemMatchesFilters(
  item: DiscoverItem,
  filters: {
    coneFilter: ConeFilter;
    finishFilter: FinishFilter;
    colorFilter: ColorFilter;
  },
): boolean {
  const cone = item.kind === 'recipe' ? item.recipe.cone : item.inspiration.cone;
  if (filters.coneFilter !== 'all' && cone !== filters.coneFilter) return false;

  if (filters.colorFilter !== 'all') {
    const colorFamily =
      item.kind === 'recipe' ? item.recipe.colorFamily : item.inspiration.colorFamily;
    if (colorFamily !== filters.colorFilter) return false;
  }

  if (filters.finishFilter !== 'all') {
    if (item.kind === 'inspiration') return false;
    if (item.recipe.finish !== filters.finishFilter) return false;
  }

  return true;
}

export function buildDiscoverCatalog(): DiscoverItem[] {
  return [
    ...DISCOVER_RECIPES.map((recipe) => ({ kind: 'recipe' as const, recipe })),
    ...DISCOVER_INSPIRATIONS.map((inspiration) => ({ kind: 'inspiration' as const, inspiration })),
  ];
}
