import { useRouter } from 'expo-router';
import React from 'react';
import type { BadgeState } from '../constants/badgeRegistry';
import { JourneyAchievementsTeaser } from './chronicle/JourneyAchievementsTeaser';

export function JourneyBadgesSection({ badges }: { badges: BadgeState[] }) {
  const router = useRouter();

  return (
    <JourneyAchievementsTeaser
      badges={badges}
      onViewAll={() => router.push('/profile/badges' as never)}
    />
  );
}
