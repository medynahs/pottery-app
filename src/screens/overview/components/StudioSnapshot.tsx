import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import React, { useMemo } from 'react';
import { View } from 'react-native';

const IN_PROGRESS_STAGES = new Set(['idea', 'forming', 'leather-hard', 'trimming']);
const DRYING_STAGES = new Set(['drying', 'bone-dry']);
const GLAZE_STAGES = new Set(['glazing', 'glaze-fired']);
const READY_FOR_KILN_STAGES = new Set(['bone-dry', 'glaze-fired']);

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetweenCalendar(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / (1000 * 60 * 60 * 24));
}

function getKilnReadyLabel(
  pieces: ReturnType<typeof useAppStore.getState>['pieces'],
  firings: ReturnType<typeof useAppStore.getState>['firings']
) {
  const now = new Date();

  const readyPiecesCount = pieces.filter((piece) => READY_FOR_KILN_STAGES.has(normalize(piece.stage))).length;
  const nearReadyFiring = firings.some((firing) => {
    const state = normalize(firing.state);
    return state === 'cooling' || state === 'unloading';
  });

  if (readyPiecesCount > 0 || nearReadyFiring) {
    return 'Today';
  }

  const nextScheduled = firings
    .filter((firing) => normalize(firing.state) === 'scheduled' && firing.scheduledDate)
    .map((firing) => new Date(firing.scheduledDate as string))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (!nextScheduled) {
    return 'Quiet';
  }

  const dayDiff = daysBetweenCalendar(now, nextScheduled);

  if (dayDiff <= 0) {
    return 'Today';
  }

  if (dayDiff === 1) {
    return 'Tomorrow';
  }

  if (dayDiff <= 6) {
    return new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(nextScheduled);
  }

  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(nextScheduled);
}

export function StudioSnapshot() {
  const pieces = useAppStore((state) => state.pieces);
  const firings = useAppStore((state) => state.firings);

  const snapshot = useMemo(() => {
    const inProgress = pieces.filter((piece) => IN_PROGRESS_STAGES.has(normalize(piece.stage))).length;
    const drying = pieces.filter((piece) => DRYING_STAGES.has(normalize(piece.stage))).length;
    const glazed = pieces.filter((piece) => GLAZE_STAGES.has(normalize(piece.stage))).length;
    const kilnReady = getKilnReadyLabel(pieces, firings);

    return {
      inProgress,
      drying,
      glazed,
      kilnReady,
    };
  }, [firings, pieces]);

  return (
    <View className="gap-3">
      <Text className="text-lg font-serif font-bold text-foreground">Studio Snapshot</Text>

      <View className="flex-row flex-wrap gap-3">
        <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
          <Text className="text-xs text-muted-foreground">Pieces in Progress</Text>
          <Text className="text-2xl font-serif font-bold text-foreground mt-1">{snapshot.inProgress}</Text>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
          <Text className="text-xs text-muted-foreground">Drying</Text>
          <Text className="text-2xl font-serif font-bold text-foreground mt-1">{snapshot.drying}</Text>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
          <Text className="text-xs text-muted-foreground">Glazed</Text>
          <Text className="text-2xl font-serif font-bold text-foreground mt-1">{snapshot.glazed}</Text>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 flex-1 min-w-[45%]">
          <Text className="text-xs text-muted-foreground">Kiln Ready</Text>
          <Text className="text-base font-medium text-foreground mt-1">{snapshot.kilnReady}</Text>
        </Card>
      </View>
    </View>
  );
}
