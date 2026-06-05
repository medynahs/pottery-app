// src/screens/community/types.ts

export type FilterTab =
  | 'For You'
  | 'Challenges'
  | 'Hall of Fame'
  | 'Events'
  | 'Drops';

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

export type PollOption = {
  label: string;
  votes: number;
};

export type Creator = {
  name: string;
  avatar: string;
  specialty: string;
  color: string;
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

export type WallOfFameEntry = {
  name: string;
  title: string;
  piece: string;
  badge: string;
};
