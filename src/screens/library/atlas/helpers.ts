import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { formatDateShort, todayIso } from '@/src/utils/dates';
import type { GlazeDraft, TestDraft } from './types';

export function glazeCardColor(colorFamily: string): string {
  const n = colorFamily.trim().toLowerCase();
  if (n.includes('blue')) return '#9EC5D6';
  if (n.includes('green') || n.includes('mint')) return '#AFC9A1';
  if (n.includes('honey') || n.includes('brown') || n.includes('amber')) return '#D8B17B';
  if (n.includes('red') || n.includes('iron')) return '#C27A67';
  if (n.includes('white') || n.includes('cream')) return '#E8DFC9';
  return '#C7B8A3';
}

export function formatShortDate(value: string): string {
  return formatDateShort(value);
}

export function parseCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createEmptyGlazeDraft(
  defaultCone: string | null,
  defaultCollections: string[],
): GlazeDraft {
  return {
    name: '',
    finish: 'glossy',
    colorFamily: '',
    coneRange: defaultCone ?? 'Cone 6',
    defaultCone: defaultCone ?? 'Cone 6',
    source: 'store-bought',
    recipeIngredients: [],
    dateMixed: todayIso(),
    status: 'experimental',
    bestClayType: undefined,
    bestFiringTempC: '',
    atmosphere: undefined,
    notes: '',
    applicationNotes: '',
    supplier: '',
    batchSize: '',
    recipeNotes: '',
    tags: '',
    collections: [],
    favorite: false,
    production: false,
  };
}

function combineNotes(notes?: string, applicationNotes?: string): string {
  const parts = [notes?.trim(), applicationNotes?.trim()].filter(Boolean);
  return parts.join('\n\n');
}

export function glazeToEditDraft(glaze: GlazeLibraryItem): GlazeDraft {
  const recipeIngredients =
    glaze.recipeIngredients?.length
      ? glaze.recipeIngredients.map((ing) => ({ ...ing }))
      : glaze.ingredientsText
        ? [{ id: `ing-legacy`, material: glaze.ingredientsText, percentage: '' }]
        : [];

  return {
    name: glaze.name.replace(/\s+v\d+\s*$/i, '').trim(),
    finish: glaze.finish,
    colorFamily: glaze.colorFamily ?? '',
    coneRange: glaze.coneRange ?? '',
    defaultCone: glaze.defaultCone ?? glaze.coneRange ?? '',
    source: glaze.source,
    recipeIngredients,
    dateMixed: glaze.dateMixed ?? glaze.createdAt.slice(0, 10),
    status: glaze.status ?? 'experimental',
    bestClayType: glaze.bestClayType,
    bestFiringTempC: glaze.bestFiringTempC != null ? String(glaze.bestFiringTempC) : '',
    atmosphere: glaze.atmosphere,
    notes: combineNotes(glaze.notes, glaze.applicationNotes),
    applicationNotes: '',
    supplier: glaze.supplier ?? '',
    batchSize: glaze.batchSize ?? '',
    recipeNotes: glaze.recipeNotes ?? '',
    tags: (glaze.tags ?? []).join(', '),
    collections: glaze.collections ?? [],
    favorite: glaze.favorite,
    production: glaze.production,
    bucketPhotoUri: glaze.bucketPhotoUri,
    firstTilePhotoUri: glaze.testTilePhotoUris[0],
    firstPiecePhotoUri: glaze.finishedPiecePhotoUris[0],
  };
}

export function createEmptyTestDraft(
  glazeId: string,
  defaultCone: string | null,
  defaultClayBody = '',
): TestDraft {
  return {
    glazeId,
    clayBody: defaultClayBody,
    cone: defaultCone ?? 'Cone 6',
    kilnName: '',
    kilnType: 'electric',
    applicationMethod: 'dip',
    thickness: 'medium',
    layeredWith: '',
    shelfPosition: '',
    firingDate: todayIso(),
    notes: '',
    resultRating: 'interesting',
    defects: [],
  };
}

