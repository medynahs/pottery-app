import {
  SAVED_FROM_COMMUNITY_COLLECTION,
  sanitizeCustomCollections,
} from '@/src/screens/library/atlas/collections';
import { normalizeGlazeItem } from '@/src/screens/glazes/glazeItemHelpers';
import type { CommunityGlazeRecipePayload } from '@/src/screens/glazes/shareGlazeRecipe/glazePostPayload';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';

export type CommunityGlazeProvenance = {
  postId: string;
  sourceUserId: string;
  sourceStudioName: string;
};

export function communityGlazeToLibraryItem(
  payload: CommunityGlazeRecipePayload,
  provenance: CommunityGlazeProvenance,
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
    id: `community-${provenance.postId}-${Date.now()}`,
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
    communitySourcePostId: provenance.postId,
    communitySourceUserId: provenance.sourceUserId,
    communitySourceStudioName: provenance.sourceStudioName,
    communitySavedAt: now,
    createdAt: now,
    testTilePhotoUris: [],
    finishedPiecePhotoUris: [],
    accidentPhotoUris: [],
    clayBodiesUsed: [],
    kilnTypesUsed: [],
    conesTested: [payload.defaultCone].filter(Boolean),
  });
}
