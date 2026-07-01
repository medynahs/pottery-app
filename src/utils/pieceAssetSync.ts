/**
 * Piece photo cloud sync ("shoebox"). The backend registry stores only blobs;
 * which entry (or the cover slot) a photo belongs to lives in the piece doc as
 * assetId refs. Photos are keyed on the stable asset UUID (`PiecePhoto.assetId`),
 * never on the uri:
 *   - sync-up uploads any local photo that has no assetId yet, then stamps the
 *     assetId onto it and re-syncs the piece so the backend doc picks up the ref.
 *   - a photo that already has an assetId is backed up, so it's skipped (this is
 *     what stops downloaded files from being re-uploaded).
 *   - orphan reconcile diffs assetId sets against the bulk asset list, so it
 *     survives url rotation.
 *   - hydrate resolves each ref's fresh url and downloads it to a local file so
 *     the image survives presigned-url expiry on a second device.
 *
 * The cover (`piece.photo` render string + `coverAssetId` backup id) follows the
 * same rules: it stays a local file, backs up once, and hydrates by download.
 * Picking/replacing/removing the cover clears `coverAssetId` so sync re-backs-up
 * (new) or reconcile deletes the orphan (removed). `coverAssetId` rides in the
 * synced doc, so a fresh device knows which asset is the cover.
 */
import * as FileSystem from 'expo-file-system/legacy';
import {
  apiDeletePieceAsset,
  apiListAllPieceAssets,
  apiUploadPieceAsset,
  type BackendPieceAsset,
} from '../services/pieces';
import { schedulePiecesSync } from '../screens/pieces/hooks/usePiecesSync';
import { setPiecesIfChanged, useAppStore } from '../store/appStore';
import type { Piece } from '../types/pieces';
import { canSyncPiecePhotoToCloud, isLocalMediaUri } from './cloudStorage';

const ASSET_SYNC_DEBOUNCE_MS = 600;

// ─── File helpers ─────────────────────────────────────────────────────────────

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

