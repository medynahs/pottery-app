import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { ANALYTICS_THEME } from '../../analyticsTheme';

export type DonutSegment = {
  value: number;
  color: string;
  label: string;
};

const SIZE = 196;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;

function polarToCartesian(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(rad),
    y: CENTER + RADIUS * Math.sin(rad),
  };
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(endAngle);
  const end = polarToCartesian(startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  layout = 'stacked',
}: {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string;
  layout?: 'stacked' | 'side';
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const activeSegments = segments.filter((s) => s.value > 0);

  let cursor = 0;
  const arcs = activeSegments.map((segment) => {
    const sweep = total > 0 ? (segment.value / total) * 360 : 0;
    const start = cursor;
    const end = cursor + sweep;
    cursor = end;
    return { ...segment, start, end, sweep };
  });

  const chart = (
    <View style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke="hsl(35 42% 88%)"
          strokeWidth={STROKE}
          fill="none"
        />
        <G rotation={0} origin={`${CENTER}, ${CENTER}`}>
          {arcs.map((arc) =>
            arc.sweep > 0 ? (
              <Path
                key={arc.label}
                d={describeArc(arc.start + 1.5, arc.end - 1.5)}
                stroke={arc.color}
                strokeWidth={STROKE}
                fill="none"
                strokeLinecap="round"
              />
            ) : null,
          )}
        </G>
      </Svg>
      <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
        <Text className="text-[10px] uppercase tracking-wider" style={{ color: ANALYTICS_THEME.inkMuted }}>
          {centerLabel}
        </Text>
        <Text className="text-[22px] font-serif font-bold mt-0.5" style={{ color: ANALYTICS_THEME.ink }}>
          {centerValue}
        </Text>
      </View>
    </View>
  );

  const legend = (
    <View className={`${layout === 'side' ? 'flex-1 justify-center' : 'w-full mt-4'} gap-2.5`}>
      {activeSegments.map((segment) => {
        const pct = total > 0 ? Math.round((segment.value / total) * 100) : 0;
        return (
          <View
            key={segment.label}
            className="flex-row items-center justify-between rounded-xl px-3 py-2.5"
            style={{ backgroundColor: `${segment.color}18`, borderWidth: 1, borderColor: `${segment.color}33` }}
          >
            <View className="flex-row items-center gap-2 flex-1 pr-3">
              <View className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <Text className="text-xs font-medium flex-1" style={{ color: ANALYTICS_THEME.ink }} numberOfLines={1}>
                {segment.label}
              </Text>
            </View>
            <Text className="text-xs font-bold" style={{ color: ANALYTICS_THEME.inkSoft }}>
              {pct}%
            </Text>
          </View>
        );
      })}
    </View>
  );

  if (layout === 'side') {
    return (
      <View className="flex-row items-center gap-3">
        {chart}
        {legend}
      </View>
    );
  }

  return (
    <View className="items-center">
      {chart}
      {legend}
    </View>
  );
}
