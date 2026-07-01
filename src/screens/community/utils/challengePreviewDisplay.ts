import { ACTIVE_CHALLENGE } from '@/src/screens/community/data';
import type { ChallengeDisplay } from '@/src/screens/community/utils/challengeDisplay';

// ACTIVE_CHALLENGE retained for accent color token only.

/** Placeholder when the challenges API has no active challenge (production). */
export function buildPreviewChallengeDisplay(): ChallengeDisplay {
  return {
    id: 'preview-no-challenge',
    title: 'Next challenge soon',
    description: 'A new community challenge will open here. Check back soon.',
    participantCount: 0,
    daysLeft: 0,
    label: 'Community challenge',
    isActive: false,
    endsAt: null,
    emoji: '🏆',
    gradientColors: ['#5A7A52', '#3D5A38'] as const,
    accentColor: ACTIVE_CHALLENGE.accentColor,
  };
}
