import { DetailScreenShell } from '@/src/components/DetailScreenShell';
import { useVisibleFirings, useVisiblePieces, useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { BookOpen, Flame, Layers, Star } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useBadgeContext, useBadgeStates } from './hooks/useBadgeStates';
import { useProfileLevel } from './hooks/useProfileLevel';
import { buildJourneyMilestones } from './utils/buildJourneyMilestones';
import { getJourneyTagline, getStudioTenure } from './utils/journeyNarrative';
import { AchievementsPanel } from './components/badges/AchievementsPanel';
import { JourneyChronicleHero } from '@/src/screens/overview/profile/components/chronicle/JourneyChronicleHero';
import { JourneyChronicleTimeline } from '@/src/screens/overview/profile/components/chronicle/JourneyChronicleTimeline';
import { JourneyEmptyChronicle } from '@/src/screens/overview/profile/components/chronicle/JourneyEmptyChronicle';
import { JourneyPathStats } from '@/src/screens/overview/profile/components/chronicle/JourneyPathStats';
import {
  JourneyTabBar,
  type JourneyTab,
} from '@/src/screens/overview/profile/components/chronicle/JourneyTabBar';
import { ChronicleSectionLabel } from '@/src/screens/overview/profile/components/chronicle/ChronicleSectionLabel';

const TIMELINE_PREVIEW = 12;

type JourneyScreenProps = {
  initialTab?: JourneyTab;
};

export default function JourneyScreen({ initialTab = 'overview' }: JourneyScreenProps) {
  const router = useRouter();
  const pieces = useVisiblePieces();
  const firings = useVisibleFirings();
  const level = useProfileLevel();
  const badges = useBadgeStates();

  const [activeTab, setActiveTab] = useState<JourneyTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const ctx = useBadgeContext();
  const timeline = useMemo(() => buildJourneyMilestones(pieces, firings), [pieces, firings]);
  const recentTimeline = useMemo(() => timeline.slice(0, TIMELINE_PREVIEW), [timeline]);
  const tenure = useMemo(() => getStudioTenure(pieces), [pieces]);
  const tagline = useMemo(
    () => getJourneyTagline(ctx, level.earnedCount, level.title),
    [ctx, level.earnedCount, level.title],
  );

  const earnedCount = badges.filter((b) => b.unlocked).length;

  const stats = useMemo(
    () => [
      { key: 'pieces', label: 'Pieces', value: `${ctx.totalPieces}`, sub: 'in your studio', tone: 'clay' as const, icon: Layers },
      { key: 'finished', label: 'Finished', value: `${ctx.finishedPieces}`, sub: 'complete works', tone: 'finish' as const, icon: Star },
      { key: 'firings', label: 'Firings', value: `${ctx.totalFirings}`, sub: `${ctx.bisqueFirings} bisque · ${ctx.glazeFirings} glaze`, tone: 'kiln' as const, icon: Flame },
      { key: 'atlas', label: 'Atlas', value: `${ctx.atlasRecipeFamilies}`, sub: 'glaze families', tone: 'atlas' as const, icon: BookOpen },
    ],
    [ctx],
  );

  const subtitle =
    activeTab === 'achievements'
      ? `${earnedCount} of ${badges.length} achievements earned`
      : `${level.title} · studio stats and milestones`;

  return (
    <DetailScreenShell
      title="Your journey"
      subtitle={subtitle}
      onBack={() => router.back()}
    >
      <JourneyTabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === 'achievements' ? (
        <AchievementsPanel />
      ) : ctx.totalPieces === 0 ? (
        <View className="pb-8">
          <JourneyEmptyChronicle />
        </View>
      ) : (
        <View className="pb-8">
          <JourneyChronicleHero
            title={level.title}
            nextTitle={level.nextTitle}
            badgesUntilNext={level.badgesUntilNext}
            earnedCount={level.earnedCount}
            totalBadges={level.totalBadges}
            tenureLabel={tenure?.label ?? null}
            tagline={tagline}
            onOpenAchievements={() => setActiveTab('achievements')}
          />

          <ChronicleSectionLabel title="Studio pulse" subtitle="Numbers from your practice" />
          <JourneyPathStats stats={stats} />

          {recentTimeline.length > 0 ? (
            <>
              <ChronicleSectionLabel
                title="Milestones"
                subtitle={
                  timeline.length > TIMELINE_PREVIEW
                    ? `Latest ${TIMELINE_PREVIEW} moments`
                    : 'Key moments from your practice'
                }
              />
              <JourneyChronicleTimeline
                milestones={recentTimeline}
                hint={
                  timeline.length > TIMELINE_PREVIEW
                    ? `${timeline.length - TIMELINE_PREVIEW} earlier milestones not shown`
                    : undefined
                }
              />
            </>
          ) : null}
        </View>
      )}
    </DetailScreenShell>
  );
}
