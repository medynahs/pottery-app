import { ApiError } from '@/src/services/api';
import { CommunityApiError } from '@/src/services/community';

export function isRateLimited(error: unknown): boolean {
  return (
    (error instanceof CommunityApiError && error.status === 429) ||
    (error instanceof ApiError && error.status === 429)
  );
}

/** Never retry 429 — backoff retries amplify rate limiting. */
export function defaultQueryRetry(failureCount: number, error: unknown): boolean {
  if (isRateLimited(error)) return false;
  return failureCount < 1;
}

export const STABLE_QUERY_OPTIONS = {
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
} as const;
