import { isRemoteMediaUri } from '@/src/utils/cloudStorage';
import { isNetworkFailure, networkFailureMessage } from '@/src/utils/networkErrors';
import { API_BASE_URL as API_BASE } from './index';

type UploadAssetResponse = {
  asset_id: string;
  url?: string;
  public_url?: string;
};

export class CommunityUploadError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: string | null,
  ) {
    super(message);
    this.name = 'CommunityUploadError';
  }
}

function guessMimeType(uri: string): string {
  const lower = uri.split('?')[0].split('#')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function fileNameFromUri(uri: string, mime: string): string {
  const ext =
    mime === 'image/png'
      ? 'png'
      : mime === 'image/webp'
        ? 'webp'
        : mime === 'image/heic'
          ? 'heic'
          : 'jpg';
  const base = uri.split('/').pop()?.split('?')[0];
  if (base && base.includes('.')) return base;
  return `post-photo.${ext}`;
}

async function parseUploadError(res: Response): Promise<string | null> {
  try {
    const body = (await res.json()) as { error?: string; details?: string; message?: string };
    return body.details ?? body.error ?? body.message ?? null;
  } catch {
    try {
      return (await res.text()) || null;
    } catch {
      return null;
    }
  }
}

async function appendPhotoToForm(
  form: FormData,
  uri: string,
  fieldName: string,
  fileName: string,
  contentType: string,
): Promise<void> {
  if (isRemoteMediaUri(uri)) {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new CommunityUploadError('Could not read photo from cloud storage', response.status);
    }
    const blob = await response.blob();
    form.append(fieldName, blob as unknown as Blob, fileName);
    return;
  }

  form.append(fieldName, {
    uri,
    name: fileName,
    type: contentType,
  } as unknown as Blob);
}

async function postMultipartUpload(
  form: FormData,
): Promise<UploadAssetResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: form as unknown as BodyInit_,
    });
  } catch (error) {
    throw new CommunityUploadError(networkFailureMessage('upload'), undefined, undefined);
  }

  if (!res.ok) {
    const details = await parseUploadError(res);
    if (res.status === 404 || res.status === 501) {
      throw new CommunityUploadError('Photo upload is not available yet', res.status, details);
    }
    throw new CommunityUploadError(
      details ?? `Photo upload failed (${res.status})`,
      res.status,
      details,
    );
  }

  return res.json() as Promise<UploadAssetResponse>;
}

/**
 * Upload a local or remote image for a community post via multipart POST /uploads.
 */
export async function uploadPostPhotoAsset(
  
    photoUri: string,
): Promise<{ assetId: string; publicUrl?: string }> {
  const uri = photoUri?.trim();
  if (!uri) {
    throw new CommunityUploadError('No photo selected');
  }

  const contentType = guessMimeType(uri);
  const fileName = fileNameFromUri(uri, contentType);

  const form = new FormData();
  await appendPhotoToForm(form, uri, 'file', fileName, contentType);

  let data: UploadAssetResponse;
  try {
    data = await postMultipartUpload(form);
  } catch (err) {
    // Some handlers expect `image` instead of `file` (avatar-style).
    if (err instanceof CommunityUploadError && err.status === 400) {
      const fallback = new FormData();
      await appendPhotoToForm(fallback, uri, 'image', fileName, contentType);
      data = await postMultipartUpload(fallback);
    } else {
      throw err;
    }
  }

  if (!data.asset_id) {
    throw new CommunityUploadError('Upload succeeded but no asset id was returned');
  }

  return {
    assetId: data.asset_id,
    publicUrl: data.public_url ?? data.url,
  };
}
