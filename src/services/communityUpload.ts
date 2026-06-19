import { API_BASE_URL as API_BASE } from './index';

type PresignedUploadResponse = {
  asset_id: string;
  upload_url: string;
  public_url?: string;
  url?: string;
};

function guessMimeType(uri: string): string {
  const lower = uri.split('?')[0].split('#')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function fileNameFromUri(uri: string, mime: string): string {
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const base = uri.split('/').pop()?.split('?')[0];
  if (base && base.includes('.')) return base;
  return `post-photo.${ext}`;
}

/**
 * Upload a local image for a community post via presigned URL.
 * Returns null when the upload endpoint is unavailable (text-only fallback).
 */
export async function uploadPostPhotoAsset(
  sessionToken: string,
  localUri: string,
): Promise<{ assetId: string; publicUrl?: string } | null> {
  if (!localUri || localUri.startsWith('http')) {
    return null;
  }

  const contentType = guessMimeType(localUri);
  const presignRes = await fetch(`${API_BASE}/uploads/presigned`, {
    method: 'POST',
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Session-Token': sessionToken,
    },
    body: JSON.stringify({
      content_type: contentType,
      filename: fileNameFromUri(localUri, contentType),
    }),
  });

  if (!presignRes.ok) {
    return null;
  }

  const presigned = (await presignRes.json()) as PresignedUploadResponse;
  if (!presigned.asset_id || !presigned.upload_url) {
    return null;
  }

  const fileRes = await fetch(localUri);
  const blob = await fileRes.blob();

  const uploadRes = await fetch(presigned.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });

  if (!uploadRes.ok) {
    throw new Error(`Photo upload failed (${uploadRes.status})`);
  }

  return {
    assetId: presigned.asset_id,
    publicUrl: presigned.public_url ?? presigned.url,
  };
}
