// Glazes API, /users/me/glazes
// All endpoints require an X-Session-Token header from Ory Kratos.
//
// The backend stores a glaze's images in a child table tagged by gallery type;
// the app keeps four separate photo fields. The mappers below split a backend
// `images[]` into those four fields on the way in. Images are NOT part of the
// sync snapshot, they upload through the dedicated image endpoints.

import { normalizeGlazeItem } from '../screens/glazes/glazeItemHelpers';
import type {
  GlazeApplicationMethod,
  GlazeClayType,
  GlazeFinish,
  GlazeIngredient,
  GlazeKilnType,
  GlazeLibraryItem,
  GlazeResultRating,
  GlazeSource,
  GlazeTestTile,
  GlazeThickness,
} from '../screens/glazes/types';
import { API_BASE_URL } from './index';

// ─── Backend types ────────────────────────────────────────────────────────────

export type GlazeImageType = 'bucket' | 'test-tile' | 'finished-piece' | 'accident';

export interface BackendGlazeImage {
  id: string;
  url: string;
  type: GlazeImageType;
}

export interface BackendGlaze {
  id: string;
  clientRef?: string;
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
  recipeIngredients: GlazeIngredient[];
  tags: string[];
  collections: string[];
  favorite: boolean;
  production: boolean;
  images: BackendGlazeImage[];
  clayBodiesUsed: string[];
  kilnTypesUsed: string[];
  conesTested: string[];
  lastTestedAt?: string;
  createdAt: string;
  ingredientsText?: string;
  batchId?: string;
  dateMixed?: string;
  status?: GlazeLibraryItem['status'];
  bestClayType?: GlazeLibraryItem['bestClayType'];
  bestFiringTempC?: number;
  atmosphere?: GlazeLibraryItem['atmosphere'];
}

type RawBackendGlaze = BackendGlaze & {
  batch_id?: string;
  date_mixed?: string;
  ingredients_text?: string;
  best_clay_type?: GlazeLibraryItem['bestClayType'];
  best_firing_temp_c?: number;
};

/** Accept camelCase or snake_case glaze rows from list/sync responses. */
export function normalizeBackendGlaze(raw: RawBackendGlaze): BackendGlaze {
  return {
    ...raw,
    ingredientsText: raw.ingredientsText ?? raw.ingredients_text,
    batchId: raw.batchId ?? raw.batch_id,
    dateMixed: raw.dateMixed ?? raw.date_mixed,
    bestClayType: raw.bestClayType ?? raw.best_clay_type,
    bestFiringTempC: raw.bestFiringTempC ?? raw.best_firing_temp_c,
  };
}

export interface BackendGlazeTest {
  id: string;
  clientRef?: string;
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
  defects: string[];
  clayType?: GlazeClayType;
}

// ─── Sync payloads ──────────────────────────────────────────────────────────

export interface GlazeSyncItem {
  clientRef: string;
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
  recipeIngredients: GlazeIngredient[];
  tags: string[];
  collections: string[];
  favorite: boolean;
  production: boolean;
  clayBodiesUsed: string[];
  kilnTypesUsed: string[];
  conesTested: string[];
  lastTestedAt?: string;
  deleted?: boolean;
  /** Client-side batch metadata, server may ignore until supported. */
  ingredientsText?: string;
  batchId?: string;
  dateMixed?: string;
  status?: GlazeLibraryItem['status'];
  bestClayType?: GlazeLibraryItem['bestClayType'];
  bestFiringTempC?: number;
  atmosphere?: GlazeLibraryItem['atmosphere'];
  versionNumber?: number;
  rootGlazeId?: string;
  parentGlazeId?: string;
  /** Client-side discover provenance, server may ignore until BE-10. */
  discoverSourceRecipeId?: string;
  discoverSavedAt?: string;
}

export interface GlazeTestSyncItem {
  clientRef: string;
  /** The parent glaze's device id, so the server can link a test to a glaze
   *  created in the same sync (before it has a backend id). */
  glazeClientRef: string;
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
  defects: string[];
  clayType?: GlazeClayType;
  deleted?: boolean;
}

export interface SyncGlazesRequest {
  glazes: GlazeSyncItem[];
  tests: GlazeTestSyncItem[];
}

export interface SyncGlazesResponse {
  glazes: BackendGlaze[];
  tests: BackendGlazeTest[];
  clientRefMap: Record<string, string>;
}

