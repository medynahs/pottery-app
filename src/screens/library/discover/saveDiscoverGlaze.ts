import { ingredientsFromStructured, normalizeGlazeItem } from '@/src/screens/glazes/glazeItemHelpers';
import type { GlazeFinish, GlazeLibraryItem } from '@/src/screens/glazes/types';
import type { DiscoverRecipe } from './types';

export const DISCOVER_SAVED_COLLECTION = 'Saved from Discover';

export function discoverGlazeToLibraryItem(
  recipe: DiscoverRecipe,
  customCollections: string[],
): GlazeLibraryItem {
  const id = `discover-${recipe.id}`;
  const recipeIngredients = recipe.ingredients.map((ing, index) => ({
    id: `ing-${index}`,
    material: ing.material,
    percentage: String(ing.percentage),
    isAddition: ing.isAddition,
  }));
  const collections = customCollections.length > 0
    ? customCollections
    : [DISCOVER_SAVED_COLLECTION];

  return normalizeGlazeItem({
    id,
    name: recipe.name,
    finish: recipe.finish as GlazeFinish,
    colorFamily: recipe.colorFamily,
    coneRange: recipe.coneLabel,
    defaultCone: recipe.coneLabel,
    source: 'custom',
    notes: recipe.description,
    collections,
    tags: ['discover'],
    ingredientsText: ingredientsFromStructured(recipeIngredients),
    recipeIngredients,
    status: 'experimental',
    versionNumber: 1,
    rootGlazeId: id,
    favorite: false,
    production: false,
    bucketPhotoUri: recipe.previewUri,
    testTilePhotoUris: recipe.previewUri ? [recipe.previewUri] : [],
    finishedPiecePhotoUris: [],
    accidentPhotoUris: [],
    clayBodiesUsed: [],
    kilnTypesUsed: [],
    conesTested: [],
    createdAt: new Date().toISOString(),
    discoverSourceRecipeId: recipe.id,
    discoverSavedAt: new Date().toISOString(),
  });
}
