import {
  SAVED_FROM_COMMUNITY_COLLECTION,
  sanitizeCustomCollections,
} from '@/src/screens/library/atlas/collections';
import { normalizeGlazeItem } from '@/src/screens/glazes/glazeItemHelpers';
import type { CommunityGlazeRecipePayload } from '@/src/screens/glazes/shareGlazeRecipe/glazePostPayload';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { todayDateIso } from '@/src/utils/dates';

export function communityGlazeToLibraryItem(
  payload: CommunityGlazeRecipePayload,
  postId: string,
  selectedCollections: string[],
): GlazeLibraryItem {
  const collections = sanitizeCustomCollections([
    SAVED_FROM_COMMUNITY_COLLECTION,
    ...selectedCollections.filter((c) => c !== SAVED_FROM_COMMUNITY_COLLECTION),
  ]);

  const recipeIngredients = payload.ingredients.map((row, index) => ({
    id: `ing-${index}`,
    material: row.material,
    percentage: row.percentage,
    isAddition: row.isAddition ?? false,
  }));

  const now = new Date().toISOString();

  return normalizeGlazeItem({
    id: `community-${postId}-${Date.now()}`,
    name: payload.name,
    finish: payload.finish,
    colorFamily: payload.colorFamily || 'neutral',
    coneRange: payload.coneRange || payload.defaultCone,
    defaultCone: payload.defaultCone,
    source: 'custom',
    notes: payload.notes,
    batchSize: payload.batchSize ?? '',
    ingredientsText: payload.ingredientsText,
    recipeIngredients,
    status: payload.status ?? 'experimental',
    collections,
    tags: [],
    favorite: false,
    production: false,
    versionNumber: 1,
    createdAt: now,
    testTilePhotoUris: [],
    finishedPiecePhotoUris: [],
    accidentPhotoUris: [],
    clayBodiesUsed: [],
    kilnTypesUsed: [],
    conesTested: [payload.defaultCone].filter(Boolean),
  });
}
