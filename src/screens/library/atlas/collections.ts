import type { GlazeLibraryItem } from '@/src/screens/glazes/types';

export const MY_GLAZES_COLLECTION = 'My Glazes';
export const FAVORITES_COLLECTION = 'Favorites';
/** Auto-assigned when saving a glaze recipe from a community post. */
export const SAVED_FROM_COMMUNITY_COLLECTION = 'Saved from Community';

/** @deprecated Use MY_GLAZES_COLLECTION / FAVORITES_COLLECTION */
export const DEFAULT_GLAZE_COLLECTIONS = [MY_GLAZES_COLLECTION, FAVORITES_COLLECTION] as const;
export type DefaultGlazeCollection = (typeof DEFAULT_GLAZE_COLLECTIONS)[number];

/** Demo seed data shipped before v3, stripped on store migration. */
export const LEGACY_SEED_GLAZE_IDS = new Set([
  'glaze-satin-blue',
  'glaze-iron-honey',
  'glaze-crystal-mint',
]);

export const LEGACY_SEED_TEST_IDS = new Set([
  'test-quiet-blue-1',
  'test-iron-honey-1',
  'test-crystal-mint-1',
  'test-quiet-blue-2',
]);

export type AtlasCollectionKey = 'all' | 'favorites' | string;

export function isReservedCollectionName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized === MY_GLAZES_COLLECTION.toLowerCase() ||
    normalized === FAVORITES_COLLECTION.toLowerCase()
  );
}

/** Custom collection tags stored on each glaze (excludes system names). */
export function sanitizeCustomCollections(names: string[]): string[] {
  return [
    ...new Set(
      names
        .map((name) => name.trim())
        .filter((name) => name.length > 0 && !isReservedCollectionName(name)),
    ),
  ];
}

export function deriveCustomCollectionNames(
  glazes: GlazeLibraryItem[],
  savedNames: string[],
): string[] {
  const names = new Set<string>();
  for (const saved of savedNames) {
    const clean = sanitizeCustomCollections([saved])[0];
    if (clean) names.add(clean);
  }
  for (const glaze of glazes) {
    for (const collection of glaze.collections) {
      const clean = sanitizeCustomCollections([collection])[0];
      if (clean) names.add(clean);
    }
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export function filterGlazesByCollection(
  glazes: GlazeLibraryItem[],
  key: AtlasCollectionKey,
): GlazeLibraryItem[] {
  if (key === 'all') return glazes;
  if (key === 'favorites') return glazes.filter((g) => g.favorite);
  return glazes.filter((g) => g.collections.includes(key));
}

export function buildGlazesByCollection(
  glazes: GlazeLibraryItem[],
  savedNames: string[] = [],
): Record<string, GlazeLibraryItem[]> {
  const result: Record<string, GlazeLibraryItem[]> = {
    [MY_GLAZES_COLLECTION]: glazes,
    [FAVORITES_COLLECTION]: glazes.filter((g) => g.favorite),
  };

  for (const name of deriveCustomCollectionNames(glazes, savedNames)) {
    result[name] = glazes.filter((g) => g.collections.includes(name));
  }

  return result;
}

export function matchesCollectionFilter(
  glaze: GlazeLibraryItem,
  collectionFilter?: string,
): boolean {
  if (!collectionFilter || collectionFilter === MY_GLAZES_COLLECTION) return true;
  if (collectionFilter === FAVORITES_COLLECTION) return glaze.favorite;
  return glaze.collections.includes(collectionFilter);
}

/** @deprecated Glazes no longer store the implicit "My Glazes" tag. */
export function normalizeGlazeCollections(selected: string[] = []): string[] {
  return sanitizeCustomCollections(selected);
}

export function collectionLabel(key: AtlasCollectionKey): string {
  if (key === 'all') return MY_GLAZES_COLLECTION;
  if (key === 'favorites') return FAVORITES_COLLECTION;
  return key;
}

export function collectionNameToSlug(name: string): string {
  if (name === MY_GLAZES_COLLECTION) return 'all';
  if (name === FAVORITES_COLLECTION) return 'favorites';
  return encodeURIComponent(name);
}

export function slugToCollectionKey(slug: string): AtlasCollectionKey {
  if (slug === 'all') return 'all';
  if (slug === 'favorites') return 'favorites';
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
