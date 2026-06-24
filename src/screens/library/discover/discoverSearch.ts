import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { comboUsesOwnedGlaze, inspirationBrands } from './products';
import type {
  BrandFilter,
  ColorFilter,
  ConeFilter,
  ContentTypeFilter,
  DiscoverInspiration,
  DiscoverItem,
  DiscoverRecipe,
  FinishFilter,
} from './types';
import { buildDevDiscoverRecipes } from './glazeToDiscoverRecipe';
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
  const productHaystack = (inspiration.products ?? [])
    .flatMap((p) => [p.brand, p.name, p.role ?? '', p.method ?? ''])
    .join(' ');

  const haystack = [
    inspiration.title,
    inspiration.description,
    inspiration.applicationNotes,
    inspiration.coneLabel,
    inspiration.colorFamily ?? '',
    productHaystack,
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
    contentTypeFilter: ContentTypeFilter;
    brandFilter: BrandFilter;
    ownedGlazesOnly: boolean;
    glazes: GlazeLibraryItem[];
  },
): boolean {
  if (filters.contentTypeFilter === 'recipes' && item.kind !== 'recipe') return false;
  if (filters.contentTypeFilter === 'combos' && item.kind !== 'inspiration') return false;

  const cone = item.kind === 'recipe' ? item.recipe.cone : item.inspiration.cone;
  if (filters.coneFilter !== 'all' && cone !== filters.coneFilter) return false;

  if (filters.colorFilter !== 'all') {
    const colorFamily =
      item.kind === 'recipe' ? item.recipe.colorFamily : item.inspiration.colorFamily;
    if (colorFamily !== filters.colorFilter) return false;
  }

  if (filters.finishFilter !== 'all') {
    const finish =
      item.kind === 'recipe' ? item.recipe.finish : item.inspiration.finish;
    if (!finish || finish !== filters.finishFilter) return false;
  }

  if (filters.brandFilter !== 'all') {
    if (item.kind === 'recipe') return false;
    const brands = inspirationBrands(item.inspiration);
    if (!brands.some((brand) => brand.toLowerCase() === filters.brandFilter.toLowerCase())) {
      return false;
    }
  }

  if (filters.ownedGlazesOnly) {
    if (item.kind !== 'inspiration') return false;
    if (!comboUsesOwnedGlaze(item.inspiration, filters.glazes)) return false;
  }

  return true;
}

export function buildDiscoverCatalog(options?: {
  glazes?: GlazeLibraryItem[];
  devDiscoverGlazeIds?: string[];
  authorName?: string;
}): DiscoverItem[] {
  const devRecipes = buildDevDiscoverRecipes(
    options?.glazes ?? [],
    options?.devDiscoverGlazeIds ?? [],
    options?.authorName,
  );

  return [
    ...devRecipes.map((recipe) => ({ kind: 'recipe' as const, recipe })),
    ...DISCOVER_RECIPES.map((recipe) => ({ kind: 'recipe' as const, recipe })),
    ...DISCOVER_INSPIRATIONS.map((inspiration) => ({ kind: 'inspiration' as const, inspiration })),
  ];
}

export function collectDiscoverBrands(items: DiscoverItem[]): string[] {
  const brands = new Set<string>();
  for (const item of items) {
    if (item.kind !== 'inspiration') continue;
    for (const brand of inspirationBrands(item.inspiration)) {
      brands.add(brand);
    }
  }
  return [...brands].sort((a, b) => a.localeCompare(b));
}
