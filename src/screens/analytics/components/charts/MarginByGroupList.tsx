import { Text } from '@/src/components/ui/text';
import type { MarginGroupRow } from '@/src/utils/computeStudioStats';
import React from 'react';
import { View } from 'react-native';
import { ANALYTICS_THEME, CHART_COLORS } from '../../analyticsTheme';

type MarginByGroupListProps = {
  rows: MarginGroupRow[];
  money: (v: number | null | undefined) => string;
  maxRows?: number;
};

export function MarginByGroupList({ rows, money, maxRows = 6 }: MarginByGroupListProps) {
  const visible = rows.filter((r) => r.count > 0).slice(0, maxRows);
  if (visible.length === 0) {
    return (
      <Text className="text-xs text-center py-4 leading-5" style={{ color: ANALYTICS_THEME.inkMuted }}>
        Add costs and list prices to finished pieces to see margin by group.
      </Text>
    );
  }

  const maxPct = Math.max(1, ...visible.map((r) => Math.abs(r.marginPct ?? 0)));

  return (
    <View className="gap-3.5">
      {visible.map((row, index) => {
        const positive = row.marginPct != null && row.marginPct >= 0;
        const barColor = positive ? CHART_COLORS.success : CHART_COLORS.firing;
        const barWidth = row.marginPct != null ? (Math.abs(row.marginPct) / maxPct) * 100 : 0;

        return (
          <View key={row.label}>
            <View className="flex-row items-start gap-3 mb-2">
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: `${barColor}18`, borderWidth: 1, borderColor: `${barColor}33` }}
              >
                <Text className="text-[11px] font-bold" style={{ color: barColor }}>
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="text-sm font-semibold flex-1" style={{ color: ANALYTICS_THEME.ink }} numberOfLines={1}>
                    {row.label}
                  </Text>
                  <Text className="text-[11px] font-bold" style={{ color: barColor }}>
                    {row.marginPct != null ? `${Math.round(row.marginPct)}% margin` : '-'}
                  </Text>
                </View>
                <Text className="text-[10px] mt-0.5" style={{ color: ANALYTICS_THEME.inkMuted }}>
                  {row.count} piece{row.count !== 1 ? 's' : ''} · avg cost {money(row.avgCost)}
                  {row.avgPrice != null ? ` · list ${money(row.avgPrice)}` : ''}
                </Text>
              </View>
            </View>
            <View className="h-2.5 rounded-full overflow-hidden ml-10" style={{ backgroundColor: CHART_COLORS.track }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${Math.max(6, barWidth)}%`, backgroundColor: barColor }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
