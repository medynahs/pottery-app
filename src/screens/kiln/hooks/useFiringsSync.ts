/**
 * useFiringsSync — bridge between /me/firings and the local Zustand store.
 *
 * Same model as usePiecesSync: FE is the source of truth, the backend keeps
 * one opaque doc per firing keyed on client_ref (the local firing id).
 * Push: every mutation sends a full snapshot through POST /me/firings/sync.
 * Pull: GET /me/firings on sign-in; local firings are replaced wholesale
 * from their doc (whole-firing last-write-wins).
 */

import {
  apiListFirings,
  apiSyncFirings,
  docForBackend,
  type BackendFiring,
  type FiringSyncSnapshot,
} from '@/src/services/firings';
import { useAppStore } from '@/src/store';
import type { Firing } from '@/src/types/kiln';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const FIRINGS_QUERY_KEY = ['firings'] as const;
export const firingsQueryKey = (userId: string) => [...FIRINGS_QUERY_KEY, userId] as const;

function firingToSnapshot(firing: Firing, deleted = false): FiringSyncSnapshot {
  return {
    client_ref: String(firing.id),
    ...(deleted ? { deleted: true } : {}),
    doc: docForBackend(firing),
  };
}

async function pushFiring(firing: Firing, deleted = false): Promise<string | null> {
  const { client_ref_map: refMap } = await apiSyncFirings({
    firings: [firingToSnapshot(firing, deleted)],
  });
  return refMap[String(firing.id)] ?? null;
}

/** Returns null for an empty/legacy doc — unrestorable; the owning device's
 *  next push refills it. */
function firingFromDoc(bf: BackendFiring): Firing | null {
  const doc = bf.doc;
  if (!doc || typeof doc.id !== 'string' || !doc.name) return null;
  return { ...(doc as Firing), backendId: bf.id };
}

function mergeBackendFiringsIntoLocal(
  backendFirings: BackendFiring[],
  localFirings: Firing[],
): Firing[] {
  const byClientRef = new Map(localFirings.map((f) => [String(f.id), f]));
  const byBackendId = new Map(
    localFirings.filter((f) => f.backendId).map((f) => [f.backendId!, f]),
  );

  const replaced = new Map<string, Firing>();
  const removed = new Set<string>();
  const added: Firing[] = [];

  for (const bf of backendFirings) {
    const existing =
      (bf.client_ref ? byClientRef.get(bf.client_ref) : undefined) ??
      byBackendId.get(bf.id);

    if (bf.is_deleted) {
      if (existing) removed.add(existing.id);
      continue;
    }

    const merged = firingFromDoc(bf);
    if (!merged) continue;
    if (existing) replaced.set(existing.id, merged);
    else added.push(merged);
  }

  return [
    ...added,
    ...localFirings
      .filter((f) => !removed.has(f.id))
      .map((f) => replaced.get(f.id) ?? f),
  ];
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
      firings: mergeBackendFiringsIntoLocal(query.data, useAppStore.getState().firings),
    });
  }, [query.data]);

  return query;
}

export function useCreateFiringMutation() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const updateFiring = useAppStore((s) => s.updateFiring);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (firing: Firing) => {
      if (!isSignedIn) return null;
      const backendId = await pushFiring(firing);
      return { firing, backendId };
    },
    onSuccess: (result) => {
      if (!result?.backendId) return;
      updateFiring({ ...result.firing, backendId: result.backendId });
      void queryClient.invalidateQueries({ queryKey: FIRINGS_QUERY_KEY });
    },
    onError: () => {
      useAppStore.getState().showToast('Could not save firing', 'error');
    },
  });
}

export function useUpdateFiringMutation() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  return useMutation({
    mutationFn: async (firing: Firing) => {
      if (!isSignedIn) return;
      await pushFiring(firing);
    },
    onError: () => {
      useAppStore.getState().showToast('Could not update firing', 'error');
    },
  });
}

export function useDeleteFiringMutation() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  return useMutation({
    mutationFn: async (firing: Firing) => {
      if (!isSignedIn) return;
      await pushFiring(firing, true);
    },
    onError: () => {
      useAppStore.getState().showToast('Could not delete firing on server', 'error');
    },
  });
}
