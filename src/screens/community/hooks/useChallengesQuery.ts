import {
  apiListChallenges,
  type BackendChallenge,
} from '@/src/services/challenges';
import { defaultQueryRetry, STABLE_QUERY_OPTIONS } from '@/src/lib/queryRetry';
import { useAppStore } from '@/src/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { CHALLENGES_QUERY_KEY } from '../queryKeys';

export { CHALLENGES_QUERY_KEY } from '../queryKeys';

const CHALLENGES_STALE_MS = 10 * 60 * 1000;

export function useChallengesQuery() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  return useQuery({
    queryKey: CHALLENGES_QUERY_KEY,
    queryFn: () => apiListChallenges(),
    enabled: isSignedIn,
    staleTime: CHALLENGES_STALE_MS,
    placeholderData: (previous) => previous,
    retry: defaultQueryRetry,
    ...STABLE_QUERY_OPTIONS,
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
