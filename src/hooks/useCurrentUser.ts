import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ApiError, avatarDataUri, fetchMe, uploadAvatar, uploadCover } from '../services/api';
import { useAppStore } from '../store/appStore';

export const ME_QUERY_KEY = ['me'] as const;

function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

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
    if (p.name) {
      patch.name = p.name;
      patch.avatarInitial = p.name[0].toUpperCase();
    } else if (p.email) {
      patch.avatarInitial = p.email[0].toUpperCase();
    }
   
    const avatarUrl = avatarDataUri(p);
    if (avatarUrl) patch.avatarImageUri = avatarUrl;
    if (p.cover_url) patch.coverImageUri = p.cover_url;
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
  const setUser        = useAppStore((s) => s.setUser);
  const queryClient    = useQueryClient();

  return async (imageUri: string, mimeType?: string): Promise<void> => {
    if (!sessionToken) throw new Error('Not signed in');
    const updatedProfile = await uploadAvatar(sessionToken, imageUri, mimeType);
    queryClient.setQueryData(ME_QUERY_KEY, updatedProfile);
    const avatarUrl = avatarDataUri(updatedProfile) ?? imageUri;
    setUser({ avatarImageUri: avatarUrl });
  };
}

/**
 * One-shot helper to upload a profile cover photo, mirroring useUploadAvatar.
 */
export function useUploadCover() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const setUser        = useAppStore((s) => s.setUser);
  const queryClient    = useQueryClient();

  return async (imageUri: string, mimeType?: string): Promise<void> => {
    if (!sessionToken) throw new Error('Not signed in');
    let updatedProfile = await uploadCover(sessionToken, imageUri, mimeType);
    // POST /users/me/cover may persist the asset without returning cover_url yet.
    if (!updatedProfile.cover_url) {
      try {
        updatedProfile = await fetchMe(sessionToken);
      } catch {
        // Keep the upload response; fall back to the local picker URI below.
      }
    }
    queryClient.setQueryData(ME_QUERY_KEY, updatedProfile);
    setUser({ coverImageUri: updatedProfile.cover_url ?? imageUri });
  };
}
