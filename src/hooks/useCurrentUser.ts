import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  ApiError,
  fetchMe,
  isAccountDeletedError,
  updateProfile,
  updatePrivacy,
  uploadAvatar,
  uploadCover,
  userPatchFromBackendProfile,
  type BackendProfile,
  type UpdatePrivacyPayload,
  type UpdateProfilePayload,
} from '../services/api';
import { profileIndicatesDeletionGrace } from '../services/accountGrace';
import { useAppStore } from '../store/appStore';

export const ME_QUERY_KEY = ['me'] as const;

function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

function mergeMeCache(prev: BackendProfile | undefined, next: BackendProfile): BackendProfile {
  return prev ? { ...prev, ...next } : next;
}

function applyProfileToStore(profile: Parameters<typeof userPatchFromBackendProfile>[0]) {
  const { setUser, setPrivacyPref } = useAppStore.getState();
  setUser(userPatchFromBackendProfile(profile, profile.email));
  if (profile.profile_public !== undefined) {
    setPrivacyPref('profilePublic', profile.profile_public);
  }
  if (profile.pieces_public !== undefined) {
    setPrivacyPref('piecesPublic', profile.pieces_public);
  }
}

export function useCurrentUser() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const setBackendUserId = useAppStore((s) => s.setBackendUserId);
  const clearSession = useAppStore((s) => s.clearSession);
  const setAccountDeletionGrace = useAppStore((s) => s.setAccountDeletionGrace);
  const showToast = useAppStore((s) => s.showToast);

  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => fetchMe(sessionToken!),
    enabled: !!sessionToken,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) =>
      !isSessionExpired(error) && !isAccountDeletedError(error) && failureCount < 2,
  });

  useEffect(() => {
    if (sessionToken && isSessionExpired(query.error)) {
      clearSession();
      showToast('Your session has expired. Please sign in again.', 'error');
    }
  }, [query.error, sessionToken, clearSession, showToast]);

  useEffect(() => {
    if (!sessionToken) {
      setAccountDeletionGrace(false);
      return;
    }
    if (isAccountDeletedError(query.error)) {
      setAccountDeletionGrace(true);
      return;
    }
    if (query.data && profileIndicatesDeletionGrace(query.data)) {
      setAccountDeletionGrace(true);
      return;
    }
    if (query.data) {
      setAccountDeletionGrace(false);
    }
  }, [query.error, query.data, sessionToken, setAccountDeletionGrace]);

  useEffect(() => {
    if (!query.data) return;
    setBackendUserId(query.data.id);
    applyProfileToStore(query.data);
  }, [query.data, setBackendUserId]);

  return query;
}

/**
 * Persist profile text fields via PUT /users/me and refresh the me cache + store.
 */
export function useUpdateProfile() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient = useQueryClient();

  return async (payload: UpdateProfilePayload): Promise<void> => {
    if (!sessionToken) throw new Error('Not signed in');
    const updatedProfile = await updateProfile(sessionToken, payload);
    queryClient.setQueryData(ME_QUERY_KEY, (prev) =>
      mergeMeCache(prev as BackendProfile | undefined, updatedProfile),
    );
    applyProfileToStore(updatedProfile);
  };
}

/**
 * Persist community visibility toggles via PUT /users/me/privacy.
 */
export function useUpdatePrivacy() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient = useQueryClient();

  return async (payload: UpdatePrivacyPayload): Promise<void> => {
    if (!sessionToken) throw new Error('Not signed in');
    const updatedProfile = await updatePrivacy(sessionToken, payload);
    queryClient.setQueryData(ME_QUERY_KEY, (prev) =>
      mergeMeCache(prev as BackendProfile | undefined, updatedProfile),
    );
    applyProfileToStore(updatedProfile);
  };
}

/**
 * One-shot helper to upload an avatar and immediately update the cache + store.
 */
export function useUploadAvatar() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient = useQueryClient();

  return async (imageUri: string, mimeType?: string): Promise<void> => {
    if (!sessionToken) throw new Error('Not signed in');
    const updatedProfile = await uploadAvatar(sessionToken, imageUri, mimeType);
    queryClient.setQueryData(ME_QUERY_KEY, (prev) =>
      mergeMeCache(prev as BackendProfile | undefined, {
        ...updatedProfile,
        avatar_url: updatedProfile.avatar_url ?? imageUri,
      }),
    );
    applyProfileToStore({
      ...updatedProfile,
      avatar_url: updatedProfile.avatar_url ?? imageUri,
    });
  };
}

/**
 * One-shot helper to upload a profile cover photo, mirroring useUploadAvatar.
 */
export function useUploadCover() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const queryClient = useQueryClient();

  return async (imageUri: string, mimeType?: string): Promise<void> => {
    if (!sessionToken) throw new Error('Not signed in');
    let updatedProfile = await uploadCover(sessionToken, imageUri, mimeType);
    if (!updatedProfile.cover_url) {
      try {
        updatedProfile = await fetchMe(sessionToken);
      } catch {
        // Keep the upload response; fall back to the local picker URI below.
      }
    }
    queryClient.setQueryData(ME_QUERY_KEY, (prev) =>
      mergeMeCache(prev as BackendProfile | undefined, {
        ...updatedProfile,
        cover_url: updatedProfile.cover_url ?? imageUri,
      }),
    );
    applyProfileToStore({
      ...updatedProfile,
      cover_url: updatedProfile.cover_url ?? imageUri,
    });
  };
}
