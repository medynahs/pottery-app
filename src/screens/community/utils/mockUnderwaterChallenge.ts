import type { ChallengeDisplay } from '@/src/screens/community/utils/challengeDisplay';
import { ACTIVE_FESTIVAL } from '@/src/screens/community/data';

/** Stable id, never sent to the real API. */
export const MOCK_UNDERWATER_CHALLENGE_ID = 'mock-underwater-forms';

export const UNDERWATER_HERO_IMAGE = require('../../../../assets/images/under.jpg');

export const MOCK_UNDERWATER_CHALLENGE: ChallengeDisplay = {
  id: MOCK_UNDERWATER_CHALLENGE_ID,
  title: ACTIVE_FESTIVAL.name,
  description: ACTIVE_FESTIVAL.tagline,
  participantCount: ACTIVE_FESTIVAL.totalParticipants,
  daysLeft: ACTIVE_FESTIVAL.daysLeft,
  label: 'Seasonal Challenge',
  isActive: true,
  endsAt: null,
  isMock: true,
  emoji: ACTIVE_FESTIVAL.emoji,
  gradientColors: ['#2A6B7C', '#134252'] as const,
  accentColor: ACTIVE_FESTIVAL.accentColor,
  heroImage: UNDERWATER_HERO_IMAGE,
};

export function isMockChallengeId(id: string): boolean {
  return id === MOCK_UNDERWATER_CHALLENGE_ID || id.startsWith('mock-');
}

export function createMockEntryId(): string {
  return `mock-entry-${Date.now()}`;
}
