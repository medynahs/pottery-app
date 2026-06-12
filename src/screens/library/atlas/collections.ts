import type { GlazeLibraryItem } from '@/src/screens/glazes/types';

export const DEFAULT_GLAZE_COLLECTIONS = ['My Glazes', 'Favorites'] as const;
export type DefaultGlazeCollection = (typeof DEFAULT_GLAZE_COLLECTIONS)[number];

/** Demo seed data shipped before v3 — stripped on store migration. */
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

export function buildGlazesByCollection(
  glazes: GlazeLibraryItem[],
): Record<DefaultGlazeCollection, GlazeLibraryItem[]> {
  return {
    'My Glazes': glazes,
    Favorites: glazes.filter((g) => g.favorite),
  };
}

export function matchesCollectionFilter(
  glaze: GlazeLibraryItem,
  collectionFilter?: string,
): boolean {
  if (!collectionFilter || collectionFilter === 'My Glazes') return true;
  if (collectionFilter === 'Favorites') return glaze.favorite;
  return glaze.collections.includes(collectionFilter);
}

export function normalizeGlazeCollections(): string[] {
  return ['My Glazes'];
}
