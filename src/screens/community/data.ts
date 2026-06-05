// src/screens/community/data.ts
import type { Creator, Festival, FestivalTrack, FilterTab, MonthlyChallenge, PollOption, WallOfFameEntry } from './types';

export const FILTERS: FilterTab[] = ['For You', 'Challenges', 'Hall of Fame', 'Events'];

export const ACTIVE_CHALLENGE: MonthlyChallenge = {
  emoji: '🥣',
  label: 'March Challenge',
  title: 'The Humble Bowl',
  description: 'Throw the most honest, beautiful bowl you can. No handles, no decorations — just form.',
  joined: 124,
  daysLeft: 23,
  accentColor: 'hsl(100 35% 44%)',
  bgColor: 'hsl(100 25% 96%)',
  borderColor: 'hsl(100 20% 85%)',
};

export const POLL_OPTIONS: PollOption[] = [
  { label: "Yuki's Soda Matte", votes: 48 },
  { label: "Tariq's Iron Red", votes: 35 },
  { label: "Susan's Speckled Cream", votes: 61 },
];
export const POLL_TOTAL = 144;

export const FOLLOW_CREATORS: Creator[] = [
  { name: 'Tariq B.', avatar: 'T', specialty: 'Iron Red', color: 'hsl(25 90% 55%)' },
  { name: 'Yuki R.', avatar: 'Y', specialty: 'Soda Firing', color: 'hsl(213 80% 55%)' },
  { name: 'Mara L.', avatar: 'M', specialty: 'Sculptural', color: 'hsl(340 75% 50%)' },
  { name: 'Adele K.', avatar: 'A', specialty: 'Handbuilding', color: 'hsl(270 60% 55%)' },
];

export const FESTIVAL_TRACKS: FestivalTrack[] = [
  { id: 'beginner', title: 'Beginner Track', summary: 'Wheel fundamentals and form consistency with guided prompts.', participants: 86 },
  { id: 'intermediate', title: 'Intermediate Track', summary: 'Refine trimming rhythm and glaze pairing decisions.', participants: 54 },
  { id: 'advanced', title: 'Advanced Track', summary: 'Push form language, atmosphere risk, and presentation polish.', participants: 22 },
];

export const ACTIVE_FESTIVAL: Festival = {
  name: 'Underwater Forms Festival',
  tagline: 'Let the ocean move your hands. Make something that holds water, memory, or both.',
  emoji: '🌊',
  accentColor: 'hsl(100 35% 44%)',
  bgColor: 'hsl(100 25% 96%)',
  borderColor: 'hsl(100 20% 85%)',
  daysLeft: 6,
  totalParticipants: 162,
  rules: [
    'One submission per potter — make it count.',
    'Any forming method is allowed: wheel, hand-building, or sculpting.',
    'The piece must be fired at least once (bisque counts for the submission photo).',
    'Photo must be taken by you and show the finished piece clearly.',
    'Glazing and surface treatment are entirely your choice.',
    'No collaborative or AI-assisted work.',
  ],
  tracks: FESTIVAL_TRACKS,
};

export const WALL_OF_FAME: WallOfFameEntry[] = [
  { name: 'Mara L.', title: 'Best Surface Story', piece: 'Ash-run Vessel', badge: 'Festival Winner' },
  { name: 'Chen W.', title: 'Most Improved Form', piece: 'Nest Bowl Set', badge: 'Mission Streak' },
  { name: 'Yuki R.', title: 'Community Favorite', piece: 'Moon Teapot', badge: 'Top Vote' },
];
