// API / backend integration helpers

const DEFAULT_API_BASE_URL = 'https://kilnkins.onrender.com';
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
  const normalized = raw.replace(/\/+$/, '');

  if (!normalized) {
    return DEFAULT_API_BASE_URL;
  }

  if (!LOCAL_API_ALLOWED && isLocalHostUrl(normalized)) {
    return DEFAULT_API_BASE_URL;
  }

  return normalized;
}

export const API_BASE_URL = resolveApiBaseUrl();

export interface BackendUser {
  id: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

function createEndpoint(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function createApiPath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL.endsWith('/api')) {
    return normalizedPath;
  }

  return `/api${normalizedPath}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const endpoint = createEndpoint(path);
  let response: Response;

  try {
    response = await fetch(endpoint, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown network error';
    throw new Error(`Network request failed for ${endpoint}: ${reason}`);
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${endpoint}`);
  }

  return (await response.json()) as T;
}

export async function fetchUsers(): Promise<BackendUser[]> {
  return requestJson<BackendUser[]>(createApiPath('/users'));
}
