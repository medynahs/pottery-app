import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { isRateLimited } from '../lib/queryRetry';
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
import {
  deletionScheduledAtFromProfile,
  profileIndicatesDeletionGrace,
  markAccountDeletionGraceFromError,
  isWithinDeletionGraceWindow,
} from '../services/accountGrace';
import { sessionExists } from '../services/auth';
import { markSessionBootstrap, isSessionBootstrapActive } from '../services/sessionBootstrap';
import { useAppStore } from '../store/appStore';

export const ME_QUERY_KEY = ['me'] as const;

export { markSessionBootstrap } from '../services/sessionBootstrap';

function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

function isCancelledQueryError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = (error as { name?: string }).name;
  return name === 'CancelledError' || name === 'AbortError';
}

function mergeMeCache(prev: BackendProfile | undefined, next: BackendProfile): BackendProfile {
  return prev ? { ...prev, ...next } : next;
}

function applyEmailFallbackToStore(email: string) {
  const localPart = email.split('@')[0]?.trim();
  if (!localPart) return;
  useAppStore.getState().setUser({
    name: localPart,
    avatarInitial: localPart[0]?.toUpperCase() ?? 'U',
  });
}

function applyProfileToStore(profile: Parameters<typeof userPatchFromBackendProfile>[0]) {
  const { setUser, setPrivacyPref } = useAppStore.getState();
  setUser(userPatchFromBackendProfile(profile, profile.email));
  if (profile.profile_public !== undefined) {
    setPrivacyPref('profilePublic', profile.profile_public);
  }
}

function syncDeletionGraceFromProfile(profile: BackendProfile) {
  const { setAccountDeletionGrace, setAccountDeletionScheduledAt, clearAccountDeletionSchedule } =
    useAppStore.getState();
  if (profileIndicatesDeletionGrace(profile)) {
    setAccountDeletionGrace(true);
    const scheduledAt = deletionScheduledAtFromProfile(profile);
    if (scheduledAt) {
      setAccountDeletionScheduledAt(scheduledAt);
    }
    return;
  }
  clearAccountDeletionSchedule();
}

function handleMeQueryError(error: unknown) {
  const { setAccountDeletionGrace, email } = useAppStore.getState();
  if (isAccountDeletedError(error) || markAccountDeletionGraceFromError(error, setAccountDeletionGrace)) {
    if (email) applyEmailFallbackToStore(email);
    return true;
  }
  return false;
}

export function resetMeQueryCache(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
}

function meQueryOptions(isSignedIn: boolean) {
  return {
    queryKey: ME_QUERY_KEY,
    queryFn: () => fetchMe(),
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount: number, error: unknown) => {
      if (isSessionExpired(error) || isAccountDeletedError(error)) return false;
      if (markAccountDeletionGraceFromError(error, () => {})) return false;
      if (isCancelledQueryError(error)) return false;
      if (isRateLimited(error)) return false;
      return failureCount < 2;
    },
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
  } as const;
}

/** Subscribe to GET /users/me (no session side-effects). Safe to call from multiple screens. */
export function useCurrentUser() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  return useQuery(meQueryOptions(isSignedIn));
}

/** Single fetch path after sign-in — dedupes with useCurrentUser via React Query. */
export async function refreshMeAfterSignIn(queryClient: QueryClient): Promise<BackendProfile | null> {
  markSessionBootstrap();
  resetMeQueryCache(queryClient);

  try {
    const profile = await queryClient.fetchQuery({
      ...meQueryOptions(true),
      staleTime: 0,
    });
    syncDeletionGraceFromProfile(profile);
    return profile;
  } catch (error) {
    if (isCancelledQueryError(error)) return null;
    if (handleMeQueryError(error)) return null;
    if (__DEV__) {
      console.warn('[session] refreshMeAfterSignIn failed', error);
    }
    return null;
  }
}

/**
 * Profile hydration + conservative session validation.
 * Mount once in AppShell — do not duplicate across tab screens.
 */
