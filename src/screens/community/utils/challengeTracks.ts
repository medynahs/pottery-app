import type { BackendChallenge, BackendChallengeTrack } from '@/src/services/challenges';

/** Tracks from the API only — never invent local slug IDs for live challenges. */
export function resolveChallengeTracks(challenge: BackendChallenge | null): BackendChallengeTrack[] {
  if (!challenge?.tracks?.length) return [];
  return challenge.tracks;
}

export function trackTitleFromChallenge(challenge: BackendChallenge | null, trackId: string): string {
  const track = resolveChallengeTracks(challenge).find((t) => t.id === trackId);
  return track?.title ?? trackId;
}
