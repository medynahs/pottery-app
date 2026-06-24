export type { ChallengePhase } from '../types';

export type MockChallengeEntry = {
  id: string;
  trackId: string;
  artistName: string;
  studioName: string;
  pieceTitle: string;
  processNote: string;
  imageSource: number;
  baseVoteCount: number;
  rank?: number;
};

export type MockHallOfFameWinner = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  challengeDescription: string;
  challengeLabel: string;
  challengeEmoji: string;
  heroImage: number;
  trackId: string;
  trackTitle: string;
  artistName: string;
  studioName: string;
  pieceTitle: string;
  processNote: string;
  imageSource: number;
  voteCount: number;
  wonAt: string;
};

export type MockHallOfFameCycle = {
  challengeId: string;
  title: string;
  label: string;
  emoji: string;
  closedAt: string;
  winners: MockHallOfFameWinner[];
};
