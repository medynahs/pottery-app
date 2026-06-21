import { EmptyState } from '@/src/components/EmptyState';
import { Text } from '@/src/components/ui/text';
import { useVisiblePieces, useAppStore } from '@/src/store/appStore';
import { Box, Flame, Layers } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { buildBadgeContext } from '../constants/badgeRegistry';
import { useBadgeStates } from '../hooks/useBadgeStates';
import { useProfileLevel } from '../hooks/useProfileLevel';
import { buildJourneyMilestones } from '../utils/buildJourneyMilestones';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { ViewAllBadgesCard } from '../components/ViewAllBadgesCard';

const TIMELINE_PREVIEW = 5;

function CompactStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Layers;
}) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-card px-3.5 py-3">
      <View className="flex-row items-center gap-1.5 mb-1">
        <Icon size={13} color="hsl(39 57% 51%)" />
        <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </Text>
      </View>
      <Text className="font-serif text-2xl leading-7 text-foreground">{value}</Text>
      <Text className="text-[10px] mt-0.5 text-muted-foreground">{sub}</Text>
    </View>
  );
}

export function JourneyTab() {
  const router = useRouter();
  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);
  const glazes = useAppStore((s) => s.glazes);
  const level = useProfileLevel();
  const badges = useBadgeStates();

  const ctx = useMemo(() => buildBadgeContext(pieces, firings, glazes), [pieces, firings, glazes]);
  const timeline = useMemo(() => buildJourneyMilestones(pieces, firings), [pieces, firings]);
  const recentTimeline = useMemo(() => timeline.slice(0, TIMELINE_PREVIEW), [timeline]);

  if (ctx.totalPieces === 0) {
    return (
      <View className="pb-6 px-6">
        <EmptyState
          icon={Box}
          title="Your journey starts here"
          description="Add pieces and log firings to unlock badges and timeline milestones."
        />
        <ViewAllBadgesCard
          badges={badges}
          onPress={() => router.push('/profile/badges' as never)}
        />
      </View>
    );
  }

  return (
    <View className="pb-6 px-6">
      <View className="mb-4 rounded-2xl border border-border bg-card px-4 py-3.5">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Potter rank
        </Text>
        <Text className="font-serif text-xl leading-7 mt-0.5 text-foreground">{level.title}</Text>
        <Text className="text-[11px] mt-1 text-muted-foreground">
          {level.earnedCount} of {level.totalBadges} badges earned
          {level.nextTitle ? ` · ${level.badgesUntilNext} until ${level.nextTitle}` : ''}
        </Text>
      </View>

      <View className="flex-row gap-2.5 mb-4">
        <CompactStat
          label="Pieces"
          value={`${ctx.totalPieces}`}
          sub={`${ctx.finishedPieces} finished`}
          icon={Layers}
        />
        <CompactStat
          label="Firings"
          value={`${ctx.totalFirings}`}
          sub={`${ctx.bisqueFirings} bisque · ${ctx.glazeFirings} glaze`}
          icon={Flame}
        />
      </View>

      <ViewAllBadgesCard
        badges={badges}
        onPress={() => router.push('/profile/badges' as never)}
      />

      {recentTimeline.length > 0 ? (
        <JourneyTimeline
          milestones={recentTimeline}
          hint={
            timeline.length > TIMELINE_PREVIEW
              ? `Latest ${TIMELINE_PREVIEW} milestones · open trophy shelf for the full story`
              : undefined
          }
        />
      ) : null}
    </View>
  );
}
