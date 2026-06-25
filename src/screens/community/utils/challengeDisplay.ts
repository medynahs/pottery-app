import type { BackendChallenge } from '@/src/services/challenges';
import type { ImageSourcePropType } from 'react-native';
import { resolveChallengePhase } from '@/src/screens/community/utils/challengePhase';

export type ChallengeDisplay = {
  id: string;
  title: string;
  description: string;
  participantCount: number;
  daysLeft: number | null;
  label: string;
  isActive: boolean;
  endsAt: Date | null;
  /** Preview challenge for local UI testing when the API has no active challenge. */
  isMock?: boolean;
  emoji?: string;
  gradientColors?: readonly [string, string];
  accentColor?: string;
  heroImage?: ImageSourcePropType;
};

function challengeLabel(challenge: BackendChallenge): string {
  const start = challenge.start_date ? new Date(challenge.start_date) : null;
  if (start && !Number.isNaN(start.getTime())) {
    return `${start.toLocaleDateString(undefined, { month: 'long' })} Challenge`;
  }
  return 'Monthly Challenge';
}

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const end = new Date(iso);
  if (Number.isNaN(end.getTime())) return null;
  const diffMs = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function isChallengeActive(challenge: BackendChallenge): boolean {
  const phase = resolveChallengePhase(challenge);
  if (phase === 'open' || phase === 'voting') return true;
  if (phase === 'closed') {
    const until = challenge.winners_display_until
      ? new Date(challenge.winners_display_until).getTime()
      : null;
    return until === null || until > Date.now();
  }
  return false;
}

export function pickPrimaryChallenge(challenges: BackendChallenge[]): BackendChallenge | null {
  if (!challenges.length) return null;

  const phaseOrder = (challenge: BackendChallenge) => {
    const phase = resolveChallengePhase(challenge);
    if (phase === 'open') return 0;
    if (phase === 'voting') return 1;
    if (phase === 'closed') return 2;
    return 3;
  };

  const active = [...challenges]
    .filter(isChallengeActive)
    .sort((a, b) => phaseOrder(a) - phaseOrder(b));

  return active[0] ?? challenges[0] ?? null;
}

export function toChallengeDisplay(challenge: BackendChallenge): ChallengeDisplay {
  return {
    id: challenge.id,
    title: challenge.name?.trim() || 'Community Challenge',
    description:
      challenge.description?.trim() ||
      'Make something on theme, share it on the feed, and join fellow potters in the studio.',
    participantCount: challenge.participant_count ?? 0,
    daysLeft: daysUntil(challenge.end_date),
    label: challengeLabel(challenge),
    isActive: isChallengeActive(challenge),
    endsAt: challenge.end_date ? new Date(challenge.end_date) : null,
    heroImage: challenge.hero_image_url ? { uri: challenge.hero_image_url } : undefined,
  };
}

export function challengeEntryId(challenge: BackendChallenge | null): string | null {
  if (!challenge) return null;
  return challenge.my_entry_id ?? null;
}

export function challengeIsJoined(challenge: BackendChallenge | null): boolean {
  if (!challenge) return false;
  return Boolean(challenge.is_joined ?? challenge.my_entry_id);
}

export function challengeHasSubmitted(challenge: BackendChallenge | null): boolean {
  if (!challenge) return false;
  return Boolean(challenge.has_submitted);
}
