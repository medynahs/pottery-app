import { ANALYTICS_THEME } from '@/src/screens/analytics/analyticsTheme';

/** Warm studio palette, aligned with Profile and Analytics. */
export const COMMUNITY_THEME = {
  ...ANALYTICS_THEME,
  pageBg: ANALYTICS_THEME.pageBg,
  challengeHero: ['#6B9E78', '#3D6B4A'] as const,
  challengeHeroSoft: ['#8BB896', '#4A7A58'] as const,
  festivalMuted: 'hsl(280 25% 94%)',
  reactionActiveBg: 'hsl(39 57% 51% / 0.14)',
  reactionActiveBorder: 'hsl(39 57% 51% / 0.45)',
  reactionIdleBg: 'hsl(40 50% 99%)',
  stepDone: 'hsl(142 50% 42%)',
  stepPending: 'hsl(34 28% 82%)',
} as const;
