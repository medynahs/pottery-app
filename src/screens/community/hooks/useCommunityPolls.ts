import { apiGetPolls, apiVotePoll, type BackendPoll } from '@/src/services/community';
import { defaultQueryRetry, STABLE_QUERY_OPTIONS } from '@/src/lib/queryRetry';
import { useAppStore } from '@/src/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { COMMUNITY_POLLS_QUERY_KEY } from '../queryKeys';

export { COMMUNITY_POLLS_QUERY_KEY } from '../queryKeys';

const POLLS_STALE_MS = 15 * 60 * 1000;

export type CommunityPollView = {
  id: string;
  question: string;
  options: { id: string; label: string; votes: number }[];
  votedOptionId: string | null;
  totalVotes: number;
};

function mapBackendPoll(poll: BackendPoll): CommunityPollView {
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      votes: opt.votes,
    })),
    votedOptionId: poll.voted_option_id,
    totalVotes: poll.total_votes,
  };
}

export function useCommunityPolls() {
  const queryClient = useQueryClient();
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const query = useQuery({
    queryKey: COMMUNITY_POLLS_QUERY_KEY,
    queryFn: async () => {
      const data = await apiGetPolls();
      return data ?? [];
    },
    enabled: isSignedIn,
    staleTime: POLLS_STALE_MS,
    placeholderData: (previous) => previous,
    retry: defaultQueryRetry,
    ...STABLE_QUERY_OPTIONS,
  });

  const polls = useMemo(
    (): CommunityPollView[] => (query.data ?? []).map(mapBackendPoll),
    [query.data],
  );

  const vote = useCallback(
    async (poll: CommunityPollView, optionId: string) => {
      if (!isSignedIn) return;
      const updated = await apiVotePoll(poll.id, optionId);
      queryClient.setQueryData<BackendPoll[]>(COMMUNITY_POLLS_QUERY_KEY, (prev) =>
        prev?.map((item) => (item.id === updated.id ? updated : item)) ?? prev,
      );
    },
    [isSignedIn, queryClient],
  );

  const reload = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: COMMUNITY_POLLS_QUERY_KEY });
  }, [queryClient]);

  return { polls, loading: query.isLoading, reload, vote };
}
