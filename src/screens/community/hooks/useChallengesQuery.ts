import {
  apiListChallenges,
  type BackendChallenge,
} from '@/src/services/challenges';
import { useAppStore } from '@/src/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const CHALLENGES_QUERY_KEY = ['community', 'challenges'] as const;

const CHALLENGES_STALE_MS = 5 * 60 * 1000;

export function useChallengesQuery() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  return useQuery({
    queryKey: CHALLENGES_QUERY_KEY,
    queryFn: () => apiListChallenges(),
    enabled: isSignedIn,
    staleTime: CHALLENGES_STALE_MS,
    placeholderData: (previous) => previous,
  });
}

export function usePatchChallengesCache() {
  const queryClient = useQueryClient();

  return useCallback(
    (challengeId: string, patch: Partial<BackendChallenge>) => {
      queryClient.setQueryData<BackendChallenge[]>(CHALLENGES_QUERY_KEY, (items) =>
        items?.map((item) => (item.id === challengeId ? { ...item, ...patch } : item)) ?? items,
      );
    },
    [queryClient],
  );
}

export function useRefreshChallenges() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: CHALLENGES_QUERY_KEY });
  }, [queryClient]);
}
