import { Text } from '@/src/components/ui/text';
import type { CycleInsight } from '@/src/utils/computeStudioStats';
import { AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { ANALYTICS_THEME, CHART_COLORS } from '../../analyticsTheme';

type BottleneckCalloutProps = {
  cycle: CycleInsight;
  stageLabels: Record<string, string>;
};

export function BottleneckCallout({ cycle, stageLabels }: BottleneckCalloutProps) {
  if (cycle.medianDays == null && !cycle.bottleneck) return null;

  const bottleneckLabel = cycle.bottleneck
    ? `${stageLabels[cycle.bottleneck.from] ?? cycle.bottleneck.from} → ${stageLabels[cycle.bottleneck.to] ?? cycle.bottleneck.to}`
    : null;

  return (
    <View className="gap-3">
      {cycle.medianDays != null ? (
        <View
          className="rounded-2xl px-4 py-3 border flex-row items-center justify-between"
          style={{ backgroundColor: 'hsl(38 55% 94%)', borderColor: 'hsl(34 34% 84%)' }}
        >
          <View>
            <Text className="text-[10px] uppercase tracking-wider font-bold" style={{ color: ANALYTICS_THEME.inkMuted }}>
              Full cycle time
            </Text>
            <Text className="font-serif text-2xl font-bold mt-0.5" style={{ color: ANALYTICS_THEME.ink }}>
              {cycle.medianDays < 1 ? '<1 day' : `${cycle.medianDays.toFixed(0)} days`}
            </Text>
            <Text className="text-[10px] mt-0.5" style={{ color: ANALYTICS_THEME.inkMuted }}>
              Median idea/forming → finished · {cycle.sample} piece{cycle.sample !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={{ fontSize: 28 }}>⏳</Text>
        </View>
      ) : null}

      {cycle.bottleneck && bottleneckLabel ? (
        <View
          className="rounded-2xl px-4 py-3 border flex-row items-start gap-3"
          style={{ backgroundColor: 'hsl(44 70% 92%)', borderColor: 'hsl(40 50% 78%)' }}
        >
          <View
            className="w-9 h-9 rounded-xl items-center justify-center mt-0.5"
            style={{ backgroundColor: 'hsl(44 70% 82%)' }}
          >
            <AlertTriangle size={16} color="hsl(35 65% 32%)" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'hsl(35 65% 32%)' }}>
              Slowest transition
            </Text>
            <Text className="text-sm font-semibold mt-0.5" style={{ color: ANALYTICS_THEME.ink }}>
              {bottleneckLabel}
            </Text>
            <Text className="text-xs mt-1 leading-5" style={{ color: ANALYTICS_THEME.inkSoft }}>
              Median {cycle.bottleneck.medianDays < 1 ? '<1 day' : `${cycle.bottleneck.medianDays.toFixed(1)} days`} here
              {cycle.bottleneck.sample > 0 ? ` · ${cycle.bottleneck.sample} samples` : ''}. This is where work tends to stall.
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function InventorySummary({
  wipTotal,
  finishedUnsoldCount,
  finishedUnsoldValue,
  potentialMargin,
  money,
}: {
  wipTotal: number;
  finishedUnsoldCount: number;
  finishedUnsoldValue: number;
  potentialMargin: number | null;
  money: (v: number | null | undefined, opts?: { dash?: boolean }) => string;
}) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-3">
      <InventoryChip emoji="🔄" label="In progress" value={String(wipTotal)} sub="not finished yet" />
      <InventoryChip emoji="🏺" label="On the shelf" value={String(finishedUnsoldCount)} sub="finished, unsold" />
      <InventoryChip emoji="💰" label="Shelf value" value={money(finishedUnsoldValue, { dash: true })} sub="at list prices" />
      <InventoryChip
        emoji="📈"
        label="Potential margin"
        value={potentialMargin != null ? money(potentialMargin) : '-'}
        sub="if all sold at list"
        accent={potentialMargin != null && potentialMargin >= 0 ? CHART_COLORS.success : CHART_COLORS.firing}
      />
    </View>
  );
}

function InventoryChip({
  emoji,
  label,
  value,
  sub,
  accent,
}: {
  emoji: string;
  label: string;
  value: string;
  sub: string;
  accent?: string;
}) {
  return (
    <View
      className="rounded-[18px] border p-3.5"
      style={{
        width: '48%',
        backgroundColor: ANALYTICS_THEME.cardBg,
        borderColor: accent ? `${accent}44` : ANALYTICS_THEME.cardBorder,
      }}
    >
      <View className="flex-row items-center gap-1.5 mb-1">
        <Text style={{ fontSize: 13 }}>{emoji}</Text>
        <Text className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: ANALYTICS_THEME.inkMuted }}>
          {label}
        </Text>
      </View>
      <Text className="font-serif text-xl font-bold" style={{ color: accent ?? ANALYTICS_THEME.ink }}>
        {value}
      </Text>
      <Text className="text-[10px] mt-0.5 leading-4" style={{ color: ANALYTICS_THEME.inkMuted }}>
        {sub}
      </Text>
    </View>
  );
}
