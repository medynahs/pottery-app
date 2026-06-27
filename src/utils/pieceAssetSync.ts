/**
 * Piece photo cloud sync — uploads local journal/cover photos to the assets API
 * and hydrates remote URLs when pulling pieces on a new device.
 */
import {
  LOCAL_STAGE_TO_API,
  apiDeletePieceAsset,
  apiListPieceAssets,
  apiUpdatePieceAsset,
  apiUploadPieceAsset,
  type ApiPieceStatus,
  type BackendPieceAsset,
} from '../services/pieces';
import { setPiecesIfChanged, useAppStore } from '../store/appStore';
import type { Piece, TimelineEntry } from '../types/pieces';
import { canSyncPiecePhotoToCloud, isLocalMediaUri, isRemoteMediaUri } from './cloudStorage';

const ASSET_SYNC_DEBOUNCE_MS = 600;

function guessMimeType(uri: string): string {
  const lower = uri.split('?')[0].split('#')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function localImageFileFromUri(uri: string): { uri: string; name: string; type: string } {
  const mime = guessMimeType(uri);
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const base = uri.split('/').pop()?.split('?')[0];
  const name = base && base.includes('.') ? base : `piece-photo.${ext}`;
  return { uri, name, type: mime };
}

function localStageToApiStatus(stage: string): ApiPieceStatus {
  return LOCAL_STAGE_TO_API[stage] ?? 'idea';
}

function timelineEntryMatchesApiStatus(entryStage: string, apiStatus: ApiPieceStatus): boolean {
  return localStageToApiStatus(entryStage) === apiStatus;
}

function findTimelineEntryIndex(
  timeline: TimelineEntry[],
  apiStatus: ApiPieceStatus,
  assetCreatedAt: string,
): number {
  const candidates = timeline
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => timelineEntryMatchesApiStatus(entry.stage, apiStatus));

  if (candidates.length === 0) return -1;
  if (candidates.length === 1) return candidates[0].index;

  const assetTime = new Date(assetCreatedAt).getTime();
  let best = candidates[0];
  let bestDelta = Math.abs(new Date(best.entry.timestamp).getTime() - assetTime);
  for (const candidate of candidates.slice(1)) {
    const delta = Math.abs(new Date(candidate.entry.timestamp).getTime() - assetTime);
    if (delta < bestDelta) {
      best = candidate;
      bestDelta = delta;
    }
  }
  return best.index;
}

function collectRemoteUris(piece: Piece): Set<string> {
  const uris = new Set<string>();
  const cover = piece.photo ?? piece.imgUrl;
  if (cover && isRemoteMediaUri(cover)) uris.add(cover);
  for (const entry of piece.timeline) {
    for (const photo of entry.photos ?? []) {
      if (isRemoteMediaUri(photo)) uris.add(photo);
    }
  }
  return uris;
}

/** Merge backend assets into a local piece without clobbering pending local uploads. */
export function mergeAssetsIntoPiece(piece: Piece, assets: BackendPieceAsset[]): Piece {
  if (!assets.length) return piece;

  const sorted = [...assets].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const coverAssets = sorted.filter((asset) => !asset.status);
  const stageAssets = sorted.filter((asset) => asset.status);

  let updated: Piece = { ...piece };
  const photoAssetIds = { ...(piece.photoAssetIds ?? {}) };

  const cover = piece.photo ?? piece.imgUrl;
  const canApplyCover = !cover || isRemoteMediaUri(cover);
  const latestCover = coverAssets[coverAssets.length - 1];
  if (canApplyCover && latestCover?.url) {
    updated = {
      ...updated,
      photo: latestCover.url,
      imgUrl: latestCover.url,
      coverAssetId: latestCover.id,
    };
    photoAssetIds[latestCover.url] = latestCover.id;
  }

  const timeline = piece.timeline.map((entry) => ({
    ...entry,
    photos: [...(entry.photos ?? [])],
  }));

  for (const asset of stageAssets) {
    if (!asset.status || !asset.url) continue;
    const entryIndex = findTimelineEntryIndex(timeline, asset.status, asset.created_at);
    if (entryIndex < 0) continue;

    const entry = timeline[entryIndex];
    const photos = [...(entry.photos ?? [])];
    const hasLocalOnly = photos.some(isLocalMediaUri);
    if (hasLocalOnly && !photos.includes(asset.url)) {
      // Pending local uploads take priority; remote will merge after upload.
      continue;
    }
    if (!photos.includes(asset.url)) {
      photos.push(asset.url);
      timeline[entryIndex] = { ...entry, photos };
      photoAssetIds[asset.url] = asset.id;
    } else if (!photoAssetIds[asset.url]) {
      photoAssetIds[asset.url] = asset.id;
    }
  }

  updated = { ...updated, timeline, photoAssetIds };
  return updated;
}

