import { ACTIVE_CHALLENGE } from '@/src/screens/community/data';
import type { ChallengeDisplay } from '@/src/screens/community/utils/challengeDisplay';

/** Static preview when the challenges API has no active challenge (production v1). */
export function buildPreviewChallengeDisplay(): ChallengeDisplay {
  return {
    id: 'preview-humble-bowl',
    title: ACTIVE_CHALLENGE.title,
    description: ACTIVE_CHALLENGE.description,
    participantCount: 0,
    daysLeft: ACTIVE_CHALLENGE.daysLeft,
    label: ACTIVE_CHALLENGE.label,
    isActive: true,
    endsAt: null,
    isMock: false,
    emoji: ACTIVE_CHALLENGE.emoji,
    gradientColors: ['#5A7A52', '#3D5A38'] as const,
    accentColor: ACTIVE_CHALLENGE.accentColor,
  };
}
