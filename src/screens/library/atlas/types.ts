import type {
    GlazeAtmosphere,
    GlazeClayType,
    GlazeDefect,
    GlazeFinish,
    GlazeIngredient,
    GlazeLibraryItem,
    GlazeResultRating,
    GlazeStatus,
    GlazeTestTile,
} from '@/src/screens/glazes/types';

export type AddMode = 'quick' | 'advanced';

export type GlazeDraft = {
  name: string;
  finish: GlazeFinish;
  colorFamily: string;
  coneRange: string;
  defaultCone: string;
  source: GlazeLibraryItem['source'];
  recipeIngredients: GlazeIngredient[];
  dateMixed: string;
  status: GlazeStatus;
  bestClayType?: GlazeClayType;
  bestFiringTempC: string;
  atmosphere?: GlazeAtmosphere;
  notes: string;
  applicationNotes: string;
  supplier: string;
  batchSize: string;
  recipeNotes: string;
  tags: string;
  collections: string[];
  favorite: boolean;
  production: boolean;
  bucketPhotoUri?: string;
  firstTilePhotoUri?: string;
  firstPiecePhotoUri?: string;
};

export type TestDraft = {
  glazeId: string;
  clayBody: string;
  cone: string;
  kilnName: string;
  kilnType: GlazeTestTile['kilnType'];
  applicationMethod: GlazeTestTile['applicationMethod'];
  thickness: GlazeTestTile['thickness'];
  layeredWith: string;
  shelfPosition: string;
  firingDate: string;
  photoUri?: string;
  notes: string;
  resultRating: GlazeResultRating;
  defects: GlazeDefect[];
};
