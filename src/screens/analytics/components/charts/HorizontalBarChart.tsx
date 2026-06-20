import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ANALYTICS_THEME } from '../../analyticsTheme';

export type BarRow = {
  label: string;
  value: number;
  pct: number;
  color?: string;
  detail?: string;
};

export function HorizontalBarChart({
  rows,
  maxRows = 6,
  barColor = '#B86A3C',
  onRowPress,
}: {
  rows: BarRow[];
  maxRows?: number;
  barColor?: string;
  onRowPress?: (row: BarRow, index: number) => void;
}) {
  const visible = rows.slice(0, maxRows);
  if (visible.length === 0) return null;

  return (
    <View className="gap-4">
      {visible.map((row, index) => {
        const color = row.color ?? barColor;
        const body = (
          <>
            <View className="flex-row items-center gap-3 mb-2">
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: `${color}22`, borderWidth: 1, borderColor: `${color}44` }}
              >
                <Text className="text-[11px] font-bold" style={{ color }}>
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold flex-1 pr-3" style={{ color: ANALYTICS_THEME.ink }} numberOfLines={1}>
                    {row.label}
                  </Text>
                  <Text className="text-[11px] font-bold" style={{ color: ANALYTICS_THEME.inkSoft }}>
                    {row.detail ?? `${row.value} · ${Math.round(row.pct)}%`}
                  </Text>
                </View>
              </View>
            </View>
            <View className="h-3 rounded-full overflow-hidden ml-10" style={{ backgroundColor: 'hsl(35 42% 88%)' }}>
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(6, row.pct)}%`,
                  backgroundColor: color,
                }}
              />
            </View>
          </>
        );

        if (onRowPress) {
          return (
            <TouchableOpacity key={row.label} activeOpacity={0.82} onPress={() => onRowPress(row, index)}>
              {body}
            </TouchableOpacity>
          );
        }

        return <View key={row.label}>{body}</View>;
      })}
    </View>
  );
}

export function StageDurationChart({
  rows,
  stageLabels,
}: {
  rows: { from: string; to: string; medianDays: number }[];
  stageLabels: Record<string, string>;
}) {
  const maxDays = Math.max(1, ...rows.map((r) => r.medianDays));

  return (
    <View className="gap-4">
      {rows.map((row, index) => {
        const pct = (row.medianDays / maxDays) * 100;
        const label = `${stageLabels[row.from] ?? row.from} → ${stageLabels[row.to] ?? row.to}`;
        const valueLabel = row.medianDays < 1 ? '<1 day' : `${row.medianDays.toFixed(1)} days`;
        return (
          <View key={`${row.from}-${row.to}`}>
            <View className="flex-row items-center gap-3 mb-2">
              <View
                className="w-8 h-8 rounded-2xl items-center justify-center"
                style={{ backgroundColor: 'hsl(39 57% 90%)' }}
              >
                <Text style={{ fontSize: 14 }}>{['⏳', '🪨', '🔥', '✨'][index % 4]}</Text>
              </View>
              <View className="flex-1 flex-row items-center justify-between">
                <Text className="text-xs font-medium flex-1 pr-3" style={{ color: ANALYTICS_THEME.ink }} numberOfLines={2}>
                  {label}
                </Text>
                <Text className="text-sm font-serif font-bold" style={{ color: ANALYTICS_THEME.inkSoft }}>
                  {valueLabel}
                </Text>
              </View>
            </View>
            <View className="h-2.5 rounded-full overflow-hidden ml-11" style={{ backgroundColor: 'hsl(35 42% 88%)' }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${Math.max(8, pct)}%`, backgroundColor: ANALYTICS_THEME.accent }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
