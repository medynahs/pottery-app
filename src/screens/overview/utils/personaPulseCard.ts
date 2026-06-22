import type { StudioPiecePositions } from '@/src/screens/overview/utils/mapPiecesToStudioPositions';
import { buildOneThingCard, type PulseCard } from '@/src/screens/overview/utils/oneThingCard';
import { resolveKilnDestination } from '@/src/screens/overview/utils/kilnNavigation';
import type { OnboardingUserType } from '@/src/store/appStore';
import type { Firing } from '@/src/types/kiln';

type StudioSignals = {
  kilnReady: boolean;
  dryingTooLong: boolean;
  scrapOverflow: boolean;
};

export function buildPersonaOneThingCard({
  activeFiring,
  studioSignals,
  stagePositions,
  hasKilnTab,
  userType,
  firings,
  soldThisMonth,
}: {
  activeFiring: Firing | null;
  studioSignals: StudioSignals;
  stagePositions: StudioPiecePositions;
  hasKilnTab: boolean;
  userType: OnboardingUserType;
  firings: readonly Firing[];
  soldThisMonth: number;
}): PulseCard | null {
  const urgent = buildOneThingCard(activeFiring, studioSignals, stagePositions, hasKilnTab);
  if (urgent) return urgent;

  const kilnRoute = resolveKilnDestination(hasKilnTab);

  if (userType === 'studio-owner-technician') {
    const openSessions = firings.filter((f) => f.state !== 'completed').length;
    if (openSessions > 0) {
      return {
        emoji: '📋',
        title: `${openSessions} open firing session${openSessions !== 1 ? 's' : ''}`,
        subtitle: hasKilnTab ? 'Review sessions and studio queue on Kiln' : 'Track firings in Kiln',
        route: kilnRoute,
        accentBg: 'hsl(16 70% 94%)',
        accentBorder: 'hsl(16 60% 78%)',
        accentText: 'hsl(16 65% 38%)',
      };
    }
  }

  if (userType === 'business-owner' && soldThisMonth > 0) {
    return {
      emoji: '💰',
      title: `${soldThisMonth} sold this month`,
      subtitle: 'Review margin and production in Analytics',
      route: '/analytics',
      accentBg: 'hsl(280 40% 94%)',
      accentBorder: 'hsl(280 35% 78%)',
      accentText: 'hsl(280 45% 38%)',
    };
  }

  if (userType === 'business-owner') {
    const wip = stagePositions.workTable.length + stagePositions.dryingShelf.length;
    if (wip > 0) {
      return {
        emoji: '🪆',
        title: `${wip} piece${wip !== 1 ? 's' : ''} in production`,
        subtitle: 'Track progress toward your next sale',
        route: '/(tabs)/pieces',
        accentBg: 'hsl(280 40% 94%)',
        accentBorder: 'hsl(280 35% 78%)',
        accentText: 'hsl(280 45% 38%)',
      };
    }
  }

  return null;
}
