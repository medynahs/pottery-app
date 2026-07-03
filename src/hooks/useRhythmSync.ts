/**
 * Offline-first bridge for GET/POST /me/rhythm.
 * Pull on sign-in; debounced push when studioRhythm changes.
 */

import { ApiError, isAccountDeletedError } from '@/src/services/api';
import { fetchRhythm, upsertRhythm } from '@/src/services/rhythm';
import {
  DEFAULT_STUDIO_RHYTHM,
  normalizeStudioRhythm,
  type StudioRhythm,
} from '@/src/screens/overview/studioRythm/studioRhythm';
import { useAppStore } from '@/src/store';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export const RHYTHM_QUERY_KEY = ['rhythm'] as const;

const SYNC_DEBOUNCE_MS = 800;

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight = false;
let initialPullMerged = false;
let lastMergedAt = 0;
let lastPushedJson = '';

function rhythmJson(rhythm: StudioRhythm): string {
  return JSON.stringify(normalizeStudioRhythm(rhythm));
}

function scheduleRhythmPush(expectedJson: string) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushRhythm(expectedJson);
  }, SYNC_DEBOUNCE_MS);
}

async function pushRhythm(expectedJson: string) {
  if (syncInFlight || expectedJson === lastPushedJson) return;
  if (!useAppStore.getState().isSignedIn) return;

  const rhythm = normalizeStudioRhythm(useAppStore.getState().studioRhythm);
  const json = rhythmJson(rhythm);
  if (json !== expectedJson) return;

  syncInFlight = true;
  try {
    await upsertRhythm(rhythm);
    lastPushedJson = json;
    if (__DEV__) console.log('[rhythm:sync] pushed');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || isAccountDeletedError(error)) return;
      if (error.status === 403) return;
    }
    if (__DEV__) console.warn('[rhythm:sync] push failed', error);
  } finally {
    syncInFlight = false;
  }
}

export function useRhythmSync() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const isHydratingRef = useRef(false);

  const query = useQuery({
    queryKey: RHYTHM_QUERY_KEY,
    queryFn: () => fetchRhythm(),
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
    if (!isSignedIn || !query.isSuccess) return;
    if (query.dataUpdatedAt === lastMergedAt) return;
    lastMergedAt = query.dataUpdatedAt;

    const serverRhythm = query.data ? normalizeStudioRhythm(query.data) : null;
    const localRhythm = normalizeStudioRhythm(useAppStore.getState().studioRhythm);

    if (!serverRhythm) {
      const json = rhythmJson(localRhythm);
      lastPushedJson = json;
      if (!initialPullMerged) {
        initialPullMerged = true;
        if (json !== rhythmJson(DEFAULT_STUDIO_RHYTHM)) {
          scheduleRhythmPush(json);
        }
      }
      return;
    }

    isHydratingRef.current = true;
    useAppStore.setState({ studioRhythm: normalizeStudioRhythm(serverRhythm) });
    lastPushedJson = rhythmJson(serverRhythm);
    isHydratingRef.current = false;
    initialPullMerged = true;

    if (__DEV__) console.log('[rhythm:sync] merged server rhythm');
  }, [query.isSuccess, query.data, query.dataUpdatedAt, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) return;

    return useAppStore.subscribe((state) => {
      if (isHydratingRef.current || !initialPullMerged) return;

      const json = rhythmJson(state.studioRhythm);
      if (json === lastPushedJson) return;
      scheduleRhythmPush(json);
    });
  }, [isSignedIn]);

  return query;
}
