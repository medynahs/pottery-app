import type { GlazeLibraryItem } from '../screens/glazes/types';
import type { Piece } from '../types/pieces';
import { useAppStore } from '../store/appStore';

/** Free-tier cap for cloud-backed studio media (piece/glaze photos, avatars). */
export const FREE_CLOUD_STORAGE_MB = 500;
export const FREE_CLOUD_STORAGE_BYTES = FREE_CLOUD_STORAGE_MB * 1024 * 1024;

/** Fallback when file size is unknown before upload. */
export const ESTIMATED_CLOUD_PHOTO_BYTES = 350 * 1024;

export function isRemoteMediaUri(uri: string | undefined | null): boolean {
  if (!uri?.trim()) return false;
  return /^https?:\/\//i.test(uri.trim());
}

export function isLocalMediaUri(uri: string | undefined | null): boolean {
  if (!uri?.trim()) return false;
  return !isRemoteMediaUri(uri);
}

function addMediaUri(uris: Set<string>, uri: string | undefined | null): void {
  const trimmed = uri?.trim();
  if (!trimmed) return;
  uris.add(trimmed);
}

function collectPieceMediaUris(piece: Piece, uris: Set<string>): void {
  // Dedup the cover by its stable assetId so the same backed-up photo isn't
  // counted twice across devices (each device hydrates it under a local uri).
  addMediaUri(uris, piece.coverAssetId ?? piece.photo ?? piece.imgUrl);
  for (const entry of piece.timeline) {
    for (const photo of entry.photos ?? []) {
      // Dedup uploaded photos by their stable assetId, pending ones by uri.
      addMediaUri(uris, photo.assetId ?? photo.uri);
    }
  }
}

function collectGlazeMediaUris(glaze: GlazeLibraryItem, uris: Set<string>): void {
  addMediaUri(uris, glaze.bucketPhotoUri);
  for (const uri of glaze.testTilePhotoUris ?? []) addMediaUri(uris, uri);
  for (const uri of glaze.finishedPiecePhotoUris ?? []) addMediaUri(uris, uri);
  for (const uri of glaze.accidentPhotoUris ?? []) addMediaUri(uris, uri);
}

export type CloudStorageSnapshot = {
  usedBytes: number;
  limitBytes: number | null;
  isPremium: boolean;
  atLimit: boolean;
  nearLimit: boolean;
};

/** Estimate bytes stored in cloud (remote + local pending upload). */
export function estimateCloudBytesUsedFromState(state?: {
  pieces: Piece[];
  glazes: GlazeLibraryItem[];
  avatarImageUri?: string | null;
  coverImageUri?: string | null;
}): number {
  const snapshot = state ?? readCloudStorageState();
  const uris = new Set<string>();

  for (const piece of snapshot.pieces) {
    if (piece.deleted) continue;
    collectPieceMediaUris(piece, uris);
  }
  for (const glaze of snapshot.glazes) {
    collectGlazeMediaUris(glaze, uris);
  }
  addMediaUri(uris, snapshot.avatarImageUri);
  addMediaUri(uris, snapshot.coverImageUri);

  return uris.size * ESTIMATED_CLOUD_PHOTO_BYTES;
}

function readCloudStorageState() {
  const { pieces, glazes, user } = useAppStore.getState();
  return {
    pieces,
    glazes,
    avatarImageUri: user.avatarImageUri,
    coverImageUri: user.coverImageUri,
  };
}

export function getCloudStorageSnapshot(): CloudStorageSnapshot {
  const isPremium = useAppStore.getState().isPremium;
  const usedBytes = estimateCloudBytesUsedFromState();
  const limitBytes = isPremium ? null : FREE_CLOUD_STORAGE_BYTES;
  const atLimit = limitBytes != null && usedBytes >= limitBytes;
  const nearLimit = limitBytes != null && usedBytes >= limitBytes * 0.85;
  return { usedBytes, limitBytes, isPremium, atLimit, nearLimit };
}

export function canUploadBytesToCloud(additionalBytes = ESTIMATED_CLOUD_PHOTO_BYTES): boolean {
  if (useAppStore.getState().isPremium) return true;
  const { usedBytes } = getCloudStorageSnapshot();
  return usedBytes + additionalBytes <= FREE_CLOUD_STORAGE_BYTES;
}

export function formatCloudStorageMb(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) return '<0.1 MB';
  if (mb < 10) return `${mb.toFixed(1)} MB`;
  return `${Math.round(mb)} MB`;
}

export function formatCloudStorageLabel(snapshot = getCloudStorageSnapshot()): string {
  if (snapshot.isPremium) return 'Unlimited cloud storage';
  const used = formatCloudStorageMb(snapshot.usedBytes);
  return `Cloud: ${used} / ${FREE_CLOUD_STORAGE_MB} MB`;
}

export function countPieceCloudBackedPhotos(piece: Piece): number {
  // Cover is not counted: it always backs up free (see uploadCoverPhoto). This
  // cap governs timeline extras only.
  let count = 0;
  for (const entry of piece.timeline) {
    for (const photo of entry.photos ?? []) {
      if (photo.assetId) count += 1;
    }
  }
  return count;
}

/** Free tier: one cloud-backed timeline photo per piece; the cover backs up free (local-only extras allowed). */
export function canSyncPiecePhotoToCloud(
  piece: Piece,
  isReplacing: boolean,
  additionalBytes = ESTIMATED_CLOUD_PHOTO_BYTES,
): boolean {
  if (useAppStore.getState().isPremium) {
    return canUploadBytesToCloud(additionalBytes);
  }
  if (!isReplacing && countPieceCloudBackedPhotos(piece) >= 1) {
    return false;
  }
  return canUploadBytesToCloud(additionalBytes);
}
export function canUploadProfileMedia(additionalBytes = ESTIMATED_CLOUD_PHOTO_BYTES): boolean {
  return canUploadBytesToCloud(additionalBytes);
}

export function canUploadGlazeMedia(additionalBytes = ESTIMATED_CLOUD_PHOTO_BYTES): boolean {
  return canUploadBytesToCloud(additionalBytes);
}
