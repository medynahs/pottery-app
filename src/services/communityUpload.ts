import { API_BASE_URL as API_BASE } from './index';

type UploadAssetResponse = {
  asset_id: string;
  url?: string;
  public_url?: string;
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
 * Upload a local image for a community post via multipart POST /uploads.
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
  const form = new FormData();
  form.append('file', {
    uri: localUri,
    name: fileNameFromUri(localUri, contentType),
    type: contentType,
  } as unknown as Blob);

  const res = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
      'X-Session-Token': sessionToken,
    },
    body: form as unknown as BodyInit_,
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as UploadAssetResponse;
  if (!data.asset_id) {
    return null;
  }

  return {
    assetId: data.asset_id,
    publicUrl: data.public_url ?? data.url,
  };
}
