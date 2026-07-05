import type { ImageSource } from 'expo-image';

/**
 * Private piece photos are served via presigned URLs whose query-string signature
 * changes on every API response; expo-image caches by full URL, so without a
 * stable key every refresh re-downloads every photo. Key the cache on the
 * query-less path (bucket + object key) instead. Public/local URIs have no query,
 * so this is a no-op for them.
 */
export function remoteImageSource(uri: string): ImageSource {
  return { uri, cacheKey: uri.split('?')[0] };
}
