/**
 * useFiringsSync — bridge between /me/firings and the local Zustand store,
 * built on the shared doc-sync engine (same contract as pieces).
 *
 * Push: store mutations mark firings dirty/tombstoned and call
 * scheduleFiringsSync; the engine batches them through POST /me/firings/sync.
 * Pull: GET /me/firings on sign-in, merged dirty-wins into the store.
 */

import {
  apiListFirings,
  apiSyncFirings,
  docForBackend,
  type BackendFiring,
  type FiringSyncSnapshot,
} from '@/src/services/firings';
import { useAppStore } from '@/src/store';
import { createDocSyncDomain, mergeBackendRows } from '@/src/sync/docSync';
import type { Firing } from '@/src/types/kiln';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const FIRINGS_QUERY_KEY = ['firings'] as const;
export const firingsQueryKey = (userId: string) => [...FIRINGS_QUERY_KEY, userId] as const;

function firingToSnapshot(firing: Firing): FiringSyncSnapshot {
  return {
    client_ref: String(firing.id),
    ...(firing.deleted ? { deleted: true } : {}),
    doc: docForBackend(firing),
  };
}

const firingsDomain = createDocSyncDomain<Firing, FiringSyncSnapshot>({
  label: 'firings',
  errorToast: 'Could not sync firings',
  select: (state) => state.firings,
  write: (firings) => useAppStore.setState({ firings }),
  toSnapshot: firingToSnapshot,
  push: async (snapshots) =>
    (await apiSyncFirings({ firings: snapshots })).client_ref_map,
});

export const flushFiringsSync = firingsDomain.flush;
export const scheduleFiringsSync = firingsDomain.schedule;
export const hasPendingFiringsSync = firingsDomain.hasPending;

/** Returns null for an empty/legacy doc — unrestorable; the owning device's
 *  next push refills it. */
function firingFromBackend(bf: BackendFiring): Firing | null {
  const doc = bf.doc;
  if (!doc || typeof doc.id !== 'string' || !doc.name) return null;
  return { ...(doc as Firing), backendId: bf.id };
}

export function useFiringsSync() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const query = useQuery({
    queryKey: firingsQueryKey('me'),
    queryFn: () => apiListFirings(),
    enabled: isSignedIn,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (!query.data) return;
    useAppStore.setState({
      firings: mergeBackendRows(query.data, useAppStore.getState().firings, firingFromBackend),
    });
    // Sweep anything the pull didn't know about (offline creates/edits/deletes).
    scheduleFiringsSync();
  }, [query.data]);

  return query;
}
