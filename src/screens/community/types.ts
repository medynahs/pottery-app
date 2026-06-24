// src/screens/community/types.ts

import type { ImageSourcePropType } from 'react-native';

export type FilterTab =
  | 'For You'
  | 'Challenges'
  | 'Hall of Fame';

export type ChallengePhase = 'open' | 'voting' | 'closed';

export type ChallengeWinnerDisplay = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  challengeDescription: string;
  challengeLabel: string;
  challengeEmoji: string;
  heroImage: ImageSourcePropType;
  trackId: string;
  trackTitle: string;
  artistName: string;
  studioName: string;
  pieceTitle: string;
  processNote: string;
  imageSource: ImageSourcePropType;
  voteCount: number;
  wonAt: string;
};

export type ChallengeEntryDisplay = {
  id: string;
  trackId: string;
  trackTitle: string;
  artistName: string;
  studioName: string;
  pieceTitle: string;
  processNote: string;
  imageSource: ImageSourcePropType;
  baseVoteCount: number;
  rank?: number;
};

export type MonthlyChallenge = {
  emoji: string;
  label: string;
  title: string;
  description: string;
  joined: number;
  daysLeft: number;
  accentColor: string;
  bgColor: string;
  borderColor: string;
};

export type FestivalTrack = {
  id: string;
  title: string;
  summary: string;
  participants: number;
};

export type Festival = {
  name: string;
  tagline: string;
  emoji: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  daysLeft: number;
  totalParticipants: number;
  rules: string[];
  tracks: FestivalTrack[];
};
