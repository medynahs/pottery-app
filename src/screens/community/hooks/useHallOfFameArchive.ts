import { apiGetHallOfFameArchive } from '@/src/services/community';
import { defaultQueryRetry, STABLE_QUERY_OPTIONS } from '@/src/lib/queryRetry';
import { useAppStore } from '@/src/store';
import { useQuery } from '@tanstack/react-query';
import { HALL_OF_FAME_QUERY_KEY } from '../queryKeys';

export { HALL_OF_FAME_QUERY_KEY } from '../queryKeys';

const HALL_OF_FAME_STALE_MS = 15 * 60 * 1000;

export function useHallOfFameArchive() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  return useQuery({
    queryKey: HALL_OF_FAME_QUERY_KEY,
    queryFn: () => apiGetHallOfFameArchive(),
    enabled: isSignedIn,
    staleTime: HALL_OF_FAME_STALE_MS,
    placeholderData: (previous) => previous,
    retry: defaultQueryRetry,
    ...STABLE_QUERY_OPTIONS,
  });
}
