import { apiGetHallOfFameArchive } from '@/src/services/community';
import { useAppStore } from '@/src/store';
import { useQuery } from '@tanstack/react-query';

export const HALL_OF_FAME_QUERY_KEY = ['community', 'hallOfFame'] as const;

const HALL_OF_FAME_STALE_MS = 10 * 60 * 1000;

export function useHallOfFameArchive() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  return useQuery({
    queryKey: HALL_OF_FAME_QUERY_KEY,
    queryFn: () => apiGetHallOfFameArchive(),
    enabled: isSignedIn,
    staleTime: HALL_OF_FAME_STALE_MS,
    placeholderData: (previous) => previous,
  });
}