const ASSET_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}piece-assets/`;

async function ensureAssetDir(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(ASSET_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(ASSET_DIR, { intermediates: true });
  } catch {
    // best-effort; download will fall back to the remote url
  }
}

/**
 * Download a remote asset url to a stable local file named by assetId. Returns
 * the local uri, or null if the download failed (caller falls back to the url).
 */
async function downloadAssetToLocal(assetId: string, url: string): Promise<string | null> {
  try {
    await ensureAssetDir();
    const mime = guessMimeType(url);
    const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    const target = `${ASSET_DIR}${assetId}.${ext}`;
    const info = await FileSystem.getInfoAsync(target);
    if (info.exists) return info.uri;
    const res = await FileSystem.downloadAsync(url, target);
    return res.uri;
  } catch {
    return null;
  }
}

// ─── Pending / identity helpers ───────────────────────────────────────────────

export function pieceHasPendingLocalPhotos(piece: Piece): boolean {
  const cover = piece.photo ?? piece.imgUrl;
  if (cover && isLocalMediaUri(cover) && !piece.coverAssetId) return true;
  return piece.timeline.some((entry) =>
    entry.photos?.some((photo) => !photo.assetId && isLocalMediaUri(photo.uri)),
  );
}

function referencedAssetIds(piece: Piece): Set<string> {
  const ids = new Set<string>();
  for (const entry of piece.timeline) {
    for (const photo of entry.photos ?? []) {
      if (photo.assetId) ids.add(photo.assetId);
    }
  }
  if (piece.coverAssetId) ids.add(piece.coverAssetId);
  return ids;
}

// ─── Cover (re-keyed on coverAssetId, stays a local file) ─────────────────────

async function uploadCoverPhoto(piece: Piece): Promise<{ piece: Piece; uploaded: number }> {
  const coverUri = piece.photo ?? piece.imgUrl;
  // Upload only a local cover that isn't backed up yet. Picking/replacing the
  // cover clears coverAssetId, so a set id means "already backed up, skip".
  if (!coverUri || !piece.backendId || !isLocalMediaUri(coverUri) || piece.coverAssetId) {
    return { piece, uploaded: 0 };
  }
  // ponytail: cover is the piece's single primary photo, always backable (bytes
  // permitting). The per-piece free cap governs extra timeline photos.
  if (!canSyncPiecePhotoToCloud(piece, true)) return { piece, uploaded: 0 };

  const file = localImageFileFromUri(coverUri);
  const asset = await apiUploadPieceAsset(piece.backendId, file);
  // Keep the local uri for rendering; just stamp the backup id.
  return { piece: { ...piece, coverAssetId: asset.id }, uploaded: 1 };
}

// ─── Timeline upload (re-keyed on assetId) ────────────────────────────────────

async function uploadTimelinePhotos(piece: Piece): Promise<{ piece: Piece; uploaded: number }> {
  if (!piece.backendId) return { piece, uploaded: 0 };

  let uploaded = 0;
  const timeline = piece.timeline.map((entry) => ({ ...entry, photos: [...(entry.photos ?? [])] }));

  for (const entry of timeline) {
    for (let pi = 0; pi < entry.photos.length; pi += 1) {
      const photo = entry.photos[pi];
      if (photo.assetId) continue; // already backed up
      if (!isLocalMediaUri(photo.uri)) continue; // remote/empty, nothing local to push
      if (!canSyncPiecePhotoToCloud({ ...piece, timeline }, false)) continue; // free-tier cap

      const file = localImageFileFromUri(photo.uri);
      const asset = await apiUploadPieceAsset(piece.backendId, file);
      entry.photos[pi] = { ...photo, assetId: asset.id }; // keep local uri, add the id
      uploaded += 1;
    }
  }

  return uploaded > 0 ? { piece: { ...piece, timeline }, uploaded } : { piece, uploaded: 0 };
}

// ─── Orphan reconcile (global, against the bulk asset list) ───────────────────

let reconcileTimer: ReturnType<typeof setTimeout> | null = null;
let reconcileInFlight = false;
const RECONCILE_DEBOUNCE_MS = 5000;

/**
 * Delete backend assets no local piece references anymore (photo deletes and
 * replacements mutate the store before sync; this is the cleanup pass). One
 * bulk list call for the whole account. Pieces that are locally dirty, deleted
 * or unknown are skipped — don't judge mid-edit or mid-pull state.
 *
 * ponytail: "not referenced by my local piece" = orphan. Ceiling: a photo
 * added on another device in the narrow window before this device pulls its
 * doc ref could look orphaned here. Acceptable for a local-first, single-user
 * journal; upgrade path = per-photo tombstones if concurrent multi-device
 * photo editing ever matters.
 */
async function reconcileCloudAssets(): Promise<void> {
  if (!useAppStore.getState().isSignedIn || reconcileInFlight) return;
  reconcileInFlight = true;

  try {
    const assets = await apiListAllPieceAssets();
    if (!assets.length) return;

    const referencedByPiece = new Map<string, Set<string>>();
    for (const piece of useAppStore.getState().pieces) {
      if (!piece.backendId || piece.deleted || piece.syncDirty) continue;
      referencedByPiece.set(piece.backendId, referencedAssetIds(piece));
    }

    for (const asset of assets) {
      const referenced = referencedByPiece.get(asset.piece_id);
      if (!referenced || referenced.has(asset.id)) continue;
      try {
        await apiDeletePieceAsset(asset.piece_id, asset.id);
      } catch {
        // suppress — retry on the next reconcile
      }
    }
  } catch {
    // can't list right now, retry on the next schedule
  } finally {
    reconcileInFlight = false;
  }
}

function scheduleAssetReconcile(): void {
  if (reconcileTimer) clearTimeout(reconcileTimer);
  reconcileTimer = setTimeout(() => {
    reconcileTimer = null;
    void reconcileCloudAssets();
  }, RECONCILE_DEBOUNCE_MS);
}

// ─── Push flush ───────────────────────────────────────────────────────────────

export async function flushPiecePhotoSync(pieceId: number): Promise<void> {
  if (!useAppStore.getState().isSignedIn) return;

  const piece = useAppStore.getState().pieces.find((p) => p.id === pieceId);
  if (!piece || piece.deleted || !piece.backendId) return;

  const before = piece;
  let current = piece;
  let uploaded = 0;

  try {
    const cover = await uploadCoverPhoto(current);
    current = cover.piece;
    uploaded += cover.uploaded;

    const timeline = await uploadTimelinePhotos(current);
    current = timeline.piece;
    uploaded += timeline.uploaded;

    if (JSON.stringify(current) !== JSON.stringify(before)) {
      // New assetIds must reach the backend doc, so mark the piece dirty and
      // re-sync it.
      const next: Piece = { ...current, syncDirty: true };
      setPiecesIfChanged(
        useAppStore.getState().pieces.map((p) => (p.id === pieceId ? next : p)),
      );
      schedulePiecesSync();
    }

    scheduleAssetReconcile();

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

// ─── Debounced scheduling ─────────────────────────────────────────────────────

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

// ─── Hydrate (pull + download) ────────────────────────────────────────────────

let hydrateInFlight = false;
const HYDRATE_CONCURRENCY = 2;

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  if (items.length === 0) return;
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await worker(current);
    }
  });
  await Promise.all(runners);
}

function pieceNeedsHydrate(piece: Piece): boolean {
  const cover = piece.photo ?? piece.imgUrl;
  if (piece.coverAssetId && !isLocalMediaUri(cover)) return true;
  return piece.timeline.some((entry) =>
    (entry.photos ?? []).some((photo) => photo.assetId && !isLocalMediaUri(photo.uri)),
  );
}

/** Resolve each ref's fresh url, download it to a local file, and stamp it in. */
async function hydratePieceFromAssets(piece: Piece, assets: BackendPieceAsset[]): Promise<Piece> {
  const urlByAssetId = new Map<string, string>();
  for (const asset of assets) urlByAssetId.set(asset.id, asset.url);

  let changed = false;

  const timeline = await Promise.all(
    piece.timeline.map(async (entry) => {
      const photos = await Promise.all(
        (entry.photos ?? []).map(async (photo) => {
          if (!photo.assetId) return photo; // pending local upload, leave it
          if (isLocalMediaUri(photo.uri)) return photo; // already have a local file
          const url = urlByAssetId.get(photo.assetId);
          if (!url) return photo; // asset not found this pull, try again later

          const localUri = await downloadAssetToLocal(photo.assetId, url);
          if (localUri) {
            changed = true;
            return { ...photo, uri: localUri };
          }
          // Download failed: only stamp a remote url if we have nothing to show.
          if (!photo.uri) {
            changed = true;
            return { ...photo, uri: url };
          }
          return photo;
        }),
      );
      return { ...entry, photos };
    }),
  );

  let coverPatch: Partial<Piece> = {};
  const cover = piece.photo ?? piece.imgUrl;
  if (piece.coverAssetId && !isLocalMediaUri(cover)) {
    const url = urlByAssetId.get(piece.coverAssetId);
    if (url) {
      const localUri = await downloadAssetToLocal(piece.coverAssetId, url);
      if (localUri) {
        coverPatch = { photo: localUri, imgUrl: localUri };
        changed = true;
      } else if (!cover) {
        coverPatch = { photo: url, imgUrl: url };
        changed = true;
      }
    }
  }

  return changed ? { ...piece, timeline, ...coverPatch } : piece;
}

/** Pull cloud asset files for backend-linked pieces (e.g. after sign-in on a new device). */
export async function hydrateAllPieceAssetsFromCloud(): Promise<void> {
  const { pieces, isSignedIn } = useAppStore.getState();
  if (!isSignedIn || hydrateInFlight) return;

  const targets = pieces.filter((piece) => piece.backendId && !piece.deleted && pieceNeedsHydrate(piece));
  if (targets.length === 0) return;

  hydrateInFlight = true;
  try {
    // One bulk list for the whole account, then per-piece downloads.
    const all = await apiListAllPieceAssets();
    if (!all.length) return;
    const byPiece = new Map<string, BackendPieceAsset[]>();
    for (const asset of all) {
      const list = byPiece.get(asset.piece_id);
      if (list) list.push(asset);
      else byPiece.set(asset.piece_id, [asset]);
    }

    const updates = new Map<number, Piece>();

    await runWithConcurrency(targets, HYDRATE_CONCURRENCY, async (piece) => {
      try {
        const assets = byPiece.get(piece.backendId!) ?? [];
        if (!assets.length) return;
        const merged = await hydratePieceFromAssets(piece, assets);
        if (merged !== piece) updates.set(piece.id, merged);
      } catch (err) {
        if (__DEV__) console.warn(`[pieces:asset:hydrate] failed for ${piece.backendId}:`, err);
      }
    });

    if (updates.size > 0) {
      setPiecesIfChanged(
        useAppStore.getState().pieces.map((piece) => updates.get(piece.id) ?? piece),
      );
      if (__DEV__) console.log(`[pieces:asset:hydrate] hydrated ${updates.size} piece(s)`);
    }
  } catch (err) {
    if (__DEV__) console.warn('[pieces:asset:hydrate] failed:', err);
  } finally {
    hydrateInFlight = false;
  }
}
