import { Text } from '@/src/components/ui/text';
import type { StudioStats } from '@/src/utils/computeStudioStats';
import {
  Coins,
  FlameKindling,
  Layers,
  Receipt,
  TrendingUp,
  Workflow,
} from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { ANALYTICS_THEME, CHART_COLORS } from '../analyticsTheme';
import {
  AnalyticsSectionCard,
  MetricGrid,
  MetricTile,
} from './AnalyticsCards';
import { AnalyticsTabBar, type AnalyticsTab } from './AnalyticsTabBar';
import { AnalyticsHeroBanner, type DashboardStat } from './AnalyticsDashboardShell';
import { DonutChart } from './charts/DonutChart';
import { FiringSplitChart } from './charts/FiringSplitChart';
import { HorizontalBarChart } from './charts/HorizontalBarChart';
import { BottleneckCallout, InventorySummary } from './charts/InsightCards';
import { MonthlyTrendChart } from './charts/MonthlyTrendChart';
import { PipelineChart } from './charts/PipelineChart';

const PREVIEW_TABS: AnalyticsTab[] = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'costs', label: 'Costs', icon: Coins },
  { id: 'firings', label: 'Firings', icon: FlameKindling },
  { id: 'pieces', label: 'Pieces', icon: Receipt },
  { id: 'materials', label: 'Materials', icon: Layers },
];

const STAGE_LABELS: Record<string, string> = {
  idea: 'Idea',
  forming: 'Forming',
  'leather-hard': 'Leather Hard',
  trimming: 'Trimming',
  drying: 'Drying',
  'bone-dry': 'Bone Dry',
  bisque: 'Bisque',
  glazing: 'Glazing',
  'glaze-fired': 'Glaze Fired',
  finished: 'Finished',
  cemetery: 'Cemetery',
};

type MoneyFormatter = (v: number | null | undefined, opts?: { dash?: boolean }) => string;

type DonutSegment = { label: string; color: string; value: number };

type AnalyticsLockedPreviewContentProps = {
  periodLabel: string;
  headline: string;
  headlineSub: string;
  ringValue: number | null;
  ringLabel: string;
  ringSub?: string;
  stats: DashboardStat[];
  studioStats: StudioStats;
  money: MoneyFormatter;
  costDonutSegments: DonutSegment[];
  showCostDonut: boolean;
  showRevenueTiles: boolean;
  revenueLabel: string;
};

