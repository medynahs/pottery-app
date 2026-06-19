import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { COLOR_FAMILY_HEX } from './constants';
import type { GlazeDraft, TestDraft } from './types';

export function getGlazeColor(colorFamily: string): string {
  return COLOR_FAMILY_HEX[colorFamily?.toLowerCase()] ?? '#C4B48C';
}

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
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

export function glazeToEditDraft(glaze: GlazeLibraryItem): GlazeDraft {
  return {
    name: glaze.name,
    finish: glaze.finish,
    colorFamily: glaze.colorFamily ?? '',
    coneRange: glaze.coneRange ?? '',
    defaultCone: glaze.defaultCone ?? glaze.coneRange ?? '',
    source: glaze.source,
    notes: glaze.notes ?? '',
    applicationNotes: glaze.applicationNotes ?? '',
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
    firingDate: new Date().toISOString().slice(0, 10),
    notes: '',
    resultRating: 'interesting',
    defects: [],
  };
}

