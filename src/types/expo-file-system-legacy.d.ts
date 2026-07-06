/**
 * Ambient shim for the `expo-file-system/legacy` subpath. The package ships this
 * entry as source-only `.ts` with no `exports` map, so TS `bundler` resolution
 * can't find its types even though Metro resolves the module fine at runtime.
 * We only declare the handful of members pieceAssetSync uses.
 */
declare module 'expo-file-system/legacy' {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;

  export interface FileInfo {
    exists: boolean;
    uri: string;
    size?: number;
    isDirectory?: boolean;
    modificationTime?: number;
  }

  export interface DownloadResult {
    uri: string;
    status: number;
    headers: Record<string, string>;
    md5?: string;
  }

  export function getInfoAsync(
    fileUri: string,
    options?: { md5?: boolean; size?: boolean },
  ): Promise<FileInfo>;

  export function makeDirectoryAsync(
    fileUri: string,
    options?: { intermediates?: boolean },
  ): Promise<void>;

  export function downloadAsync(
    uri: string,
    fileUri: string,
    options?: Record<string, unknown>,
  ): Promise<DownloadResult>;
}
