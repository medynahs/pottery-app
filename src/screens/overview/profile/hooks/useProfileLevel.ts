import { useVisiblePieces, useAppStore } from '@/src/store/appStore';
import { useMemo } from 'react';
import {
  BADGE_REGISTRY,
  buildBadgeContext,
  countEarnedBadges,
  getNextTitle,
  getTitleForBadges,
} from '../constants/badgeRegistry';

export function useProfileLevel() {
  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);
  const glazes = useAppStore((s) => s.glazes);

  return useMemo(() => {
    const ctx = buildBadgeContext(pieces, firings, glazes);
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
  }, [pieces, firings, glazes]);
}