export interface GlazeImageUploadResponse {
  message: string;
  glazeId: string;
  image: BackendGlazeImage;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

/** Split a backend image list into the app's four photo fields. */
function imagesToPhotoFields(images: BackendGlazeImage[]): Pick<
  GlazeLibraryItem,
  'bucketPhotoUri' | 'testTilePhotoUris' | 'finishedPiecePhotoUris' | 'accidentPhotoUris'
> {
  return {
    bucketPhotoUri: images.find((i) => i.type === 'bucket')?.url,
    testTilePhotoUris: images.filter((i) => i.type === 'test-tile').map((i) => i.url),
    finishedPiecePhotoUris: images.filter((i) => i.type === 'finished-piece').map((i) => i.url),
    accidentPhotoUris: images.filter((i) => i.type === 'accident').map((i) => i.url),
  };
}

/**
 * Merge a backend glaze into the local shape. `existing` preserves any
 * local-only fields and is used as the id source so the local `id` (device
 * client_ref) stays stable.
 *
 * Photo fields are only derived from the backend `images[]` on a fresh pull. For
 * an existing local glaze they are preserved, because images aren't part of the
 * sync round-trip, overwriting them would wipe a freshly-picked, not-yet-
 * uploaded photo the moment the text sync returns.
 */
export function backendGlazeToLocal(b: BackendGlaze, existing?: GlazeLibraryItem): GlazeLibraryItem {
  const id = existing?.id ?? b.clientRef ?? b.id;
  const photos = existing
    ? {
      bucketPhotoUri: existing.bucketPhotoUri,
      testTilePhotoUris: existing.testTilePhotoUris,
      finishedPiecePhotoUris: existing.finishedPiecePhotoUris,
      accidentPhotoUris: existing.accidentPhotoUris,
    }
    : imagesToPhotoFields(b.images ?? []);
  return normalizeGlazeItem({
    ...(existing ?? {}),
    id,
    backendId: b.id,
    syncDirty: false,
    name: b.name,
    finish: b.finish,
    colorFamily: b.colorFamily,
    coneRange: b.coneRange,
    defaultCone: b.defaultCone,
    source: b.source,
    notes: b.notes,
    applicationNotes: b.applicationNotes,
    supplier: b.supplier,
    batchSize: b.batchSize,
    recipeNotes: b.recipeNotes,
    recipeIngredients: b.recipeIngredients ?? [],
    tags: b.tags ?? [],
    collections: b.collections ?? [],
    favorite: b.favorite,
    production: b.production,
    ...photos,
    clayBodiesUsed: b.clayBodiesUsed ?? [],
    kilnTypesUsed: b.kilnTypesUsed ?? [],
    conesTested: b.conesTested ?? [],
    lastTestedAt: b.lastTestedAt,
    createdAt: b.createdAt,
    ingredientsText: b.ingredientsText,
    batchId: b.batchId,
    dateMixed: b.dateMixed,
    status: b.status,
    bestClayType: b.bestClayType,
    bestFiringTempC: b.bestFiringTempC,
    atmosphere: b.atmosphere,
  });
}

export function localGlazeToSyncItem(g: GlazeLibraryItem, deleted = false): GlazeSyncItem {
  return {
    clientRef: String(g.id),
    name: g.name,
    finish: g.finish,
    colorFamily: g.colorFamily,
    coneRange: g.coneRange,
    defaultCone: g.defaultCone,
    source: g.source,
    notes: g.notes,
    applicationNotes: g.applicationNotes,
    supplier: g.supplier,
    batchSize: g.batchSize,
    recipeNotes: g.recipeNotes,
    recipeIngredients: g.recipeIngredients ?? [],
    tags: g.tags ?? [],
    collections: g.collections ?? [],
    favorite: g.favorite,
    production: g.production,
    clayBodiesUsed: g.clayBodiesUsed ?? [],
    kilnTypesUsed: g.kilnTypesUsed ?? [],
    conesTested: g.conesTested ?? [],
    lastTestedAt: g.lastTestedAt,
    ingredientsText: g.ingredientsText,
    batchId: g.batchId,
    dateMixed: g.dateMixed,
    status: g.status,
    bestClayType: g.bestClayType,
    bestFiringTempC: g.bestFiringTempC,
    atmosphere: g.atmosphere,
    versionNumber: g.versionNumber,
    rootGlazeId: g.rootGlazeId,
    parentGlazeId: g.parentGlazeId,
    discoverSourceRecipeId: g.discoverSourceRecipeId,
    discoverSavedAt: g.discoverSavedAt,
    ...(deleted ? { deleted: true } : {}),
  };
}

export function backendTestToLocal(b: BackendGlazeTest, existing?: GlazeTestTile): GlazeTestTile {
  return {
    ...(existing ?? {}),
    id: existing?.id ?? b.clientRef ?? b.id,
    backendId: b.id,
    syncDirty: false,
    glazeId: existing?.glazeId ?? b.glazeId,
    glazeNameSnapshot: b.glazeNameSnapshot,
    clayBody: b.clayBody,
    cone: b.cone,
    kilnName: b.kilnName,
    kilnType: b.kilnType,
    applicationMethod: b.applicationMethod,
    thickness: b.thickness,
    layeredWith: b.layeredWith ?? [],
    shelfPosition: b.shelfPosition,
    firingDate: b.firingDate,
    photoUri: b.photoUri,
    notes: b.notes,
    resultRating: b.resultRating,
    defects: (b.defects ?? []) as GlazeTestTile['defects'],
    clayType: b.clayType,
  };
}

/**
 * @param glazeClientRef the parent glaze's device id (its local `id`).
 */
export function localTestToSyncItem(
  t: GlazeTestTile,
  glazeClientRef: string,
  deleted = false,
): GlazeTestSyncItem {
  return {
    clientRef: String(t.id),
    glazeClientRef,
    glazeNameSnapshot: t.glazeNameSnapshot,
    clayBody: t.clayBody,
    cone: t.cone,
    kilnName: t.kilnName,
    kilnType: t.kilnType,
    applicationMethod: t.applicationMethod,
    thickness: t.thickness,
    layeredWith: t.layeredWith ?? [],
    shelfPosition: t.shelfPosition,
    firingDate: t.firingDate,
    photoUri: t.photoUri,
    notes: t.notes,
    resultRating: t.resultRating,
    defects: t.defects ?? [],
    clayType: t.clayType,
    ...(deleted ? { deleted: true } : {}),
  };
}

// ─── Internal helper ─────────────────────────────────────────────────────────

async function authedFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

// ─── Glaze CRUD ─────────────────────────────────────────────────────────────

/** GET /users/me/glazes, list live glazes (each with its images). */
export async function apiListGlazes(
    ): Promise<BackendGlaze[]> {
  const res = await authedFetch(`${API_BASE_URL}/users/me/glazes`);
  if (!res.ok) throw new Error(`listGlazes failed (${res.status})`);
  const rows = (await res.json()) as RawBackendGlaze[];
  return rows.map(normalizeBackendGlaze);
}

/** GET /users/me/glazes/tests, list live test tiles across all glazes. */
export async function apiListGlazeTests(
    ): Promise<BackendGlazeTest[]> {
  const res = await authedFetch(`${API_BASE_URL}/users/me/glazes/tests`);
  if (!res.ok) throw new Error(`listGlazeTests failed (${res.status})`);
  return res.json() as Promise<BackendGlazeTest[]>;
}

/**
 * POST /users/me/glazes/sync, push device snapshots of glazes and tests; the
 * server returns the authoritative live lists plus a client_ref → backend id map.
 */
export async function apiSyncGlazes(
    payload: SyncGlazesRequest,
): Promise<SyncGlazesResponse> {
  const res = await authedFetch(`${API_BASE_URL}/users/me/glazes/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`syncGlazes failed (${res.status})`);
  const data = (await res.json()) as SyncGlazesResponse;
  return {
    ...data,
    glazes: data.glazes.map((g) => normalizeBackendGlaze(g as RawBackendGlaze)),
  };
}

/** POST /users/me/glazes/:glaze_id/images, upload an image under a gallery type. */
export async function apiUploadGlazeImage(
    glazeBackendId: string,
  file: { uri: string; name: string; type: string },
  imageType: GlazeImageType,
): Promise<GlazeImageUploadResponse> {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  form.append('type', imageType);

  const res = await authedFetch(
    `${API_BASE_URL}/users/me/glazes/${glazeBackendId}/images`,
    {
      method: 'POST',
      // Do NOT set Content-Type, let fetch inject the multipart boundary.
      body: form as unknown as BodyInit_,
    },
  );
  if (!res.ok) throw new Error(`uploadGlazeImage failed (${res.status})`);
  return res.json() as Promise<GlazeImageUploadResponse>;
}

/** DELETE /users/me/glazes/:glaze_id/images/:image_id, remove an image record. */
export async function apiDeleteGlazeImage(
    glazeBackendId: string,
  imageId: string,
): Promise<void> {
  const res = await authedFetch(
    `${API_BASE_URL}/users/me/glazes/${glazeBackendId}/images/${imageId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error(`deleteGlazeImage failed (${res.status})`);
}
