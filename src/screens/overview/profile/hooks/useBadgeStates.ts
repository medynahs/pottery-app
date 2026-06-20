import { useVisiblePieces, useAppStore } from '@/src/store/appStore';
import { useMemo } from 'react';
import {
  buildBadgeContext,
  computeBadgeStates,
  type BadgeState,
} from '../constants/badgeRegistry';

export function useBadgeStates(): BadgeState[] {
  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);
  const glazes = useAppStore((s) => s.glazes);

  return useMemo(() => {
    const ctx = buildBadgeContext(pieces, firings, glazes);
    return computeBadgeStates(ctx);
  }, [pieces, firings, glazes]);
}
