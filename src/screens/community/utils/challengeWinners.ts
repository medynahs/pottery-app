import type { BackendChallengeWinner } from '@/src/services/challenges';
import type { ChallengeEntryDisplay, ChallengeWinnerDisplay } from '@/src/screens/community/types';
import type { BackendChallengeEntry } from '@/src/services/challenges';
import type { MockHallOfFameCycle, MockHallOfFameWinner } from '@/src/screens/community/mock/challengeMockTypes';
import { UNDERWATER_HERO_IMAGE } from '@/src/screens/community/utils/mockUnderwaterChallenge';

function imageFromUrl(url: string | null | undefined) {
  if (!url?.trim()) return { uri: '' };
  return { uri: url };
}

export function backendWinnerToDisplay(
  winner: BackendChallengeWinner,
  challenge: { id: string; title: string; description?: string },
): ChallengeWinnerDisplay {
  const heroUrl = winner.hero_image_url ?? winner.image_url;
  return {
    id: winner.id,
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    challengeDescription: challenge.description?.trim() ?? '',
    challengeLabel: 'Challenge winner',
    challengeEmoji: '🏆',
    heroImage: imageFromUrl(heroUrl),
    trackId: winner.track_id,
    trackTitle: winner.track_title,
    artistName: winner.artist_name,
    studioName: winner.studio_name?.trim() ?? '',
    pieceTitle: winner.piece_title,
    processNote: winner.process_note?.trim() ?? '',
    imageSource: imageFromUrl(winner.image_url),
    voteCount: winner.vote_count,
    wonAt: winner.won_at,
  };
}

export function mockWinnerToDisplay(winner: MockHallOfFameWinner): ChallengeWinnerDisplay {
  return {
    id: winner.id,
    challengeId: winner.challengeId,
    challengeTitle: winner.challengeTitle,
    challengeDescription: winner.challengeDescription,
    challengeLabel: winner.challengeLabel,
    challengeEmoji: winner.challengeEmoji,
    heroImage: winner.heroImage,
    trackId: winner.trackId,
    trackTitle: winner.trackTitle,
    artistName: winner.artistName,
    studioName: winner.studioName,
    pieceTitle: winner.pieceTitle,
    processNote: winner.processNote,
    imageSource: winner.imageSource,
    voteCount: winner.voteCount,
    wonAt: winner.wonAt,
  };
}

export function mockCycleToWinners(cycle: MockHallOfFameCycle): ChallengeWinnerDisplay[] {
  return cycle.winners.map(mockWinnerToDisplay);
}

export function backendEntryToDisplay(
  entry: BackendChallengeEntry,
  trackTitle: string,
): ChallengeEntryDisplay {
  return {
    id: entry.id,
    trackId: entry.track_id ?? 'default',
    trackTitle,
    artistName: entry.artist_name?.trim() || 'Potter',
    studioName: entry.studio_name?.trim() ?? '',
    pieceTitle: entry.piece_title?.trim() || 'Untitled piece',
    processNote: entry.process_note?.trim() || entry.note?.trim() || '',
    imageSource: imageFromUrl(entry.image_url),
    baseVoteCount: entry.vote_count ?? 0,
    rank: entry.rank,
  };
}

/** Placeholder hero when API winner has no hero image. */
export const DEFAULT_WINNER_HERO = UNDERWATER_HERO_IMAGE;
