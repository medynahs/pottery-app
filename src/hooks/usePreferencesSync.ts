/**
 * Offline-first bridge for GET/PUT /me/preferences.
 * Pull on sign-in; debounced push when customization fields change.
 */

import { ApiError, isAccountDeletedError } from '@/src/services/api';
import { fetchPreferences, updatePreferences } from '@/src/services/preferences';
import {
  isEmptyServerPreferences,
  preferencesBlobFromStore,
  preferencesPatchFromBlob,
  selectPreferencesSlice,
} from '@/src/services/preferencesMapper';
import { useAppStore } from '@/src/store';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export const PREFERENCES_QUERY_KEY = ['preferences'] as const;

const SYNC_DEBOUNCE_MS = 800;

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight = false;
let initialPullMerged = false;
let lastMergedAt = 0;
let lastPushedJson = '';

function schedulePreferencesPush(expectedJson: string) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushPreferences(expectedJson);
  }, SYNC_DEBOUNCE_MS);
}

async function pushPreferences(expectedJson: string) {
  if (syncInFlight || expectedJson === lastPushedJson) return;

  const state = useAppStore.getState();
  if (!state.isSignedIn) return;
  const blob = preferencesBlobFromStore(selectPreferencesSlice(state));
  const json = JSON.stringify(blob);
  if (json !== expectedJson) return;

  syncInFlight = true;
  try {
    await updatePreferences(blob);
    lastPushedJson = json;
    if (__DEV__) console.log('[preferences:sync] pushed');
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || isAccountDeletedError(error))) {
      return;
    }
    if (__DEV__) console.warn('[preferences:sync] push failed', error);
  } finally {
    syncInFlight = false;
  }
}

export function usePreferencesSync() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const isHydratingRef = useRef(false);

  const query = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: () => fetchPreferences(),
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 401 || isAccountDeletedError(error))) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (!isSignedIn) {
      initialPullMerged = false;
      lastMergedAt = 0;
      lastPushedJson = '';
      return;
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!query.data || !isSignedIn) return;
    if (query.dataUpdatedAt === lastMergedAt) return;
    lastMergedAt = query.dataUpdatedAt;

    const current = selectPreferencesSlice(useAppStore.getState());

    if (isEmptyServerPreferences(query.data)) {
      const localBlob = preferencesBlobFromStore(current);
      const localJson = JSON.stringify(localBlob);
      lastPushedJson = localJson;
      if (!initialPullMerged) {
        initialPullMerged = true;
        schedulePreferencesPush(localJson);
      }
      return;
    }

    isHydratingRef.current = true;
    const patch = preferencesPatchFromBlob(query.data, current);
    if (Object.keys(patch).length > 0) {
      useAppStore.setState(patch as Partial<ReturnType<typeof useAppStore.getState>>);
    }
    const mergedJson = JSON.stringify(preferencesBlobFromStore(selectPreferencesSlice(useAppStore.getState())));
    lastPushedJson = mergedJson;
    isHydratingRef.current = false;
    initialPullMerged = true;

    if (__DEV__) {
      console.log('[preferences:sync] merged server preferences');
    }
  }, [query.data, query.dataUpdatedAt, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;

    return useAppStore.subscribe((state) => {
      if (isHydratingRef.current || !initialPullMerged) return;

      const json = JSON.stringify(preferencesBlobFromStore(selectPreferencesSlice(state)));
      if (json === lastPushedJson) return;
      schedulePreferencesPush(json);
    });
  }, [isSignedIn]);

  return query;
}
