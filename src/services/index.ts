// API / backend integration helpers

const DEV_API_BASE_URL = 'https://kilnkins.onrender.com';
const PRODUCTION_API_BASE_URL = 'https://api.pottery-life.app';
const LOCAL_API_ALLOWED = process.env.EXPO_PUBLIC_ALLOW_LOCAL_API === 'true';

function isLocalHostUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '0.0.0.0';
  } catch {
    return false;
  }
}

function resolveApiBaseUrl(): string {
  const raw = (process.env.EXPO_PUBLIC_API_BASE_URL ?? process.env.EXPO_PUBLIC_API_URL ?? '').trim();
  let normalized = raw.replace(/\/+$/, '');
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV;
  const productionApiLive = process.env.EXPO_PUBLIC_USE_PRODUCTION_API === 'true';

  // Production hostname is not live yet — OTA/dev builds must not use it or every fetch fails.
  if (normalized === PRODUCTION_API_BASE_URL && !productionApiLive) {
    normalized = DEV_API_BASE_URL;
  }

  if (__DEV__ || appEnv === 'development' || appEnv === 'preview') {
    if (!normalized) {
      return DEV_API_BASE_URL;
    }
    if (!LOCAL_API_ALLOWED && isLocalHostUrl(normalized)) {
      return DEV_API_BASE_URL;
    }
    return normalized;
  }

  if (!normalized) {
    return productionApiLive ? PRODUCTION_API_BASE_URL : DEV_API_BASE_URL;
  }

  if (!LOCAL_API_ALLOWED && isLocalHostUrl(normalized)) {
    return productionApiLive ? PRODUCTION_API_BASE_URL : DEV_API_BASE_URL;
  }

  return normalized;
}

export const API_BASE_URL = resolveApiBaseUrl();
