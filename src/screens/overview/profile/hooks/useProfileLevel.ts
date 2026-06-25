import { useMemo } from 'react';
import {
  BADGE_REGISTRY,
  countEarnedBadges,
  getNextTitle,
  getTitleForBadges,
} from '../constants/badgeRegistry';
import { useBadgeContext } from './useBadgeStates';

export function useProfileLevel() {
  const ctx = useBadgeContext();

  return useMemo(() => {
    const earnedCount = countEarnedBadges(ctx);
    const totalBadges = BADGE_REGISTRY.length;
    const progress = totalBadges > 0 ? earnedCount / totalBadges : 0;
    const currentTitle = getTitleForBadges(earnedCount);
    const nextTitle = getNextTitle(earnedCount);

    return {
      earnedCount,
      totalBadges,
      progress,
      title: currentTitle.title,
      nextTitle: nextTitle?.title ?? null,
      badgesUntilNext: nextTitle ? nextTitle.min - earnedCount : 0,
    };
  }, [ctx]);
}
