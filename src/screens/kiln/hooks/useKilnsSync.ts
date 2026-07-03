/**
 * useKilnsSync — bridge between /me/kilns and the local Zustand store,
 * built on the shared doc-sync engine (same contract as pieces/firings).
 *
 * Push: store mutations mark kilns dirty/tombstoned and call
 * scheduleKilnsSync; the engine batches them through POST /me/kilns/sync.
 * Snapshots carry backend_id so rows that predate client_ref re-link
 * instead of duplicating.
 * Pull: GET /me/kilns on sign-in, merged dirty-wins into the store.
 */

import {
  apiListKilns,
  apiSyncKilns,
  docForBackend,
  type BackendKiln,
  type KilnSyncSnapshot,
} from '@/src/services/kilns';
import { useAppStore } from '@/src/store';
import { createDocSyncDomain, mergeBackendRows } from '@/src/sync/docSync';
import type { Kiln } from '@/src/types/kiln';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { normalizeKiln } from '../utils/kilnHelpers';

export const KILNS_QUERY_KEY = ['kilns'] as const;
export const kilnsQueryKey = (userId: string) => [...KILNS_QUERY_KEY, userId] as const;

function kilnToSnapshot(kiln: Kiln): KilnSyncSnapshot {
  return {
    client_ref: String(kiln.id),
    ...(kiln.backendId ? { backend_id: kiln.backendId } : {}),
    ...(kiln.deleted ? { deleted: true } : {}),
    doc: docForBackend(kiln),
  };
}

const kilnsDomain = createDocSyncDomain<Kiln, KilnSyncSnapshot>({
  label: 'kilns',
  errorToast: 'Could not sync kilns',
  select: (state) => state.kilns,
  write: (kilns) => useAppStore.setState({ kilns }),
  toSnapshot: kilnToSnapshot,
  push: async (snapshots) =>
    (await apiSyncKilns({ kilns: snapshots })).client_ref_map,
});

export const flushKilnsSync = kilnsDomain.flush;
export const scheduleKilnsSync = kilnsDomain.schedule;
export const hasPendingKilnsSync = kilnsDomain.hasPending;

/** Returns null for an empty doc. Legacy rows (pre doc-sync) hold the old flat
 *  kiln blob, which is close enough to a Kiln to restore; app-only fields it
 *  never carried are kept from this device's copy. */
function kilnFromBackend(bk: BackendKiln, existing?: Kiln): Kiln | null {
  const doc = bk.doc;
  if (!doc || typeof doc.id !== 'string' || !doc.name) return null;

  const kiln: Kiln = {
    ...(doc as Kiln),
    id: existing?.id ?? doc.id,
    backendId: bk.id,
  };
  if (!doc.maintenanceLogs && existing?.maintenanceLogs) kiln.maintenanceLogs = existing.maintenanceLogs;
  if (!doc.emergencyNotes && existing?.emergencyNotes) kiln.emergencyNotes = existing.emergencyNotes;
  if (!doc.lastFiredAt && existing?.lastFiredAt) kiln.lastFiredAt = existing.lastFiredAt;
  return normalizeKiln(kiln);
}

export function useKilnsSync() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const query = useQuery({
    queryKey: kilnsQueryKey('me'),
    queryFn: () => apiListKilns(),
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (!query.data) return;
    if (__DEV__)
      console.log(`[kilns:sync] fetched ${query.data.length} kiln(s) from backend`);
    useAppStore.setState({
      kilns: mergeBackendRows(query.data, useAppStore.getState().kilns, kilnFromBackend),
    });
    // Sweep anything the pull didn't know about (offline creates/edits/deletes).
    scheduleKilnsSync();
  }, [query.data]);

  return query;
}
