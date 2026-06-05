/**
 * useFiringsSync — React Query hooks that bridge /users/me/firings with the
 * local Zustand store.
 */

import {
    apiCreateFiring,
    apiDeleteFiring,
    apiListFirings,
    apiUpdateFiring,
    type BackendFiring,
} from '@/src/services/firings';
import { useAppStore } from '@/src/store';
import type { Firing } from '@/src/types/kiln';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const FIRINGS_QUERY_KEY = ['firings'] as const;
export const firingsQueryKey = (userId: string) => [...FIRINGS_QUERY_KEY, userId] as const;

function toLocalFiring(backend: BackendFiring, existing?: Firing): Firing {
  return {
    ...(existing ?? {
      id: existing?.id ?? `firing-${backend.id}`,
      kilnId: backend.kiln_id ?? '',
      name: backend.name,
      type: (backend.type as Firing['type']) ?? 'bisque',
      cone: backend.cone,
      state: backend.state,
      pieceIds: [],
      notes: backend.notes ?? '',
      createdAt: backend.created_at,
    }),
    backendId: backend.id,
    kilnId: backend.kiln_id ?? existing?.kilnId ?? '',
    studioId: backend.studio_id ?? existing?.studioId,
    name: backend.name,
    type: (backend.type as Firing['type']) ?? existing?.type ?? 'bisque',
    cone: backend.cone,
    state: backend.state,
    notes: backend.notes ?? existing?.notes ?? '',
    submissionDate: backend.scheduled_date ?? existing?.submissionDate,
    scheduledDate: backend.scheduled_date ?? existing?.scheduledDate,
    startedAt: backend.started_at ?? existing?.startedAt,
    completedAt: backend.completed_at ?? existing?.completedAt,
    createdAt: backend.created_at ?? existing?.createdAt ?? new Date().toISOString(),
  };
}

function mergeFiringsIntoStore(backendFirings: BackendFiring[]) {
  const state = useAppStore.getState();
  const localFirings = state.firings;

  const byBackendId = new Map(localFirings.filter((f) => f.backendId).map((f) => [f.backendId!, f]));
  const byLocalId = new Map(localFirings.map((f) => [f.id, f]));

  const mergedByLocalId = new Map<string, Firing>();

  for (const backend of backendFirings) {
    const existingByBackend = byBackendId.get(backend.id);
    const existingByLocal = byLocalId.get(`firing-${backend.id}`);
    const existing = existingByBackend ?? existingByLocal;
    const next = toLocalFiring(backend, existing);
    mergedByLocalId.set(next.id, next);
  }

  const retainedLocalOnly = localFirings.filter((f) => !f.backendId || !backendFirings.some((b) => b.id === f.backendId));
  useAppStore.setState({ firings: [...retainedLocalOnly, ...Array.from(mergedByLocalId.values())] });
}

export function useFiringsSync() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const oryIdentityId = useAppStore((s) => s.oryIdentityId);

  const query = useQuery({
    queryKey: firingsQueryKey(oryIdentityId ?? ''),
    queryFn: () => apiListFirings(sessionToken!),
    enabled: !!sessionToken && !!oryIdentityId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (!query.data) return;
    mergeFiringsIntoStore(query.data);
  }, [query.data]);

  return query;
}

export function useCreateFiringMutation() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const updateFiring = useAppStore((s) => s.updateFiring);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (firing: Firing) => {
      if (!sessionToken) return null;
      const backend = await apiCreateFiring(sessionToken, {
        kiln_id: firing.kilnId || undefined,
        studio_id: firing.studioId,
        name: firing.name,
        type: firing.type,
        cone: firing.cone,
        state: firing.state,
        notes: firing.notes,
        scheduled_date: firing.submissionDate ?? firing.scheduledDate,
      });
      return { firing, backend };
    },
    onSuccess: (result) => {
      if (!result) return;
      updateFiring({ ...result.firing, backendId: result.backend.id });
      void queryClient.invalidateQueries({ queryKey: FIRINGS_QUERY_KEY });
    },
    onError: () => {
      useAppStore.getState().showToast('Could not save firing', 'error');
    },
  });
}

export function useUpdateFiringMutation() {
  const sessionToken = useAppStore((s) => s.sessionToken);

  return useMutation({
    mutationFn: async (firing: Firing) => {
      if (!sessionToken || !firing.backendId) return;
      await apiUpdateFiring(sessionToken, firing.backendId, {
        kiln_id: firing.kilnId || undefined,
        studio_id: firing.studioId,
        name: firing.name,
        type: firing.type,
        cone: firing.cone,
        state: firing.state,
        notes: firing.notes,
        scheduled_date: firing.submissionDate ?? firing.scheduledDate,
        started_at: firing.startedAt,
        completed_at: firing.completedAt,
      });
    },
    onError: () => {
      useAppStore.getState().showToast('Could not update firing', 'error');
    },
  });
}

export function useDeleteFiringMutation() {
  const sessionToken = useAppStore((s) => s.sessionToken);

  return useMutation({
    mutationFn: async (firing: Firing) => {
      if (!sessionToken || !firing.backendId) return;
      await apiDeleteFiring(sessionToken, firing.backendId);
    },
    onError: () => {
      useAppStore.getState().showToast('Could not delete firing on server', 'error');
    },
  });
}
