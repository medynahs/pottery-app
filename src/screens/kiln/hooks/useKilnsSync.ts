/**
 * useKilnsSync, React Query hooks that bridge /users/me/kilns with the
 * local Zustand store.
 *
 * Responsibilities:
 *   - Fetch the user's kilns from the backend on mount (when signed in).
 *   - Merge backend kilns into the store (using backendId as the key).
 *   - Expose typed mutations for upsert and delete that optimistically update
 *     the store and then sync to the API.
 */

import { useAppStore } from '@/src/store';
import type { Kiln } from '@/src/types/kiln';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
    apiDeleteKiln,
    apiListKilns,
    apiUpsertKiln,
    backendKilnToLocal,
    localKilnToUpsertPayload,
    type BackendKiln,
} from '../../../services/kilns';
import { normalizeKiln } from '../utils/kilnHelpers';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const KILNS_QUERY_KEY = ['kilns'] as const;
export const kilnsQueryKey = (userId: string) =>
  [...KILNS_QUERY_KEY, userId] as const;

// ─── Merge helper ─────────────────────────────────────────────────────────────

/**
 * Merge backend kilns into the local store.
 * - If a local kiln already has a matching `backendId`, update it in place.
 * - If no match, prepend a new local record.
 */
function mergeKilnsIntoStore(
  backendKilns: BackendKiln[],
  localKilns: Kiln[],
  setKilns: (kilns: Kiln[]) => void,
) {
  const byBackendId = new Map(
    localKilns.filter(k => k.backendId).map(k => [k.backendId!, k]),
  );

  const updatedByBackendId = new Map<string, Kiln>();
  const newKilns: Kiln[] = [];

  for (const bk of backendKilns) {
    const existing = byBackendId.get(bk.id);
    const merged = backendKilnToLocal(bk, existing);
    if (existing) {
      updatedByBackendId.set(bk.id, merged);
    } else {
      newKilns.push(merged);
    }
  }

  const retained = localKilns.map(k =>
    k.backendId ? (updatedByBackendId.get(k.backendId) ?? k) : k,
  );

  setKilns([...newKilns, ...retained].map(normalizeKiln));
}

// ─── Sync hook ────────────────────────────────────────────────────────────────

/**
 * Loads kilns from the backend whenever the user is authenticated.
 * The result is merged into the Zustand store so all existing UI continues
 * to work without changes.
 */
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
    const { kilns, setKilns } = useAppStore.getState();
    mergeKilnsIntoStore(query.data, kilns, setKilns);
  }, [query.data]);

  return query;
}

// ─── Upsert mutation ──────────────────────────────────────────────────────────

/**
 * Syncs a locally-added or locally-updated kiln to the backend.
 * The store should already be updated optimistically before calling this.
 * On success, stamps the returned UUID as `backendId` on the local record.
 */
export function useUpsertKilnMutation() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const updateKiln = useAppStore(s => s.updateKiln);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kiln: Kiln) => {
      if (!isSignedIn) {
        if (__DEV__) console.log(`[kilns:upsert] "${kiln.name}" skipped, not signed in`);
        return null;
      }
      const payload = localKilnToUpsertPayload(kiln);
      if (__DEV__)
        console.log(
          `[kilns:upsert] "${kiln.name}" (backendId: ${kiln.backendId ?? 'new'})`,
        );
      const bk = await apiUpsertKiln(payload);
      return { bk, kiln };
    },
    onSuccess: (result, kiln) => {
      if (!result) return; // skipped (not signed in)
      const { bk } = result;
      if (__DEV__) console.log(`[kilns:upsert] "${kiln.name}" → backendId ${bk.id}`);
      // Read the latest version from the store, the user may have edited the
      // kiln while the request was in flight, so don't clobber those changes.
      const latest = useAppStore.getState().kilns.find(k => k.id === kiln.id);
      if (latest) updateKiln({ ...latest, backendId: bk.id });
      void queryClient.invalidateQueries({ queryKey: KILNS_QUERY_KEY });
    },
    onError: (err, kiln) => {
      if (__DEV__) console.warn(`[kilns:upsert] FAILED for "${kiln.name}":`, err);
      useAppStore.getState().showToast('Could not save kiln', 'error');
    },
  });
}

// ─── Delete mutation ──────────────────────────────────────────────────────────

/**
 * Deletes a kiln on the backend. The store should already have the kiln
 * removed optimistically before this is called.
 */
export function useDeleteKilnMutation() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);


  return useMutation({
    mutationFn: async (kiln: Kiln) => {
      if (!isSignedIn) {
        if (__DEV__) console.log(`[kilns:delete] "${kiln.name}" skipped, not signed in`);
        return;
      }
      if (!kiln.backendId) {
        if (__DEV__)
          console.log(`[kilns:delete] "${kiln.name}" skipped, no backendId (local-only)`);
        return;
      }
      if (__DEV__) console.log(`[kilns:delete] DELETE ${kiln.backendId}`);
      await apiDeleteKiln(kiln.backendId);
    },
    onError: (err, kiln) => {
      if (__DEV__)
        console.warn(`[kilns:delete] FAILED for "${kiln.name}":`, err);
      useAppStore.getState().showToast('Could not remove kiln from server', 'error');
    },
  });
}
