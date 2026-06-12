import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ApiError, avatarDataUri, fetchMe, uploadAvatar } from '../services/api';
import { useAppStore } from '../store/appStore';

export const ME_QUERY_KEY = ['me'] as const;

function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/**
 * Fetches /users/me whenever a session token is present.
 * Automatically syncs the result into Zustand (user.name, user.avatarImageUri,
 * backendUserId) so all existing components update reactively.
 * A 401 means the Ory session token is no longer valid — the user is signed
 * out locally so they land back on the auth screens instead of seeing
 * silently-failing requests.
 */
export function useCurrentUser() {
  const sessionToken    = useAppStore((s) => s.sessionToken);
  const setUser         = useAppStore((s) => s.setUser);
  const setBackendUserId = useAppStore((s) => s.setBackendUserId);
  const clearSession    = useAppStore((s) => s.clearSession);
  const showToast       = useAppStore((s) => s.showToast);

  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => fetchMe(sessionToken!),
    enabled: !!sessionToken,
    staleTime: 5 * 60 * 1000, // re-use cached data for 5 min
    retry: (failureCount, error) => !isSessionExpired(error) && failureCount < 2,
  });

  useEffect(() => {
    if (sessionToken && isSessionExpired(query.error)) {
      clearSession();
      showToast('Your session has expired. Please sign in again.', 'error');
    }
  }, [query.error, sessionToken]);

  useEffect(() => {
    if (!query.data) return;
    const p = query.data;
    setBackendUserId(p.id);
    const patch: Parameters<typeof setUser>[0] = {};
    // Only update name/initial from backend if we actually got one
    if (p.name) {
      patch.name = p.name;
      patch.avatarInitial = p.name[0].toUpperCase();
    } else if (p.email) {
      patch.avatarInitial = p.email[0].toUpperCase();
    }
    // Only overwrite the avatar if the backend returned a URL.
    // If null, leave whatever URI is already in the store (set optimistically
    // after the user picked an image but before the upload completed).
    const avatarUrl = avatarDataUri(p);
    if (avatarUrl) patch.avatarImageUri = avatarUrl;
    setUser(patch);
  }, [query.data]);

  return query;
}

/**
 * One-shot helper to upload an avatar and immediately update the cache + store.
 * Use inside EditProfileModal after the user picks an image.
 */
export function useUploadAvatar() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient  = useQueryClient();

  return async (imageUri: string, mimeType?: string): Promise<void> => {
    if (!sessionToken) throw new Error('Not signed in');
    const updatedProfile = await uploadAvatar(sessionToken, imageUri, mimeType);
    // Seed the cache directly with the upload response — the POST endpoint
    // already returns the updated profile with the new avatar_url.
    // This avoids a redundant GET /users/me and prevents the race condition
    // where a re-fetch returns a stale avatar_url and overwrites the
    // optimistic local URI that was set before the upload completed.
    queryClient.setQueryData(ME_QUERY_KEY, updatedProfile);
  };
}
