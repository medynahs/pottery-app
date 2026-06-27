import {
  COMMUNITY_DEMO_POLL,
  type DemoPollOption,
} from '@/src/screens/community/data/communityDemoPoll';
import { apiGetPolls, apiVotePoll, type BackendPoll } from '@/src/services/community';
import { useAppStore } from '@/src/store';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type CommunityPollView = {
  id: string;
  question: string;
  options: { id: string; label: string; votes: number }[];
  votedOptionId: string | null;
  totalVotes: number;
  isDemo: boolean;
};

function buildDemoPollView(votedOptionId: string | null): CommunityPollView {
  const options = COMMUNITY_DEMO_POLL.options.map((opt: DemoPollOption) => ({
    id: opt.id,
    label: opt.label,
    votes: opt.seedVotes + (votedOptionId === opt.id ? 1 : 0),
  }));
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
  return {
    id: COMMUNITY_DEMO_POLL.id,
    question: COMMUNITY_DEMO_POLL.question,
    options,
    votedOptionId,
    totalVotes,
    isDemo: true,
  };
}

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
    isDemo: false,
  };
}

export function useCommunityPolls() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const demoPollVoteId = useAppStore((s) => s.communityDemoPollVoteId);
  const voteDemoPoll = useAppStore((s) => s.voteCommunityDemoPoll);
  const [livePolls, setLivePolls] = useState<BackendPoll[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSignedIn) {
      setLivePolls([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiGetPolls();
      setLivePolls(data ?? []);
    } catch {
      setLivePolls([]);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void load();
  }, [load]);

  const polls = useMemo((): CommunityPollView[] => {
    if (livePolls.length > 0) {
      return livePolls.map(mapBackendPoll);
    }
    return [buildDemoPollView(demoPollVoteId)];
  }, [livePolls, demoPollVoteId]);

  const vote = useCallback(
    async (poll: CommunityPollView, optionId: string) => {
      if (poll.isDemo) {
        voteDemoPoll(optionId);
        return;
      }
      if (!isSignedIn) return;
      const updated = await apiVotePoll(poll.id, optionId);
      setLivePolls((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    },
    [voteDemoPoll, isSignedIn],
  );

  return { polls, loading, reload: load, vote };
}
