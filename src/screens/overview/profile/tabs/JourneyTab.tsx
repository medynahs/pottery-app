import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import { useVisiblePieces, useAppStore } from '@/src/store/appStore';
import { Box, BookOpen, Flame, Layers, Star } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { buildBadgeContext } from '../constants/badgeRegistry';
import { useBadgeStates } from '../hooks/useBadgeStates';
import { useProfileLevel } from '../hooks/useProfileLevel';
import { buildJourneyMilestones } from '../utils/buildJourneyMilestones';
import { JourneyBadgesSection } from '../components/JourneyBadgesSection';
import { JourneyHero } from '../components/JourneyHero';
import { JourneyStatGrid } from '../components/JourneyStatGrid';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { PROFILE_THEME } from '../profileTheme';

export function JourneyTab() {
  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);
  const glazes = useAppStore((s) => s.glazes);
  const level = useProfileLevel();

  const badges = useBadgeStates();
  const ctx = useMemo(() => buildBadgeContext(pieces, firings, glazes), [pieces, firings, glazes]);

  const survivalRate = useMemo(() => {
    if (ctx.totalPieces === 0) return 0;
    const survived = Math.max(0, ctx.totalPieces - ctx.failedPieces);
    return Math.round((survived / ctx.totalPieces) * 100);
  }, [ctx.failedPieces, ctx.totalPieces]);

  const finishRate = useMemo(() => {
    if (ctx.totalPieces === 0) return 0;
    return Math.round((ctx.finishedPieces / ctx.totalPieces) * 100);
  }, [ctx.finishedPieces, ctx.totalPieces]);

  const badgeProgressPct = level.totalBadges > 0
    ? Math.round((level.earnedCount / level.totalBadges) * 100)
    : 0;

  const stats = useMemo(
    () => [
      { key: 'pieces', label: 'Total pieces', value: `${ctx.totalPieces}`, sub: 'logged in studio', tone: 'clay' as const, icon: Layers },
      { key: 'finished', label: 'Finished', value: `${ctx.finishedPieces}`, sub: 'ready to share', tone: 'finish' as const, icon: Star },
      { key: 'firings', label: 'Firings', value: `${ctx.totalFirings}`, sub: `${ctx.bisqueFirings} bisque · ${ctx.glazeFirings} glaze`, tone: 'kiln' as const, icon: Flame },
      { key: 'atlas', label: 'Glaze families', value: `${ctx.atlasRecipeFamilies}`, sub: 'in your atlas', tone: 'atlas' as const, icon: BookOpen },
    ],
    [ctx],
  );

  const timeline = useMemo(() => buildJourneyMilestones(pieces, firings), [pieces, firings]);

  if (ctx.totalPieces === 0) {
    return (
      <View className="px-4 pb-6">
        <JourneyHero
          title={level.title}
          nextTitle={level.nextTitle}
          badgesUntilNext={level.badgesUntilNext}
          earnedCount={level.earnedCount}
          totalBadges={level.totalBadges}
          badgeProgress={badgeProgressPct}
          survivalRate={0}
          finishRate={0}
          totalPieces={0}
        />
        <EmptyState
          icon={Box}
          title="Your journey starts here"
          description="Add pieces, log firings, and build your glaze atlas to unlock badges and timeline milestones."
          variant="card"
        />
        <View className="mt-4">
          <JourneyBadgesSection badges={badges} />
        </View>
      </View>
    );
  }

  return (
    <View className="pb-6">
      <JourneyHero
        title={level.title}
        nextTitle={level.nextTitle}
        badgesUntilNext={level.badgesUntilNext}
        earnedCount={level.earnedCount}
        totalBadges={level.totalBadges}
        badgeProgress={badgeProgressPct}
        survivalRate={survivalRate}
        finishRate={finishRate}
        totalPieces={ctx.totalPieces}
      />

      <View className="px-4 mb-1">
        <Text
          style={{
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.1,
            color: PROFILE_THEME.inkMuted,
            textTransform: 'uppercase',
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          Studio snapshot
        </Text>
      </View>
      <JourneyStatGrid stats={stats} />

      <View className="px-4">
        <JourneyBadgesSection badges={badges} />
        <JourneyTimeline milestones={timeline} />
      </View>
    </View>
  );
}
