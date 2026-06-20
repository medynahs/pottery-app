import type { BackendChallenge } from '@/src/services/challenges';
import type { ImageSourcePropType } from 'react-native';

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
  const start = challenge.starts_at ? new Date(challenge.starts_at) : null;
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
  const now = Date.now();
  const start = challenge.starts_at ? new Date(challenge.starts_at).getTime() : 0;
  const end = challenge.ends_at
    ? new Date(challenge.ends_at).getTime()
    : Number.POSITIVE_INFINITY;
  return now >= start && now <= end;
}

export function pickPrimaryChallenge(challenges: BackendChallenge[]): BackendChallenge | null {
  if (!challenges.length) return null;
  const active = challenges.find(isChallengeActive);
  return active ?? challenges[0] ?? null;
}

export function toChallengeDisplay(challenge: BackendChallenge): ChallengeDisplay {
  return {
    id: challenge.id,
    title: challenge.title?.trim() || 'Community Challenge',
    description:
      challenge.description?.trim() ||
      'Make something on theme, share it on the feed, and join fellow potters in the studio.',
    participantCount: challenge.participant_count ?? 0,
    daysLeft: daysUntil(challenge.ends_at),
    label: challengeLabel(challenge),
    isActive: isChallengeActive(challenge),
    endsAt: challenge.ends_at ? new Date(challenge.ends_at) : null,
  };
}

export function challengeEntryId(challenge: BackendChallenge | null): string | null {
  if (!challenge) return null;
  return (challenge as unknown as { my_entry_id?: string | null }).my_entry_id ?? null;
}