export function pieceHasPendingLocalPhotos(piece: Piece): boolean {
  const cover = piece.photo ?? piece.imgUrl;
  if (cover && isLocalMediaUri(cover)) return true;
  return piece.timeline.some((entry) => entry.photos?.some(isLocalMediaUri));
}

function applyCoverFromAsset(piece: Piece, asset: BackendPieceAsset): Piece {
  const photoAssetIds = { ...(piece.photoAssetIds ?? {}) };
  photoAssetIds[asset.url] = asset.id;
  return {
    ...piece,
    photo: asset.url,
    imgUrl: asset.url,
    coverAssetId: asset.id,
    photoAssetIds,
  };
}

function applyTimelinePhotoFromAsset(
  piece: Piece,
  entryIndex: number,
  photoIndex: number,
  previousUri: string,
  asset: BackendPieceAsset,
): Piece {
  const timeline = piece.timeline.map((entry, index) => {
    if (index !== entryIndex) return entry;
    const photos = [...(entry.photos ?? [])];
    photos[photoIndex] = asset.url;
    return { ...entry, photos };
  });
  const photoAssetIds = { ...(piece.photoAssetIds ?? {}) };
  delete photoAssetIds[previousUri];
  photoAssetIds[asset.url] = asset.id;
  return { ...piece, timeline, photoAssetIds };
}

async function uploadCoverPhoto(
  piece: Piece,
): Promise<Piece> {
  const coverUri = piece.photo ?? piece.imgUrl;
  if (!coverUri || !piece.backendId || !isLocalMediaUri(coverUri)) return piece;

  if (!canSyncPiecePhotoToCloud(piece, !!piece.coverAssetId)) return piece;

  const file = localImageFileFromUri(coverUri);
  const asset = piece.coverAssetId
    ? await apiUpdatePieceAsset(piece.backendId, piece.coverAssetId, { file })
    : await apiUploadPieceAsset(piece.backendId, file);

  return applyCoverFromAsset(piece, asset);
}

async function deleteOrphanedAssets(
  piece: Piece,
  before: Piece,
): Promise<Piece> {
  if (!piece.backendId) return piece;

  let current = piece;
  const beforeCover = before.photo ?? before.imgUrl;
  const afterCover = current.photo ?? current.imgUrl;

  if (before.coverAssetId && beforeCover && !afterCover) {
    try {
      await apiDeletePieceAsset(piece.backendId, before.coverAssetId);
    } catch {
      // suppress — local state still cleared
    }
    const photoAssetIds = { ...(current.photoAssetIds ?? {}) };
    if (beforeCover) delete photoAssetIds[beforeCover];
    current = { ...current, coverAssetId: undefined, photoAssetIds };
  }

  const beforeRemote = collectRemoteUris(before);
  const afterRemote = collectRemoteUris(current);
  const photoAssetIds = { ...(current.photoAssetIds ?? {}) };

  for (const uri of beforeRemote) {
    if (afterRemote.has(uri)) continue;
    const assetId = before.photoAssetIds?.[uri];
    if (!assetId) continue;
    try {
      await apiDeletePieceAsset(piece.backendId, assetId);
    } catch {
      // suppress
    }
    delete photoAssetIds[uri];
  }

  return { ...current, photoAssetIds };
}

async function uploadTimelinePhotos(
  piece: Piece,
): Promise<Piece> {
  if (!piece.backendId) return piece;

  let current = piece;

  for (let entryIndex = 0; entryIndex < current.timeline.length; entryIndex += 1) {
    const entry = current.timeline[entryIndex];
    const photos = entry.photos ?? [];

    for (let photoIndex = 0; photoIndex < photos.length; photoIndex += 1) {
      const uri = photos[photoIndex];
      if (!isLocalMediaUri(uri)) continue;
      if (!canSyncPiecePhotoToCloud(current, !!current.photoAssetIds?.[uri])) continue;

      const file = localImageFileFromUri(uri);
      const apiStatus = localStageToApiStatus(entry.stage);
      const existingId = current.photoAssetIds?.[uri];

      const asset = existingId
        ? await apiUpdatePieceAsset(piece.backendId, existingId, {
            file,
            status: apiStatus,
          })
        : await apiUploadPieceAsset(piece.backendId, file, apiStatus);

      current = applyTimelinePhotoFromAsset(current, entryIndex, photoIndex, uri, asset);
    }
  }

  return current;
}

