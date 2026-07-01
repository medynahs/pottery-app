import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import { ACTIVE_FESTIVAL } from '@/src/screens/community/data';
import type { Festival } from '@/src/screens/community/types';
import { resolveChallengeTracks } from '@/src/screens/community/utils/challengeTracks';
import type { BackendChallenge } from '@/src/services/challenges';

export function challengeToSignup(challenge: BackendChallenge): Festival {
  return challengeToFestival(challenge);
}

export function challengeToFestival(challenge: BackendChallenge): Festival {
  return {
    name: challenge.name,
    tagline: challenge.description,
    emoji: '🏆',
    accentColor: COMMUNITY_THEME.accent,
    bgColor: ACTIVE_FESTIVAL.bgColor,
    borderColor: ACTIVE_FESTIVAL.borderColor,
    daysLeft: 0,
    totalParticipants: challenge.participant_count ?? 0,
    rules: ACTIVE_FESTIVAL.rules,
    tracks: resolveChallengeTracks(challenge).map((track) => ({
      id: track.id,
      title: track.title,
      summary: track.summary ?? '',
      participants: track.participant_count ?? 0,
    })),
  };
}
