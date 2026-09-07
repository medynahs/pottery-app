import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { ANALYTICS_THEME, CHART_COLORS } from '../../analyticsTheme';
import { ChartLegend } from '../AnalyticsCards';

export type TrendPoint = {
  label: string;
  productionCost: number;
  firingCost: number;
  piecesFired: number;
};

const CHART_HEIGHT = 210;
const CHART_WIDTH = 320;
const PAD = { top: 24, right: 12, bottom: 34, left: 36 };
const INNER_W = CHART_WIDTH - PAD.left - PAD.right;
const INNER_H = CHART_HEIGHT - PAD.top - PAD.bottom;

function buildPoints(values: number[], max: number) {
  return values.map((value, i) => {
    const x = PAD.left + (i / Math.max(values.length - 1, 1)) * INNER_W;
    const y = PAD.top + INNER_H - (value / max) * INNER_H;
    return { x, y, value };
  });
}

function buildAreaPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  const baseline = PAD.top + INNER_H;
  let d = `M ${points[0].x} ${baseline} L ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  d += ` L ${points[points.length - 1].x} ${baseline} Z`;
  return d;
}

function buildLinePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

export function MonthlyTrendChart({
  data,
  metric,
  money,
}: {
  data: TrendPoint[];
  metric: 'cost' | 'fired';
  money: (v: number | null | undefined) => string;
}) {
  const values = data.map((d) =>
    metric === 'cost' ? d.productionCost + d.firingCost : d.piecesFired,
  );
  const max = Math.max(1, ...values);
  const points = buildPoints(values, max);
  const areaPath = buildAreaPath(points);
  const linePath = buildLinePath(points);
  const lineColor = metric === 'cost' ? CHART_COLORS.production : CHART_COLORS.pieces;
  const fillId = metric === 'cost' ? 'costArea' : 'firedArea';

  return (
    <View>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <Defs>
          <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={lineColor} stopOpacity={0.03} />
          </LinearGradient>
        </Defs>

        {[0, 0.5, 1].map((pct) => {
          const y = PAD.top + INNER_H * (1 - pct);
          const tickValue = Math.round(max * pct);
          return (
            <React.Fragment key={pct}>
              <Line
                x1={PAD.left}
                y1={y}
                x2={CHART_WIDTH - PAD.right}
                y2={y}
                stroke={CHART_COLORS.grid}
                strokeWidth={1}
                strokeDasharray={pct === 0 ? undefined : '4 5'}
              />
              <SvgText
                x={PAD.left - 6}
                y={y + 3}
                fontSize={8}
                fill={ANALYTICS_THEME.inkMuted}
                textAnchor="end"
              >
                {metric === 'cost' ? money(tickValue) : String(tickValue)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {metric === 'cost'
          ? data.map((d, i) => {
              const total = values[i];
              if (total <= 0) return null;
              const x = points[i].x;
              const prodH = (d.productionCost / total) * 28;
              const fireH = (d.firingCost / total) * 28;
              const baseY = PAD.top + INNER_H + 2;
              return (
                <React.Fragment key={`stack-${d.label}`}>
                  <Path
                    d={`M ${x - 8} ${baseY} L ${x - 8} ${baseY - prodH} L ${x + 8} ${baseY - prodH} L ${x + 8} ${baseY} Z`}
                    fill={CHART_COLORS.production}
                    opacity={0.85}
                  />
                  <Path
                    d={`M ${x - 8} ${baseY - prodH} L ${x - 8} ${baseY - prodH - fireH} L ${x + 8} ${baseY - prodH - fireH} L ${x + 8} ${baseY - prodH} Z`}
                    fill={CHART_COLORS.firing}
                    opacity={0.85}
                  />
                </React.Fragment>
              );
            })
          : null}

        <Path d={areaPath} fill={`url(#${fillId})`} />
        <Path d={linePath} stroke={lineColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <React.Fragment key={data[i].label}>
            <Circle cx={p.x} cy={p.y} r={5} fill={ANALYTICS_THEME.cardBg} stroke={lineColor} strokeWidth={2.5} />
            <SvgText
              x={p.x}
              y={CHART_HEIGHT - 10}
              fontSize={9}
              fontWeight="600"
              fill={ANALYTICS_THEME.inkSoft}
              textAnchor="middle"
            >
              {data[i].label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>

      {metric === 'cost' ? (
        <ChartLegend
          items={[
            { color: CHART_COLORS.production, label: 'Production trend' },
            { color: CHART_COLORS.firing, label: 'Monthly split (bars)' },
          ]}
        />
      ) : (
        <ChartLegend items={[{ color: CHART_COLORS.pieces, label: 'Pieces fired per month' }]} />
      )}
    </View>
  );
}
