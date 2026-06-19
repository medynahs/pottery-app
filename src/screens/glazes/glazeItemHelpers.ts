import type { GlazeDraft } from '@/src/screens/library/atlas/types';
import { generateGlazeBatchId } from './batchId';
import { todayDateIso } from '@/src/utils/dates';
import type { GlazeIngredient, GlazeLibraryItem } from './types';

function sanitizeRecipeIngredients(ingredients: GlazeIngredient[]): GlazeIngredient[] {
  return ingredients
    .map((ing) => ({
      ...ing,
      material: ing.material.trim(),
      percentage: ing.percentage.trim(),
      isAddition: ing.isAddition ?? false,
    }))
    .filter((ing) => ing.material.length > 0 && ing.percentage.length > 0);
}

function parseCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ingredientsFromStructured(recipeIngredients: GlazeIngredient[]): string {
  if (recipeIngredients.length === 0) return '';
  return recipeIngredients
    .map((ing) => {
      const pct = ing.percentage.trim();
      const material = ing.material.trim();
      if (!material) return '';
      return pct ? `${pct}% ${material}` : material;
    })
    .filter(Boolean)
    .join(', ');
}

export function normalizeGlazeItem(glaze: GlazeLibraryItem): GlazeLibraryItem {
  const dateMixed = glaze.dateMixed ?? glaze.createdAt.slice(0, 10);
  const versionNumber = glaze.versionNumber ?? 1;
  const ingredientsText =
    glaze.ingredientsText?.trim()
    || ingredientsFromStructured(glaze.recipeIngredients ?? [])
    || undefined;

  return {
    ...glaze,
    dateMixed,
    versionNumber,
    rootGlazeId: glaze.rootGlazeId ?? glaze.id,
    status: glaze.status ?? 'experimental',
    ingredientsText,
    batchId:
      glaze.batchId
      ?? generateGlazeBatchId(glaze.name, dateMixed, versionNumber),
  };
}

function parseTempC(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/** Map a form draft to a glaze record for create or update. */
export function glazeDraftToItem(
  draft: GlazeDraft,
  opts: { id: string; existing?: GlazeLibraryItem },
): GlazeLibraryItem {
  const existing = opts.existing;
  const dateMixed = draft.dateMixed.trim() || existing?.dateMixed || todayDateIso();
  const versionNumber = existing?.versionNumber ?? 1;
  const name = draft.name.trim();
  const batchId =
    existing?.batchId ?? generateGlazeBatchId(name, dateMixed, versionNumber);
  const recipeIngredients = sanitizeRecipeIngredients(draft.recipeIngredients);

  return normalizeGlazeItem({
    id: opts.id,
    backendId: existing?.backendId,
    syncDirty: true,
    name,
    finish: draft.finish,
    colorFamily: draft.colorFamily.trim() || existing?.colorFamily || 'Unsorted Surface',
    coneRange: draft.coneRange.trim() || draft.defaultCone,
    defaultCone: draft.defaultCone,
    source: draft.source,
    notes: draft.notes.trim() || undefined,
    applicationNotes: draft.applicationNotes.trim() || undefined,
    supplier: draft.supplier.trim() || undefined,
    batchSize: draft.batchSize.trim() || undefined,
    recipeNotes: draft.recipeNotes.trim() || undefined,
    ingredientsText: ingredientsFromStructured(recipeIngredients),
    recipeIngredients,
    batchId,
    dateMixed,
    status: draft.status,
    bestClayType: draft.bestClayType,
    bestFiringTempC: parseTempC(draft.bestFiringTempC),
    atmosphere: draft.atmosphere,
    versionNumber,
    rootGlazeId: existing?.rootGlazeId ?? opts.id,
    parentGlazeId: existing?.parentGlazeId,
    tags: parseCommaList(draft.tags),
    collections: draft.collections,
    favorite: draft.favorite,
    production: draft.production,
    bucketPhotoUri: draft.bucketPhotoUri ?? existing?.bucketPhotoUri,
    testTilePhotoUris: draft.firstTilePhotoUri
      ? [draft.firstTilePhotoUri]
      : existing?.testTilePhotoUris ?? [],
    finishedPiecePhotoUris: draft.firstPiecePhotoUri
      ? [draft.firstPiecePhotoUri]
      : existing?.finishedPiecePhotoUris ?? [],
    accidentPhotoUris: existing?.accidentPhotoUris ?? [],
    clayBodiesUsed: existing?.clayBodiesUsed ?? [],
    kilnTypesUsed: existing?.kilnTypesUsed ?? [],
    conesTested: existing?.conesTested ?? [],
    lastTestedAt: existing?.lastTestedAt,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  });
}
