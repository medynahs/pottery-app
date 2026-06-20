import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { ANALYTICS_THEME, CHART_COLORS } from '../../analyticsTheme';
import { DonutChart } from './DonutChart';
import { ProgressRing } from './ProgressRing';

export function FiringSplitChart({
  bisqueCount,
  glazeCount,
  successRate,
}: {
  bisqueCount: number;
  glazeCount: number;
  successRate: number | null;
}) {
  const total = bisqueCount + glazeCount;

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-around">
        <DonutChart
          segments={[
            { label: 'Bisque', value: bisqueCount, color: CHART_COLORS.bisque },
            { label: 'Glaze', value: glazeCount, color: CHART_COLORS.glaze },
          ]}
          centerLabel="Firings"
          centerValue={String(total)}
          layout="stacked"
        />
        {successRate != null ? (
          <ProgressRing
            value={successRate}
            label="Success"
            sublabel="pieces survived"
            tone="ink"
            size={108}
            stroke={10}
          />
        ) : null}
      </View>
      <View className="flex-row gap-3">
        <View
          className="flex-1 rounded-2xl px-3 py-3 border items-center"
          style={{ backgroundColor: `${CHART_COLORS.bisque}14`, borderColor: `${CHART_COLORS.bisque}33` }}
        >
          <Text className="text-[10px] uppercase tracking-wider" style={{ color: ANALYTICS_THEME.inkMuted }}>
            Bisque
          </Text>
          <Text className="text-xl font-serif font-bold mt-1" style={{ color: ANALYTICS_THEME.ink }}>
            {bisqueCount}
          </Text>
        </View>
        <View
          className="flex-1 rounded-2xl px-3 py-3 border items-center"
          style={{ backgroundColor: `${CHART_COLORS.glaze}14`, borderColor: `${CHART_COLORS.glaze}33` }}
        >
          <Text className="text-[10px] uppercase tracking-wider" style={{ color: ANALYTICS_THEME.inkMuted }}>
            Glaze
          </Text>
          <Text className="text-xl font-serif font-bold mt-1" style={{ color: ANALYTICS_THEME.ink }}>
            {glazeCount}
          </Text>
        </View>
      </View>
    </View>
  );
}
