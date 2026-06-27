import { apiGetPolls, apiVotePoll, type BackendPoll } from '@/src/services/community';
import { useAppStore } from '@/src/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

export const COMMUNITY_POLLS_QUERY_KEY = ['community', 'polls'] as const;

const POLLS_STALE_MS = 5 * 60 * 1000;

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

export function useCommunityPolls(refreshKey = 0) {
  const queryClient = useQueryClient();
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const communityFeedRevision = useAppStore((s) => s.communityFeedRevision);

  const query = useQuery({
    queryKey: COMMUNITY_POLLS_QUERY_KEY,
    queryFn: async () => {
      const data = await apiGetPolls();
      return data ?? [];
    },
    enabled: isSignedIn,
    staleTime: POLLS_STALE_MS,
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    if (!isSignedIn || refreshKey === 0) return;
    void queryClient.invalidateQueries({ queryKey: COMMUNITY_POLLS_QUERY_KEY });
  }, [refreshKey, isSignedIn, queryClient]);

  useEffect(() => {
    if (!isSignedIn || communityFeedRevision === 0) return;
    void queryClient.invalidateQueries({ queryKey: COMMUNITY_POLLS_QUERY_KEY });
  }, [communityFeedRevision, isSignedIn, queryClient]);

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