export function AnalyticsLockedPreviewContent({
  periodLabel,
  headline,
  headlineSub,
  ringValue,
  ringLabel,
  ringSub,
  stats,
  studioStats,
  money,
  costDonutSegments,
  showCostDonut,
  showRevenueTiles,
  revenueLabel,
}: AnalyticsLockedPreviewContentProps) {
  const hasGlazes = studioStats.materials.glazes.length > 0;
  const hasFirings = studioStats.firings.count > 0;
  const hasCycleInsight =
    studioStats.cycle.medianDays != null || studioStats.cycle.bottleneck != null;

  return (
    <View>
      <AnalyticsHeroBanner
        periodLabel={periodLabel}
        headline={headline}
        headlineSub={headlineSub}
        ringValue={ringValue}
        ringLabel={ringLabel}
        ringSub={ringSub}
        stats={stats}
      />

      <AnalyticsTabBar tabs={PREVIEW_TABS} activeTab="overview" onChange={() => {}} />

      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <AnalyticsSectionCard
          title="Studio pipeline"
          hint="Where your active work sits right now"
          accent="overview"
          icon={<Workflow size={18} color={CHART_COLORS.production} />}
        >
          <PipelineChart stages={studioStats.pipeline} />
        </AnalyticsSectionCard>

        <AnalyticsSectionCard
          title="Shelf & flow"
          hint="Work in progress and finished inventory on hand"
          accent="pieces"
          icon={<Receipt size={18} color={CHART_COLORS.success} />}
        >
          <InventorySummary
            wipTotal={studioStats.inventory.wipTotal}
            finishedUnsoldCount={studioStats.inventory.finishedUnsoldCount}
            finishedUnsoldValue={studioStats.inventory.finishedUnsoldValue}
            potentialMargin={studioStats.inventory.potentialMargin}
            money={money}
          />
        </AnalyticsSectionCard>

        {hasCycleInsight ? (
          <AnalyticsSectionCard
            title="Cycle & bottlenecks"
            hint="How long pieces take and where they stall"
            accent="overview"
            icon={<TrendingUp size={18} color={CHART_COLORS.pieces} />}
          >
            <BottleneckCallout cycle={studioStats.cycle} stageLabels={STAGE_LABELS} />
          </AnalyticsSectionCard>
        ) : null}

        <AnalyticsSectionCard
          title="Monthly trend"
          hint="6-month rolling view with area chart"
          accent="overview"
          icon={<TrendingUp size={18} color={CHART_COLORS.production} />}
        >
          <View className="mt-1 -mx-1">
            <MonthlyTrendChart data={studioStats.monthlyTrend} metric="cost" money={money} />
          </View>
        </AnalyticsSectionCard>

        {showCostDonut ? (
          <AnalyticsSectionCard
            title="Where costs go"
            hint="Production spend by category"
            accent="costs"
            icon={<Coins size={18} color={CHART_COLORS.production} />}
          >
            <DonutChart
              segments={costDonutSegments}
              centerLabel="Total"
              centerValue={money(studioStats.costs.productionTotal)}
              layout="side"
            />
          </AnalyticsSectionCard>
        ) : null}

        {hasGlazes ? (
          <AnalyticsSectionCard
            title="Top glazes"
            hint="Most-used glaze families"
            accent="materials"
            icon={<Layers size={18} color={CHART_COLORS.glazeMaterial} />}
          >
            <HorizontalBarChart
              rows={studioStats.materials.glazes.map((row) => ({
                label: row.label,
                value: row.count,
                pct: row.pct,
                color: CHART_COLORS.glazeMaterial,
                detail: `${row.count} · ${Math.round(row.pct)}%`,
              }))}
              maxRows={5}
            />
          </AnalyticsSectionCard>
        ) : null}

        <AnalyticsSectionCard
          title="Cost snapshot"
          hint="Production, firing fees, and per-piece averages"
          accent="costs"
          icon={<Coins size={18} color={CHART_COLORS.production} />}
        >
          <MetricGrid>
            <MetricTile
              tone="production"
              emoji="🧱"
              label="Production cost"
              value={money(studioStats.costs.productionTotal, { dash: true })}
              sub="materials + labor"
            />
            <MetricTile
              tone="firing"
              emoji="🔥"
              label="Firing fees"
              value={money(studioStats.costs.firingTotal, { dash: true })}
              sub="paid to kiln"
            />
            <MetricTile
              tone="neutral"
              emoji="🏺"
              label="Avg / piece"
              value={money(studioStats.costs.avgPerPiece, { dash: true })}
            />
            <MetricTile
              tone="neutral"
              emoji="⏱️"
              label="Cost / work hr"
              value={money(studioStats.costs.costPerWorkHour, { dash: true })}
            />
          </MetricGrid>
        </AnalyticsSectionCard>

        {showRevenueTiles ? (
          <AnalyticsSectionCard
            title="Revenue & margin"
            hint="Sold work and shelf potential"
            accent="pieces"
            icon={<Receipt size={18} color={CHART_COLORS.success} />}
          >
            <MetricGrid>
              <MetricTile
                tone="revenue"
                emoji="💵"
                label={revenueLabel}
                value={money(studioStats.revenue.soldRevenue, { dash: true })}
                sub={`${studioStats.summary.soldCount} sold`}
              />
              <MetricTile
                tone="revenue"
                emoji="📈"
                label="Realized margin"
                value={money(studioStats.revenue.realizedMargin, { dash: true })}
              />
              <MetricTile
                tone="revenue"
                emoji="⏱️"
                label="Effective $/hr"
                value={
                  studioStats.margins.effectiveHourlyRate != null
                    ? money(studioStats.margins.effectiveHourlyRate)
                    : '-'
                }
                sub="sold margin ÷ hours"
              />
              <MetricTile
                tone="neutral"
                emoji="✨"
                label="Shelf potential"
                value={money(studioStats.revenue.potentialRevenue, { dash: true })}
                sub="finished, unsold"
              />
            </MetricGrid>
          </AnalyticsSectionCard>
        ) : null}

        {hasFirings ? (
          <AnalyticsSectionCard
            title="Firing mix"
            hint="Bisque vs glaze firings this period"
            accent="firings"
            icon={<FlameKindling size={18} color={CHART_COLORS.firing} />}
          >
            <FiringSplitChart
              bisqueCount={studioStats.firings.bisqueCount}
              glazeCount={studioStats.firings.glazeCount}
              successRate={studioStats.firings.successRate}
            />
            <View className="mt-4">
              <MetricGrid>
                <MetricTile
                  tone="firing"
                  emoji="🔥"
                  label="Avg / firing"
                  value={money(studioStats.firings.avgCostPerFiring, { dash: true })}
                />
                <MetricTile
                  tone="firing"
                  emoji="🏺"
                  label="Cost / piece"
                  value={money(studioStats.firings.avgCostPerPiece, { dash: true })}
                />
                <MetricTile
                  tone="neutral"
                  emoji="📦"
                  label="Avg load"
                  value={
                    studioStats.firings.avgPiecesPerFiring != null
                      ? studioStats.firings.avgPiecesPerFiring.toFixed(1)
                      : '-'
                  }
                  sub="pieces / firing"
                />
                <MetricTile
                  tone="neutral"
                  emoji="✅"
                  label="Pieces fired"
                  value={String(studioStats.firings.piecesFired)}
                  sub={`${studioStats.firings.uniquePiecesFired} unique`}
                />
              </MetricGrid>
            </View>
          </AnalyticsSectionCard>
        ) : null}

        <View className="items-center py-6">
          <Text className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: ANALYTICS_THEME.inkMuted }}>
            + more tabs & exports with Premium
          </Text>
        </View>
      </View>
    </View>
  );
}