export function useMeSessionEffects() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const email = useAppStore((s) => s.email);
  const setBackendUserId = useAppStore((s) => s.setBackendUserId);
  const clearSession = useAppStore((s) => s.clearSession);
  const setAccountDeletionGrace = useAppStore((s) => s.setAccountDeletionGrace);
  const showToast = useAppStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const signedOutRef = useRef(false);
  const sessionActivatedAtRef = useRef(0);
  const prevSignedInRef = useRef(false);
  const signOutCheckRef = useRef(0);

  const query = useCurrentUser();

  useEffect(() => {
    if (!isSignedIn) {
      prevSignedInRef.current = false;
      signedOutRef.current = false;
      return;
    }
    if (prevSignedInRef.current === isSignedIn) return;
    prevSignedInRef.current = isSignedIn;
    sessionActivatedAtRef.current = Date.now();
    signedOutRef.current = false;
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;
    if (query.isFetching || query.isPending) return;
    if (!query.isError || !query.error) return;
    if (isCancelledQueryError(query.error)) return;
    if (handleMeQueryError(query.error)) return;
    if (!isSessionExpired(query.error)) return;
    if (query.errorUpdatedAt < sessionActivatedAtRef.current) return;
    if (isSessionBootstrapActive()) return;
    if (signedOutRef.current) return;

    const checkId = ++signOutCheckRef.current;
    void (async () => {
      try {
        const stillValid = await sessionExists();
        if (signOutCheckRef.current !== checkId) return;
        if (!useAppStore.getState().isSignedIn) return;
        if (stillValid) {
          if (__DEV__) {
            console.warn(
              '[session] GET /users/me returned 401 but SuperTokens session OK — keeping session',
            );
          }
          return;
        }
      } catch {
        // sessionExists failed — proceed with sign-out
      }

      if (signOutCheckRef.current !== checkId) return;
      if (!useAppStore.getState().isSignedIn) return;

      const scheduledAt = useAppStore.getState().accountDeletionScheduledAt;
      signedOutRef.current = true;
      if (__DEV__) {
        console.warn('[session] GET /users/me returned 401 — clearing session');
      }
      clearSession();
      resetMeQueryCache(queryClient);
      if (isWithinDeletionGraceWindow(scheduledAt)) {
        showToast(
          'Session expired. Sign in again with the same email to restore your account before permanent deletion.',
          'error',
        );
      } else {
        showToast('Your session has expired. Please sign in again.', 'error');
      }
    })();
  }, [
    query.error,
    query.isError,
    query.isFetching,
    query.isPending,
    query.errorUpdatedAt,
    isSignedIn,
    clearSession,
    queryClient,
    showToast,
  ]);

  useEffect(() => {
    if (!isSignedIn) {
      setAccountDeletionGrace(false);
      return;
    }
    if (handleMeQueryError(query.error)) return;
    if (query.data) {
      syncDeletionGraceFromProfile(query.data);
    }
  }, [query.error, query.data, isSignedIn, email, setAccountDeletionGrace]);

  useEffect(() => {
    if (!query.data) return;
    setBackendUserId(query.data.id);
    applyProfileToStore(query.data);
  }, [query.data, setBackendUserId]);
}

/** Persist profile text fields via PUT /users/me and refresh the me cache + store. */
export function useUpdateProfile() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const queryClient = useQueryClient();

  return async (payload: UpdateProfilePayload): Promise<void> => {
    if (!isSignedIn) throw new Error('Not signed in');
    const updatedProfile = await updateProfile(payload);
    queryClient.setQueryData(ME_QUERY_KEY, (prev) =>
      mergeMeCache(prev as BackendProfile | undefined, updatedProfile),
    );
    applyProfileToStore(updatedProfile);
  };
}

/** Persist community visibility toggles via PUT /users/me/privacy. */
export function useUpdatePrivacy() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const queryClient = useQueryClient();

  return async (payload: UpdatePrivacyPayload): Promise<void> => {
    if (!isSignedIn) throw new Error('Not signed in');
    const updatedProfile = await updatePrivacy(payload);
    queryClient.setQueryData(ME_QUERY_KEY, (prev) =>
      mergeMeCache(prev as BackendProfile | undefined, updatedProfile),
    );
    applyProfileToStore(updatedProfile);
  };
}

/** One-shot helper to upload an avatar and immediately update the cache + store. */
export function useUploadAvatar() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const queryClient = useQueryClient();

  return async (imageUri: string, mimeType?: string): Promise<void> => {
    if (!isSignedIn) throw new Error('Not signed in');
    const updatedProfile = await uploadAvatar(imageUri, mimeType);
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

/** One-shot helper to upload a profile cover photo, mirroring useUploadAvatar. */
export function useUploadCover() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const queryClient = useQueryClient();

  return async (imageUri: string, mimeType?: string): Promise<void> => {
    if (!isSignedIn) throw new Error('Not signed in');
    let updatedProfile = await uploadCover(imageUri, mimeType);
    if (!updatedProfile.cover_url) {
      try {
        updatedProfile = await fetchMe();
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
