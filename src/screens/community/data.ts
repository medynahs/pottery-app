// src/screens/community/data.ts
import type { Festival, FestivalTrack, FilterTab, MonthlyChallenge } from './types';

export const FILTERS: FilterTab[] = ['For You', 'Challenges', 'Hall of Fame'];

export const ACTIVE_CHALLENGE: MonthlyChallenge = {
  emoji: '🥣',
  label: 'March Challenge',
  title: 'The Humble Bowl',
  description: 'Throw the most honest, beautiful bowl you can. No handles, no decorations, just form.',
  joined: 124,
  daysLeft: 23,
  accentColor: 'hsl(100 35% 44%)',
  bgColor: 'hsl(100 25% 96%)',
  borderColor: 'hsl(100 20% 85%)',
};

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
    'One submission per potter, make it count.',
    'Any forming method is allowed: wheel, hand-building, or sculpting.',
    'The piece must be fired at least once (bisque counts for the submission photo).',
    'Photo must be taken by you and show the finished piece clearly.',
    'Glazing and surface treatment are entirely your choice.',
    'No collaborative or AI-assisted work.',
  ],
  tracks: FESTIVAL_TRACKS,
};