export async function flushPiecePhotoSync(pieceId: number): Promise<void> {
  const isSignedIn = useAppStore.getState().isSignedIn;
  if (!isSignedIn) return;

  const piece = useAppStore.getState().pieces.find((p) => p.id === pieceId);
  if (!piece || piece.deleted) return;

  if (!piece.backendId) {
    return;
  }

  const before = piece;
  let current = piece;
  let uploaded = 0;

  try {
    const coverBefore = current.photo ?? current.imgUrl;
    if (coverBefore && isLocalMediaUri(coverBefore)) {
      const next = await uploadCoverPhoto(current);
      if ((next.photo ?? next.imgUrl) !== coverBefore && isRemoteMediaUri(next.photo ?? next.imgUrl)) {
        uploaded += 1;
      }
      current = next;
    }

    const timelineBefore = JSON.stringify(current.timeline);
    current = await uploadTimelinePhotos(current);
    if (JSON.stringify(current.timeline) !== timelineBefore) {
      uploaded += 1;
    }

    current = await deleteOrphanedAssets(current, before);

    const changed = JSON.stringify(current) !== JSON.stringify(before);
    if (changed) {
      setPiecesIfChanged(
        useAppStore.getState().pieces.map((p) => (p.id === pieceId ? current : p)),
      );
    }

    if (uploaded > 0) {
      useAppStore.getState().showToast('Photo backed up to the cloud', 'success');
    }
  } catch (err) {
    if (__DEV__) console.warn(`[pieces:asset:sync] failed for piece ${pieceId}:`, err);
    if (pieceHasPendingLocalPhotos(piece)) {
      useAppStore.getState().showToast('Photo saved on this device · cloud backup pending', 'success');
    }
  }
}

const syncTimers = new Map<number, ReturnType<typeof setTimeout>>();
const syncInFlight = new Set<number>();

export function schedulePiecePhotoSync(pieceId: number): void {
  const existing = syncTimers.get(pieceId);
  if (existing) clearTimeout(existing);
  syncTimers.set(
    pieceId,
    setTimeout(() => {
      syncTimers.delete(pieceId);
      if (syncInFlight.has(pieceId)) return;
      syncInFlight.add(pieceId);
      void flushPiecePhotoSync(pieceId).finally(() => {
        syncInFlight.delete(pieceId);
      });
    }, ASSET_SYNC_DEBOUNCE_MS),
  );
}

export function scheduleAllPendingPiecePhotoSync(): void {
  for (const piece of useAppStore.getState().pieces) {
    if (!piece.deleted && piece.backendId && pieceHasPendingLocalPhotos(piece)) {
      schedulePiecePhotoSync(piece.id);
    }
  }
}

let hydrateInFlight = false;

/** Pull cloud asset URLs for all backend-linked pieces (e.g. after sign-in on a new device). */
export async function hydrateAllPieceAssetsFromCloud(): Promise<void> {
  const { pieces } = useAppStore.getState();
  if (!isSignedIn || hydrateInFlight) return;

  const targets = pieces.filter((piece) => piece.backendId && !piece.deleted);
  if (targets.length === 0) return;

  hydrateInFlight = true;
  try {
    const updates = new Map<number, Piece>();

    await Promise.all(
      targets.map(async (piece) => {
        try {
          const assets = await apiListPieceAssets(piece.backendId!);
          if (!assets.length) return;
          const merged = mergeAssetsIntoPiece(piece, assets);
          if (JSON.stringify(merged) !== JSON.stringify(piece)) {
            updates.set(piece.id, merged);
          }
        } catch (err) {
          if (__DEV__) console.warn(`[pieces:asset:hydrate] failed for ${piece.backendId}:`, err);
        }
      }),
    );

    if (updates.size > 0) {
      setPiecesIfChanged(
        useAppStore.getState().pieces.map((piece) => updates.get(piece.id) ?? piece),
      );
      if (__DEV__) console.log(`[pieces:asset:hydrate] merged photos for ${updates.size} piece(s)`);
    }
  } finally {
    hydrateInFlight = false;
  }
}
