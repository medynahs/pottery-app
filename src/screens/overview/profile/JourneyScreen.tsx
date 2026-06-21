import { EmptyState } from '@/src/components/EmptyState';
import { DetailScreenShell } from '@/src/components/DetailScreenShell';
import { Text } from '@/src/components/ui/text';
import { useVisiblePieces, useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { BookOpen, Box, Flame, Layers, Star } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { buildBadgeContext } from './constants/badgeRegistry';
import { useBadgeStates } from './hooks/useBadgeStates';
import { useProfileLevel } from './hooks/useProfileLevel';
import { buildJourneyMilestones } from './utils/buildJourneyMilestones';
import { JourneyHero } from './components/JourneyHero';
import { JourneyStatGrid } from './components/JourneyStatGrid';
import { JourneyTimeline } from './components/JourneyTimeline';
import { ViewAllBadgesCard } from './components/ViewAllBadgesCard';

const TIMELINE_PREVIEW = 5;

export default function JourneyScreen() {
  const router = useRouter();
  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);
  const glazes = useAppStore((s) => s.glazes);
  const level = useProfileLevel();
  const badges = useBadgeStates();

  const ctx = useMemo(() => buildBadgeContext(pieces, firings, glazes), [pieces, firings, glazes]);
  const timeline = useMemo(() => buildJourneyMilestones(pieces, firings), [pieces, firings]);
  const recentTimeline = useMemo(() => timeline.slice(0, TIMELINE_PREVIEW), [timeline]);

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

  return (
    <DetailScreenShell
      title="Your journey"
      subtitle="Badges, milestones, and studio progress"
      onBack={() => router.back()}
    >
      {ctx.totalPieces === 0 ? (
        <View className="pb-8">
          <EmptyState
            icon={Box}
            title="Your journey starts here"
            description="Add pieces and log firings to unlock badges and timeline milestones."
          />
          <View className="px-6 mt-2">
            <ViewAllBadgesCard
              badges={badges}
              onPress={() => router.push('/profile/badges' as never)}
            />
          </View>
        </View>
      ) : (
        <View className="pb-8">
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

          <JourneyStatGrid stats={stats} />

          <View className="px-6">
            <ViewAllBadgesCard
              badges={badges}
              onPress={() => router.push('/profile/badges' as never)}
            />

            {recentTimeline.length > 0 ? (
              <JourneyTimeline
                milestones={recentTimeline}
                hint={
                  timeline.length > TIMELINE_PREVIEW
                    ? `Latest ${TIMELINE_PREVIEW} milestones`
                    : undefined
                }
              />
            ) : null}

            {timeline.length > TIMELINE_PREVIEW ? (
              <TouchableOpacity
                onPress={() => router.push('/profile/badges' as never)}
                activeOpacity={0.85}
                className="mt-2 mb-4 items-center py-2"
              >
                <Text className="text-xs font-bold text-primary">Open trophy shelf for all badges →</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}
    </DetailScreenShell>
  );
}
