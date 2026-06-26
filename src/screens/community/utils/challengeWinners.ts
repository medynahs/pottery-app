import type { BackendChallengeWinner } from '@/src/services/challenges';
import type { BackendHallOfFameWinner, BackendHallOfFameWinnerDetail } from '@/src/services/community';
import type { ChallengeEntryDisplay, ChallengeWinnerDisplay } from '@/src/screens/community/types';
import type { BackendChallengeEntry } from '@/src/services/challenges';
import type { MockHallOfFameCycle, MockHallOfFameWinner } from '@/src/screens/community/mock/challengeMockTypes';
import { UNDERWATER_HERO_IMAGE } from '@/src/screens/community/utils/mockUnderwaterChallenge';

const DELETED_WINNER_LABEL = 'Former member';

function imageFromUrl(url: string | null | undefined, fallback = UNDERWATER_HERO_IMAGE) {
  if (!url?.trim()) return fallback;
  return { uri: url };
}

function winnerArtistLabel(
  artistName: string | null | undefined,
  userDeleted?: boolean,
): string {
  if (userDeleted) return DELETED_WINNER_LABEL;
  return artistName?.trim() || 'Potter';
}

export function hallOfFameWinnerToDisplay(
  winner: BackendHallOfFameWinner,
  cycle?: {
    challenge_id?: string;
    title?: string;
    description?: string | null;
    label?: string | null;
    emoji?: string | null;
  },
): ChallengeWinnerDisplay {
  const userDeleted = winner.user_deleted === true;
  const heroUrl = winner.hero_image_url ?? winner.image_url;
  const imageUrl = winner.image_url ?? winner.hero_image_url;

  return {
    id: winner.id,
    challengeId: cycle?.challenge_id ?? '',
    challengeTitle: cycle?.title ?? 'Challenge winner',
    challengeDescription: cycle?.description?.trim() ?? '',
    challengeLabel: cycle?.label?.trim() || 'Past challenge',
    challengeEmoji: cycle?.emoji?.trim() || '🏆',
    heroImage: imageFromUrl(heroUrl),
    trackId: winner.track_id,
    trackTitle: winner.track_title,
    artistName: winnerArtistLabel(winner.artist_name, userDeleted),
    studioName: userDeleted ? '' : winner.studio_name?.trim() ?? '',
    pieceTitle: winner.piece_title,
    processNote: userDeleted
      ? 'This winner\'s account was deleted. Their piece remains in the Hall of Fame archive.'
      : winner.process_note?.trim() ?? '',
    imageSource: imageFromUrl(imageUrl),
    voteCount: winner.vote_count,
    wonAt: winner.won_at,
    userDeleted,
  };
}

export function hallOfFameWinnerDetailToDisplay(
  winner: BackendHallOfFameWinnerDetail,
): ChallengeWinnerDisplay {
  return hallOfFameWinnerToDisplay(winner, {
    challenge_id: winner.challenge_id,
    title: winner.challenge_title,
    description: winner.challenge_description,
    label: winner.challenge_label,
    emoji: winner.challenge_emoji,
  });
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
