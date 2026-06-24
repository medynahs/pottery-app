import type { BackendChallenge } from '@/src/services/challenges';
import type { ChallengePhase } from '@/src/screens/community/types';

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const end = new Date(iso);
  if (Number.isNaN(end.getTime())) return null;
  const diffMs = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/** Resolve lifecycle phase from explicit status or challenge dates. */
export function resolveChallengePhase(challenge: BackendChallenge | null): ChallengePhase {
  if (!challenge) return 'open';

  if (challenge.status === 'open' || challenge.status === 'voting' || challenge.status === 'closed') {
    return challenge.status;
  }

  const now = Date.now();
  const submissionEnd = challenge.submission_deadline
    ? new Date(challenge.submission_deadline).getTime()
    : challenge.ends_at
      ? new Date(challenge.ends_at).getTime()
      : null;
  const votingEnd = challenge.voting_ends_at
    ? new Date(challenge.voting_ends_at).getTime()
    : null;

  if (submissionEnd !== null && now < submissionEnd) return 'open';
  if (votingEnd !== null && now < votingEnd) return 'voting';
  if (votingEnd !== null && now >= votingEnd) return 'closed';
  if (submissionEnd !== null && now >= submissionEnd) return 'voting';

  return 'open';
}

export function getPhaseSubtitle(
  challenge: BackendChallenge | null,
  phase: ChallengePhase,
): string | undefined {
  if (phase === 'open') {
    const days = daysUntil(challenge?.submission_deadline ?? challenge?.ends_at);
    if (days === null) return undefined;
    if (days === 0) return 'Last day';
    return `${days} day${days === 1 ? '' : 's'} left`;
  }

  if (phase === 'voting') {
    const days = daysUntil(challenge?.voting_ends_at);
    if (days === null) return undefined;
    if (days === 0) return 'Last day to vote';
    return `${days} day${days === 1 ? '' : 's'} left`;
  }

  const days = daysUntil(
    challenge?.next_challenge_starts_at ?? challenge?.winners_display_until,
  );
  if (days === null) return undefined;
  if (days === 0) return 'New challenge soon';
  return `New challenge in ${days} day${days === 1 ? '' : 's'}`;
}

export function getPrimaryCtaLabel(
  phase: ChallengePhase,
  joined: boolean,
  hasSubmitted: boolean,
): string {
  if (phase === 'voting') return 'Vote on submissions';
  if (phase === 'closed') return 'Browse submissions';

  if (!joined) return 'Join this challenge';
  if (!hasSubmitted) return 'Submit my entry';
  return 'Browse submissions';
}

export function getSecondaryCtaLabel(
  phase: ChallengePhase,
  joined: boolean,
  hasSubmitted: boolean,
): string | undefined {
  if (phase === 'closed') return 'Browse past winners';
  if (phase === 'voting') return undefined;
  if (joined && hasSubmitted) return 'Browse submissions';
  return undefined;
}
