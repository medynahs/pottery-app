export type GlazeFinish = 'glossy' | 'matte' | 'satin' | 'crystalline';
export type GlazeSource = 'store-bought' | 'custom';
export type GlazeStatus = 'works_great' | 'experimental' | 'failed';
export type GlazeAtmosphere = 'oxidation' | 'reduction' | 'both';
export type GlazeClayType = 'stoneware' | 'earthenware' | 'porcelain';
export type GlazeResultRating = 'bad' | 'interesting' | 'great';
export type GlazeApplicationMethod = 'dip' | 'brush' | 'pour' | 'spray';
export type GlazeThickness = 'thin' | 'medium' | 'thick';
export type GlazeKilnType = 'electric' | 'gas' | 'wood' | 'soda' | 'raku' | 'other';
export type GlazeDefect = 'crawling' | 'crazing' | 'pinholing' | 'blistering' | 'running' | 'color-shift';

export interface GlazeIngredient {
  id: string;
  material: string;
  percentage: string;
  supplier?: string;
  /** Colorants / opacifiers listed above the base 100%. */
  isAddition?: boolean;
}

export interface GlazeLibraryItem {
  id: string;
  /** UUID assigned by the backend after the glaze is first synced. */
  backendId?: string;
  /** Local edits not yet pushed via POST /users/me/glazes/sync. */
  syncDirty?: boolean;
  name: string;
  finish: GlazeFinish;
  colorFamily: string;
  coneRange: string;
  defaultCone: string;
  source: GlazeSource;
  notes?: string;
  applicationNotes?: string;
  supplier?: string;
  batchSize?: string;
  recipeNotes?: string;
  /** Free-form recipe text, e.g. "50% feldspar, 30% kaolin, 20% silica". */
  ingredientsText?: string;
  recipeIngredients: GlazeIngredient[];
  /** Auto-generated batch label, e.g. CB-2026-06-v1. */
  batchId?: string;
  /** YYYY-MM-DD when the batch was mixed. */
  dateMixed?: string;
  status?: GlazeStatus;
  bestClayType?: GlazeClayType;
  bestFiringTempC?: number;
  atmosphere?: GlazeAtmosphere;
  versionNumber?: number;
  rootGlazeId?: string;
  parentGlazeId?: string;
  tags: string[];
  collections: string[];
  favorite: boolean;
  production: boolean;
  bucketPhotoUri?: string;
  testTilePhotoUris: string[];
  finishedPiecePhotoUris: string[];
  accidentPhotoUris: string[];
  clayBodiesUsed: string[];
  kilnTypesUsed: string[];
  conesTested: string[];
  lastTestedAt?: string;
  createdAt: string;
}

export interface GlazeTestTile {
  id: string;
  /** UUID assigned by the backend after the test is first synced. */
  backendId?: string;
  /** Local edits not yet pushed via POST /users/me/glazes/sync. */
  syncDirty?: boolean;
  glazeId: string;
  glazeNameSnapshot: string;
  clayBody: string;
  cone: string;
  kilnName?: string;
  kilnType?: GlazeKilnType;
  applicationMethod: GlazeApplicationMethod;
  thickness: GlazeThickness;
  layeredWith: string[];
  shelfPosition?: string;
  firingDate: string;
  photoUri?: string;
  notes?: string;
  resultRating: GlazeResultRating;
  defects: GlazeDefect[];
}

export const GLAZE_FINISH_OPTIONS: GlazeFinish[] = ['glossy', 'matte', 'satin', 'crystalline'];
export const GLAZE_SOURCE_OPTIONS: GlazeSource[] = ['store-bought', 'custom'];
export const GLAZE_STATUS_OPTIONS: GlazeStatus[] = ['works_great', 'experimental', 'failed'];
export const GLAZE_ATMOSPHERE_OPTIONS: GlazeAtmosphere[] = ['oxidation', 'reduction', 'both'];
export const GLAZE_CLAY_TYPE_OPTIONS: GlazeClayType[] = ['stoneware', 'earthenware', 'porcelain'];
export const GLAZE_RESULT_OPTIONS: GlazeResultRating[] = ['bad', 'interesting', 'great'];
export const GLAZE_APPLICATION_METHOD_OPTIONS: GlazeApplicationMethod[] = ['dip', 'brush', 'pour', 'spray'];
export const GLAZE_THICKNESS_OPTIONS: GlazeThickness[] = ['thin', 'medium', 'thick'];
export const GLAZE_DEFECT_OPTIONS: GlazeDefect[] = ['crawling', 'crazing', 'pinholing', 'blistering', 'running', 'color-shift'];
export const GLAZE_KILN_TYPE_OPTIONS: GlazeKilnType[] = ['electric', 'gas', 'wood', 'soda', 'raku', 'other'];

export const GLAZE_FINISH_LABELS: Record<GlazeFinish, string> = {
  glossy: 'Glossy',
  matte: 'Matte',
  satin: 'Satin',
  crystalline: 'Crystalline',
};

export const GLAZE_SOURCE_LABELS: Record<GlazeSource, string> = {
  'store-bought': 'Store-Bought',
  custom: 'Custom',
};

export const GLAZE_STATUS_LABELS: Record<GlazeStatus, string> = {
  works_great: 'Works Great',
  experimental: 'Experimental',
  failed: 'Failed',
};

export const GLAZE_STATUS_EMOJI: Record<GlazeStatus, string> = {
  works_great: '✨',
  experimental: '🌻',
  failed: '🍂',
};

export const GLAZE_ATMOSPHERE_LABELS: Record<GlazeAtmosphere, string> = {
  oxidation: 'Oxidation',
  reduction: 'Reduction',
  both: 'Both',
};

export const GLAZE_CLAY_TYPE_LABELS: Record<GlazeClayType, string> = {
  stoneware: 'Stoneware',
  earthenware: 'Earthenware',
  porcelain: 'Porcelain',
};

export const GLAZE_RESULT_LABELS: Record<GlazeResultRating, string> = {
  bad: 'Never Again',
  interesting: 'Interesting',
  great: 'Success',
};

export const GLAZE_APPLICATION_METHOD_LABELS: Record<GlazeApplicationMethod, string> = {
  dip: 'Dip',
  brush: 'Brush',
  pour: 'Pour',
  spray: 'Spray',
};

export const GLAZE_THICKNESS_LABELS: Record<GlazeThickness, string> = {
  thin: 'Thin',
  medium: 'Medium',
  thick: 'Thick',
};

export const GLAZE_KILN_TYPE_LABELS: Record<GlazeKilnType, string> = {
  electric: 'Electric',
  gas: 'Gas',
  wood: 'Wood',
  soda: 'Soda',
  raku: 'Raku',
  other: 'Other',
};

export const GLAZE_DEFECT_LABELS: Record<GlazeDefect, string> = {
  crawling: 'Crawling',
  crazing: 'Crazing',
  pinholing: 'Pinholing',
  blistering: 'Blistering',
  running: 'Running',
  'color-shift': 'Color Shift',
};