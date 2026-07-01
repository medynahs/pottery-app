import { SectionLabel } from '@/src/components/SectionLabel';
import { Text } from '@/src/components/ui/text';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { formatGlazeUsageHint } from '@/src/screens/glazes/glazeUsageAnalytics';
import { useVisiblePieces, useAppStore } from '@/src/store';
import {
  computeStudioStats,
  type CostBreakdown,
  type PieceEconomicRow,
  type RankedUsage,
} from '@/src/utils/computeStudioStats';
import { type AnalyticsPeriodId } from '@/src/utils/analyticsPeriods';
import { buildStudioExportPayload, shareStudioExport, summarizeExport } from '@/src/utils/exportStudioData';
import { checkPremium, PremiumFeature } from '@/src/utils/premiumGate';
import { trackAnalyticsOpened, trackExportAttempted } from '@/src/utils/productAnalytics';
import {
  getAnalyticsLens,
  getDefaultAnalyticsTab,
  getPricingCopy,
} from '@/src/utils/roleBasedUx';
import { useRouter } from 'expo-router';
import {
  Coins,
  Download,
  FlameKindling,
  Layers,
  Receipt,
  TrendingUp,
  Workflow,
} from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Firing } from '@/src/types/kiln';
import { FIRING_TYPE_LABELS } from '../kiln/constants';
import { formatReadyDate } from '../kiln/firingEstimations';
import { GlazeUsageDrillDownSheet } from './GlazeUsageDrillDownSheet';
import { ANALYTICS_THEME, CHART_COLORS } from './analyticsTheme';
import {
  AnalyticsSectionCard,
  EmptyHint,
  MetricGrid,
  MetricTile,
} from './components/AnalyticsCards';
import { AnalyticsLockedPreview } from './components/AnalyticsLockedPreview';
import { AnalyticsHeroBanner, AnalyticsStickyChrome, type DashboardStat } from './components/AnalyticsDashboardShell';
import { SegmentedControl } from './components/AnalyticsControls';
import { AnalyticsTabBar, type AnalyticsTab, type AnalyticsTabId } from './components/AnalyticsTabBar';
import { DonutChart } from './components/charts/DonutChart';
import { FiringSplitChart } from './components/charts/FiringSplitChart';
import { HorizontalBarChart, StageDurationChart } from './components/charts/HorizontalBarChart';
import { MonthlyTrendChart } from './components/charts/MonthlyTrendChart';
import { PipelineChart } from './components/charts/PipelineChart';
import { BottleneckCallout, InventorySummary } from './components/charts/InsightCards';
import { MarginByGroupList } from './components/charts/MarginByGroupList';

type EconomicsFilter = 'all' | 'finished' | 'sold' | 'lost';
type MarginGroupView = 'form' | 'clay' | 'method';

const ANALYTICS_TABS: AnalyticsTab[] = [
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

const COST_BREAKDOWN_META: { key: keyof CostBreakdown; label: string; color: string }[] = [
  { key: 'clay', label: 'Clay', color: CHART_COLORS.clay },
  { key: 'glaze', label: 'Glaze', color: CHART_COLORS.glazeMaterial },
  { key: 'energy', label: 'Energy', color: CHART_COLORS.energy },
  { key: 'firing', label: 'Firing fee', color: CHART_COLORS.firing },
  { key: 'labor', label: 'Labor', color: CHART_COLORS.labor },
  { key: 'admin', label: 'Admin', color: CHART_COLORS.admin },
  { key: 'overhead', label: 'Overhead', color: CHART_COLORS.overhead },
  { key: 'other', label: 'Other', color: CHART_COLORS.other },
];

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestAccess, PaywallGate } = usePremiumGate();
  const isPremium = checkPremium(PremiumFeature.Analytics);
  const analyticsHiddenTabs = useAppStore((s) => s.analyticsHiddenTabs);
  const setAnalyticsTabHidden = useAppStore((s) => s.setAnalyticsTabHidden);
  const visibleAnalyticsTabs = React.useMemo(
    () => ANALYTICS_TABS.filter((tab) => !analyticsHiddenTabs.includes(tab.id)),
    [analyticsHiddenTabs],
  );

  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);
  const glazeTests = useAppStore((s) => s.glazeTests);
  const glazes = useAppStore((s) => s.glazes);
  const kilns = useAppStore((s) => s.kilns);
  const glazeCollectionNames = useAppStore((s) => s.glazeCollectionNames);
  const showToast = useAppStore((s) => s.showToast);
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);
  const userType = useAppStore((s) => s.onboardingProfile.userType);
  const analyticsLens = getAnalyticsLens(userType);
  const pricingCopy = getPricingCopy(userType);

  const [periodId, setPeriodId] = React.useState<AnalyticsPeriodId>('this-month');
  const [tab, setTab] = React.useState<AnalyticsTabId>(() => getDefaultAnalyticsTab(userType));

  React.useEffect(() => {
    if (!visibleAnalyticsTabs.some((t) => t.id === tab)) {
      setTab(visibleAnalyticsTabs[0]?.id ?? 'overview');
    }
  }, [visibleAnalyticsTabs, tab]);
  const [trendMetric, setTrendMetric] = React.useState<'cost' | 'fired'>('cost');
  const [economicsFilter, setEconomicsFilter] = React.useState<EconomicsFilter>('all');
  const [marginGroupView, setMarginGroupView] = React.useState<MarginGroupView>('form');
  const [exporting, setExporting] = React.useState(false);
  const [glazeUsageFamilyKey, setGlazeUsageFamilyKey] = React.useState<string | null>(null);

  const handleExport = async () => {
    trackExportAttempted({ source: 'analytics' });
    if (!requestAccess(PremiumFeature.Export)) return;
    setExporting(true);
    try {
      const payload = buildStudioExportPayload({
        pieces,
        firings,
        kilns,
        glazes,
        glazeTests,
        glazeCollectionNames,
      });
      await shareStudioExport(payload);
    } catch {
      showToast('Export failed, try again', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportSummary = React.useMemo(
    () =>
      summarizeExport(
        buildStudioExportPayload({
          pieces,
          firings,
          kilns,
          glazes,
          glazeTests,
          glazeCollectionNames,
        }),
      ),
    [pieces, firings, kilns, glazes, glazeTests, glazeCollectionNames],
  );

  const stats = React.useMemo(
    () => computeStudioStats({ pieces, firings, glazeTests, glazes, periodId }),
    [pieces, firings, glazeTests, glazes, periodId],
  );

  const money = React.useCallback(
    (v: number | null | undefined, opts?: { dash?: boolean }) => {
      if (v == null) return '-';
      if (v === 0 && opts?.dash) return `${currencySymbol}0`;
      return `${currencySymbol}${Math.round(v).toLocaleString()}`;
    },
    [currencySymbol],
  );

  const glazeUsageHint = React.useMemo(
    () => formatGlazeUsageHint(pieces, glazeTests, glazes, periodId),
    [pieces, glazeTests, glazes, periodId],
  );

  const isStudioOwner = analyticsLens === 'studio-ops';
  const isMemberLens = analyticsLens === 'member-fees';
  const isSellerLens = analyticsLens === 'seller';

  const costBreakdownMeta = React.useMemo(
    () =>
      COST_BREAKDOWN_META.map((item) =>
        item.key === 'firing' ? { ...item, label: pricingCopy.firingFeeLabel } : item,
      ),
    [pricingCopy.firingFeeLabel],
  );

  const filteredEconomics = React.useMemo(() => {
    const rows = stats.economics;
    switch (economicsFilter) {
      case 'finished':
        return rows.filter((r) => ['finished', 'glaze-fired'].includes(r.stage.trim().toLowerCase()));
      case 'sold':
        return rows.filter((r) => r.isSold);
      case 'lost':
        return rows.filter((r) => r.isLost);
      default:
        return rows;
    }
  }, [stats.economics, economicsFilter]);

  const dashboard = React.useMemo(() => {
    if (isStudioOwner || isMemberLens) {
      const statsRow: DashboardStat[] = [
        {
          key: 'fees',
          label: isMemberLens ? 'Fees paid' : 'Fees collected',
          value: money(stats.firings.totalCost, { dash: true }),
          sub: isMemberLens ? 'to studio' : 'from members',
          emoji: '🔥',
        },
        { key: 'avg', label: 'Avg / firing', value: money(stats.firings.avgCostPerFiring, { dash: true }), emoji: '💰' },
        { key: 'load', label: 'Avg load', value: stats.firings.avgPiecesPerFiring != null ? stats.firings.avgPiecesPerFiring.toFixed(1) : '-', sub: 'pieces', emoji: '📦' },
        { key: 'unique', label: 'Unique fired', value: String(stats.firings.uniquePiecesFired), emoji: '🏺' },
      ];
      return {
        headline: String(stats.firings.count),
        headlineSub: `${stats.firings.piecesFired} pieces through the kiln · ${stats.firings.bisqueCount} bisque · ${stats.firings.glazeCount} glaze`,
        ringValue: stats.firings.successRate,
        ringLabel: 'Success',
        ringSub: stats.firings.piecesLost > 0 ? `${stats.firings.piecesLost} lost` : undefined,
        stats: statsRow,
      };
    }

    if (isSellerLens) {
      const statsRow: DashboardStat[] = [
        { key: 'rev', label: pricingCopy.revenueLabel, value: money(stats.revenue.soldRevenue, { dash: true }), sub: `${stats.summary.soldCount} sold`, emoji: '💵' },
        { key: 'margin', label: 'Margin', value: money(stats.revenue.realizedMargin, { dash: true }), sub: 'realized', emoji: '📈' },
        { key: 'prod', label: 'In production', value: String(stats.summary.piecesFinished), sub: 'finished', emoji: '🧱' },
        { key: 'hours', label: 'Work hours', value: stats.summary.workHours > 0 ? `${Math.round(stats.summary.workHours)}h` : '-', emoji: '⏱️' },
      ];
      return {
        headline: String(stats.summary.soldCount),
        headlineSub: `${money(stats.revenue.soldRevenue, { dash: true })} revenue · ${stats.summary.piecesCreated} created this period`,
        ringValue: stats.summary.survivalRate,
        ringLabel: 'Survival',
        ringSub: 'finished vs lost',
        stats: statsRow,
      };
    }

    const statsRow: DashboardStat[] = [
      { key: 'cost', label: 'Production', value: money(stats.costs.productionTotal, { dash: true }), sub: 'est. cost', emoji: '🧱' },
      { key: 'rev', label: pricingCopy.revenueLabel, value: money(stats.revenue.soldRevenue, { dash: true }), sub: `${stats.summary.soldCount} pieces`, emoji: '💵' },
      { key: 'avg', label: 'Avg / piece', value: money(stats.costs.avgPerPiece, { dash: true }), emoji: '📊' },
      { key: 'hours', label: 'Work hours', value: stats.summary.workHours > 0 ? `${Math.round(stats.summary.workHours)}h` : '-', emoji: '⏱️' },
    ];

    return {
      headline: String(stats.summary.piecesFinished),
      headlineSub: `${stats.summary.piecesCreated} created this period · ${stats.summary.soldCount} sold · ${stats.summary.piecesInCemetery} lost`,
      ringValue: stats.summary.survivalRate,
      ringLabel: 'Survival',
      ringSub: 'finished vs lost',
      stats: statsRow,
    };
  }, [isMemberLens, isSellerLens, isStudioOwner, money, pricingCopy.revenueLabel, stats]);

  const costDonutSegments = React.useMemo(
    () =>
      costBreakdownMeta.map((m) => ({
        label: m.label,
        color: m.color,
        value: stats.costs.breakdown[m.key],
      })).filter((s) => s.value > 0),
    [costBreakdownMeta, stats.costs.breakdown],
  );

  const marginGroupRows = React.useMemo(() => {
    switch (marginGroupView) {
      case 'clay':
        return stats.margins.byClay;
      case 'method':
        return stats.margins.byFormingMethod;
      default:
        return stats.margins.byForm;
    }
  }, [marginGroupView, stats.margins]);

  const openPiecesStage = React.useCallback(
    (stage: string) => {
      router.push(`/(tabs)/pieces?stage=${stage}` as never);
    },
    [router],
  );

  React.useEffect(() => {
    if (!isPremium) return;
    trackAnalyticsOpened({ user_type: userType, is_premium: true });
  }, [isPremium, userType]);

  if (!isPremium) {
    return (
      <AnalyticsLockedPreview
        paddingTop={insets.top}
        paddingBottom={insets.bottom}
        periodLabel={stats.period.label}
        headline={dashboard.headline}
        headlineSub={dashboard.headlineSub}
        ringValue={dashboard.ringValue}
        ringLabel={dashboard.ringLabel}
        ringSub={dashboard.ringSub}
        stats={dashboard.stats}
        userType={userType}
      />
    );
  }

  return (
    <>
      {PaywallGate}
    <View className="flex-1" style={{ backgroundColor: ANALYTICS_THEME.pageBg }}>
      <AnalyticsStickyChrome
        paddingTop={insets.top}
        periodId={periodId}
        periodLabel={stats.period.label}
        onPeriodChange={setPeriodId}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 32,
        }}
      >
        <AnalyticsHeroBanner
          periodLabel={stats.period.label}
          headline={dashboard.headline}
          headlineSub={dashboard.headlineSub}
          ringValue={dashboard.ringValue}
          ringLabel={dashboard.ringLabel}
          ringSub={dashboard.ringSub}
          stats={dashboard.stats}
        />

        <View className="px-4 pb-2">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Show tabs</Text>
          <View className="flex-row flex-wrap gap-2">
            {ANALYTICS_TABS.map((analyticsTab) => {
              const hidden = analyticsHiddenTabs.includes(analyticsTab.id);
              return (
                <TouchableOpacity
                  key={analyticsTab.id}
                  onPress={() => setAnalyticsTabHidden(analyticsTab.id, !hidden)}
                  className={`rounded-full px-3 py-1.5 border ${hidden ? 'border-border bg-muted/40' : 'border-primary bg-primary/10'}`}
                >
                  <Text className={`text-xs font-medium ${hidden ? 'text-muted-foreground' : 'text-primary'}`}>
                    {analyticsTab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <AnalyticsTabBar tabs={visibleAnalyticsTabs.length > 0 ? visibleAnalyticsTabs : ANALYTICS_TABS} activeTab={tab} onChange={setTab} />

        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {tab === 'overview' ? (
          <>
            <AnalyticsSectionCard
              title="Studio pipeline"
              hint="Where your active work sits right now"
              accent="overview"
              icon={<Workflow size={18} color={CHART_COLORS.production} />}
            >
              <PipelineChart stages={stats.pipeline} onStagePress={openPiecesStage} />
            </AnalyticsSectionCard>

            <AnalyticsSectionCard
              title="Shelf & flow"
              hint="Work in progress and finished inventory on hand"
              accent="pieces"
              icon={<Receipt size={18} color={CHART_COLORS.success} />}
            >
              <InventorySummary
                wipTotal={stats.inventory.wipTotal}
                finishedUnsoldCount={stats.inventory.finishedUnsoldCount}
                finishedUnsoldValue={stats.inventory.finishedUnsoldValue}
                potentialMargin={stats.inventory.potentialMargin}
                money={money}
              />
            </AnalyticsSectionCard>

            {stats.cycle.medianDays != null || stats.cycle.bottleneck ? (
              <AnalyticsSectionCard
                title="Cycle & bottlenecks"
                hint="How long pieces take and where they stall"
                accent="overview"
                icon={<TrendingUp size={18} color={CHART_COLORS.pieces} />}
              >
                <BottleneckCallout cycle={stats.cycle} stageLabels={STAGE_LABELS} />
              </AnalyticsSectionCard>
            ) : null}

            <AnalyticsSectionCard
              title="Monthly trend"
              hint="6-month rolling view with area chart"
              accent="overview"
              icon={<TrendingUp size={18} color={CHART_COLORS.production} />}
            >
              <SegmentedControl
                options={[
                  { value: 'cost', label: 'Costs' },
                  { value: 'fired', label: 'Pieces fired' },
                ]}
                value={trendMetric}
                onChange={setTrendMetric}
              />
              <View className="mt-5 -mx-1">
                <MonthlyTrendChart data={stats.monthlyTrend} metric={trendMetric} money={money} />
              </View>
            </AnalyticsSectionCard>

            {!isStudioOwner && !isMemberLens && stats.costs.productionTotal > 0 ? (
              <AnalyticsSectionCard
                title="Where costs go"
                hint="Production spend by category"
                accent="costs"
                icon={<Coins size={18} color={CHART_COLORS.production} />}
              >
                <DonutChart
                  segments={costDonutSegments}
                  centerLabel="Total"
                  centerValue={money(stats.costs.productionTotal)}
                  layout="side"
                />
              </AnalyticsSectionCard>
            ) : null}

            {stats.materials.glazes.length > 0 ? (
              <AnalyticsSectionCard
                title="Top glazes"
                hint="Most-used glaze families"
                accent="materials"
                icon={<Layers size={18} color={CHART_COLORS.glazeMaterial} />}
              >
                <HorizontalBarChart
                  rows={stats.materials.glazes.map((r) => ({
                    label: r.label,
                    value: r.count,
                    pct: r.pct,
                    color: CHART_COLORS.glazeMaterial,
                    detail: `${r.count} · ${Math.round(r.pct)}%`,
                  }))}
                  maxRows={4}
                />
              </AnalyticsSectionCard>
            ) : null}
          </>
        ) : null}

        {tab === 'costs' ? (
          <>
            <MetricGrid>
              <MetricTile tone="production" emoji="🧱" label="Production cost" value={money(stats.costs.productionTotal, { dash: true })} sub="materials + labor" />
              <MetricTile tone="firing" emoji="🔥" label="Firing fees" value={money(stats.costs.firingTotal, { dash: true })} sub="paid to kiln" />
              <MetricTile tone="neutral" emoji="🏺" label="Avg / piece" value={money(stats.costs.avgPerPiece, { dash: true })} />
              <MetricTile tone="neutral" emoji="⏱️" label="Cost / work hr" value={money(stats.costs.costPerWorkHour, { dash: true })} />
            </MetricGrid>

            {stats.costs.productionTotal > 0 ? (
              <AnalyticsSectionCard
                title="Cost breakdown"
                hint="Share of production spend"
                accent="costs"
                icon={<Coins size={18} color={CHART_COLORS.production} />}
              >
                <DonutChart
                  segments={costDonutSegments}
                  centerLabel="Total"
                  centerValue={money(stats.costs.productionTotal)}
                  layout="side"
                />
              </AnalyticsSectionCard>
            ) : (
              <EmptyHint text="No costed pieces in this period yet." />
            )}

            {(stats.margins.byForm.length > 0 ||
              stats.margins.byClay.length > 0 ||
              stats.margins.byFormingMethod.length > 0) ? (
              <AnalyticsSectionCard
                title="Margin by product line"
                hint="Avg list price vs cost for finished & sold work"
                accent="costs"
                icon={<Coins size={18} color={CHART_COLORS.production} />}
              >
                <SegmentedControl
                  options={[
                    { value: 'form', label: 'Form' },
                    { value: 'clay', label: 'Clay body' },
                    { value: 'method', label: 'Method' },
                  ]}
                  value={marginGroupView}
                  onChange={setMarginGroupView}
                />
                <View className="mt-4">
                  <MarginByGroupList rows={marginGroupRows} money={money} />
                </View>
              </AnalyticsSectionCard>
            ) : null}

            {!isStudioOwner && !isMemberLens ? (
              <>
                <SectionLabel title="Revenue & margin" />
                <MetricGrid>
                  <MetricTile tone="revenue" emoji="💵" label={pricingCopy.revenueLabel} value={money(stats.revenue.soldRevenue, { dash: true })} sub={`${stats.summary.soldCount} sold`} />
                  <MetricTile tone="revenue" emoji="📈" label="Realized margin" value={money(stats.revenue.realizedMargin, { dash: true })} />
                  <MetricTile
                    tone="revenue"
                    emoji="⏱️"
                    label="Effective $/hr"
                    value={stats.margins.effectiveHourlyRate != null ? money(stats.margins.effectiveHourlyRate) : '-'}
                    sub="sold margin ÷ hours"
                  />
                  <MetricTile tone="neutral" emoji="✨" label="Shelf potential" value={money(stats.revenue.potentialRevenue, { dash: true })} sub="finished, unsold" />
                </MetricGrid>

                <Text className="text-[11px] px-1 -mt-2 mb-4 leading-4" style={{ color: ANALYTICS_THEME.inkMuted }}>
                  Based on target prices, sale dates not yet tracked
                </Text>
              </>
            ) : null}
          </>
        ) : null}

        {tab === 'firings' ? (
          stats.firings.count === 0 ? (
            <EmptyHint
              icon={<FlameKindling size={32} color={ANALYTICS_THEME.inkMuted} />}
              text="No completed firings in this period."
            />
          ) : (
            <>
              <AnalyticsSectionCard
                title="Firing mix"
                hint="Bisque vs glaze firings this period"
                accent="firings"
                icon={<FlameKindling size={18} color={CHART_COLORS.firing} />}
              >
                <FiringSplitChart
                  bisqueCount={stats.firings.bisqueCount}
                  glazeCount={stats.firings.glazeCount}
                  successRate={stats.firings.successRate}
                />
              </AnalyticsSectionCard>

              <MetricGrid>
                <MetricTile tone="firing" emoji="🔥" label="Avg / firing" value={money(stats.firings.avgCostPerFiring, { dash: true })} />
                <MetricTile tone="firing" emoji="🏺" label="Cost / piece" value={money(stats.firings.avgCostPerPiece, { dash: true })} />
                <MetricTile tone="neutral" emoji="📦" label="Avg load" value={stats.firings.avgPiecesPerFiring != null ? stats.firings.avgPiecesPerFiring.toFixed(1) : '-'} sub="pieces / firing" />
                <MetricTile tone="neutral" emoji="✅" label="Pieces fired" value={String(stats.firings.piecesFired)} sub={`${stats.firings.uniquePiecesFired} unique`} />
              </MetricGrid>

              <SectionLabel title="Recent firings" />
              <View className="gap-3 mb-4">
                {stats.firings.recent.map((firing) => (
                  <FiringRow key={firing.id} firing={firing} money={money} />
                ))}
              </View>
            </>
          )
        ) : null}

        {tab === 'pieces' ? (
          <>
            <AnalyticsSectionCard
              title="Piece economics"
              hint="Cost and price per piece"
              accent="pieces"
              icon={<Receipt size={18} color={CHART_COLORS.success} />}
            >
              <SegmentedControl
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'finished', label: 'Finished' },
                  { value: 'sold', label: 'Sold' },
                  { value: 'lost', label: 'Lost' },
                ]}
                value={economicsFilter}
                onChange={setEconomicsFilter}
              />
              {filteredEconomics.length === 0 ? (
                <View className="mt-5">
                  <EmptyHint text="No pieces match this filter for the selected period." />
                </View>
              ) : (
                <View className="gap-3 mt-5">
                  {filteredEconomics.slice(0, 25).map((row) => (
                    <PieceEconomicsRow
                      key={row.id}
                      row={row}
                      money={money}
                      onPress={() => router.push(`/(tabs)/pieces?stage=${row.stage}` as never)}
                    />
                  ))}
                  {filteredEconomics.length > 25 ? (
                    <Text className="text-[11px] text-center mt-1" style={{ color: ANALYTICS_THEME.inkMuted }}>
                      Showing 25 of {filteredEconomics.length}
                    </Text>
                  ) : null}
                </View>
              )}
            </AnalyticsSectionCard>

            {stats.process.length > 0 ? (
              <AnalyticsSectionCard
                title="Time in stage"
                hint="Median days between transitions, all time"
                accent="pieces"
                icon={<TrendingUp size={18} color={CHART_COLORS.success} />}
              >
                <StageDurationChart rows={stats.process} stageLabels={STAGE_LABELS} />
              </AnalyticsSectionCard>
            ) : null}

            {stats.losses.length > 0 ? (
              <AnalyticsSectionCard
                title="Loss breakdown"
                hint={`Cause of death, ${stats.period.label}`}
                accent="firings"
                icon={<FlameKindling size={18} color={CHART_COLORS.firing} />}
              >
                <HorizontalBarChart
                  rows={stats.losses.map((r) => ({
                    label: r.label,
                    value: r.count,
                    pct: r.pct,
                    color: CHART_COLORS.firing,
                    detail: `${r.count} · ${Math.round(r.pct)}%`,
                  }))}
                  maxRows={8}
                />
              </AnalyticsSectionCard>
            ) : null}
          </>
        ) : null}

        {tab === 'materials' ? (
          <>
            {stats.materials.glazes.length > 0 ? (
              <AnalyticsSectionCard
                title="Glaze usage"
                hint={glazeUsageHint ?? 'Linked pieces and test tiles, grouped by glaze family'}
                accent="materials"
                icon={<Layers size={18} color={CHART_COLORS.glazeMaterial} />}
              >
                <GlazeUsageList
                  rows={stats.materials.glazes}
                  onRowPress={(row) => {
                    if (row.familyKey) setGlazeUsageFamilyKey(row.familyKey);
                  }}
                />
              </AnalyticsSectionCard>
            ) : (
              <EmptyHint text="Link glazes to pieces or log test tiles to see usage here." />
            )}

            {stats.materials.clayBodies.length > 0 ? (
              <AnalyticsSectionCard title="Clay bodies" hint={stats.period.label} accent="materials" icon={<Layers size={18} color={CHART_COLORS.clay} />}>
                <HorizontalBarChart
                  rows={stats.materials.clayBodies.map((r) => ({
                    label: r.label,
                    value: r.count,
                    pct: r.pct,
                    color: CHART_COLORS.clay,
                  }))}
                />
              </AnalyticsSectionCard>
            ) : null}

            {stats.materials.formingMethods.length > 0 ? (
              <AnalyticsSectionCard title="Forming methods" hint={stats.period.label} accent="materials" icon={<Layers size={18} color={CHART_COLORS.pieces} />}>
                <HorizontalBarChart
                  rows={stats.materials.formingMethods.map((r) => ({
                    label: r.label,
                    value: r.count,
                    pct: r.pct,
                    color: CHART_COLORS.pieces,
                  }))}
                />
              </AnalyticsSectionCard>
            ) : null}
          </>
        ) : null}

        <SectionLabel title="Your data" />
        <AnalyticsSectionCard
          title="Export studio data"
          hint="Premium · JSON backup of your studio"
          accent="export"
          icon={<Download size={18} color="hsl(280 35% 48%)" />}
        >
          <Text className="text-xs leading-5" style={{ color: ANALYTICS_THEME.inkMuted }}>
            Download pieces, firings, glazes, and test tiles, {exportSummary}.
          </Text>
          <TouchableOpacity
            onPress={handleExport}
            disabled={exporting}
            activeOpacity={0.82}
            className="mt-4 rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: ANALYTICS_THEME.chipActiveBg }}
          >
            {exporting ? (
              <ActivityIndicator color={ANALYTICS_THEME.heroText} size="small" />
            ) : (
              <Download size={16} color={ANALYTICS_THEME.heroText} />
            )}
            <Text className="text-sm font-semibold" style={{ color: ANALYTICS_THEME.heroText }}>
              {exporting ? 'Preparing…' : 'Export my data'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/privacy-settings' as never)}
            activeOpacity={0.7}
            className="mt-2 py-1 items-center"
          >
            <Text className="text-[11px]" style={{ color: ANALYTICS_THEME.inkMuted }}>
              Also in Privacy Settings
            </Text>
          </TouchableOpacity>
        </AnalyticsSectionCard>
        </View>
      </ScrollView>

      <GlazeUsageDrillDownSheet
        familyKey={glazeUsageFamilyKey}
        pieces={pieces}
        glazeTests={glazeTests}
        glazes={glazes}
        periodId={periodId}
        onClose={() => setGlazeUsageFamilyKey(null)}
      />
    </View>
    </>
  );
}

function GlazeUsageList({
  rows,
  onRowPress,
}: {
  rows: RankedUsage[];
  onRowPress?: (row: RankedUsage) => void;
}) {
  const chartRows = rows.slice(0, 6).map((row) => ({
    label: row.label,
    value: row.count,
    pct: row.pct,
    color: CHART_COLORS.glazeMaterial,
    detail:
      row.pieceCount != null && row.testCount != null
        ? `${row.count} · ${Math.round(row.pct)}% (${row.pieceCount}p · ${row.testCount}t)`
        : `${row.count} · ${Math.round(row.pct)}%`,
  }));

  return (
    <HorizontalBarChart
      rows={chartRows}
      maxRows={6}
      onRowPress={
        onRowPress
          ? (_, index) => {
              const row = rows[index];
              if (row?.familyKey) onRowPress(row);
            }
          : undefined
      }
    />
  );
}

function PieceEconomicsRow({
  row,
  money,
  onPress,
}: {
  row: PieceEconomicRow;
  money: (v: number | null | undefined) => string;
  onPress: () => void;
}) {
  const marginPositive = row.margin != null && row.margin >= 0;

  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress}>
      <View
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: ANALYTICS_THEME.cardBg, borderColor: ANALYTICS_THEME.cardBorder }}
      >
        <View
          className="h-1"
          style={{ backgroundColor: marginPositive ? CHART_COLORS.success : CHART_COLORS.firing }}
        />
        <View className="p-3.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold" style={{ color: ANALYTICS_THEME.ink }} numberOfLines={1}>
                {row.name}
              </Text>
              <Text className="text-[11px] mt-0.5" style={{ color: ANALYTICS_THEME.inkMuted }}>
                {STAGE_LABELS[row.stage.trim().toLowerCase()] ?? row.stage} · {row.dateLabel}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-base font-serif font-bold" style={{ color: ANALYTICS_THEME.ink }}>
                {money(row.totalCost)}
              </Text>
              {row.listPrice != null ? (
                <Text className="text-[11px] mt-0.5" style={{ color: ANALYTICS_THEME.inkMuted }}>
                  list {money(row.listPrice)}
                </Text>
              ) : null}
            </View>
          </View>
          {row.margin != null ? (
            <View
              className="flex-row items-center justify-between mt-2.5 pt-2.5 border-t"
              style={{ borderTopColor: ANALYTICS_THEME.cardBorder }}
            >
              <Text className="text-[11px]" style={{ color: ANALYTICS_THEME.inkMuted }}>
                Margin
              </Text>
              <Text
                className="text-[11px] font-bold"
                style={{ color: marginPositive ? CHART_COLORS.success : CHART_COLORS.firing }}
              >
                {money(row.margin)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FiringRow({
  firing,
  money,
}: {
  firing: Firing;
  money: (v: number | null | undefined) => string;
}) {
  const resultColor =
    firing.result === 'success'
      ? CHART_COLORS.success
      : firing.result === 'issues'
        ? CHART_COLORS.energy
        : CHART_COLORS.firing;

  return (
    <View
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: ANALYTICS_THEME.cardBg, borderColor: ANALYTICS_THEME.cardBorder }}
    >
      <View className="h-1" style={{ backgroundColor: resultColor }} />
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-sm font-semibold" style={{ color: ANALYTICS_THEME.ink }} numberOfLines={1}>
              {firing.name}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: ANALYTICS_THEME.inkMuted }}>
              {FIRING_TYPE_LABELS[firing.type]} · Cone {firing.cone}
            </Text>
          </View>
          <View className="items-end">
            {firing.estimatedTotalCost ? (
              <Text className="text-base font-serif font-bold" style={{ color: ANALYTICS_THEME.ink }}>
                {money(firing.estimatedTotalCost)}
              </Text>
            ) : null}
            <Text className="text-[11px] mt-0.5" style={{ color: ANALYTICS_THEME.inkMuted }}>
              {firing.pieceIds.length} piece{firing.pieceIds.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <View
          className="flex-row items-center justify-between mt-2.5 pt-2.5 border-t"
          style={{ borderTopColor: ANALYTICS_THEME.cardBorder }}
        >
          <Text className="text-[11px]" style={{ color: ANALYTICS_THEME.inkMuted }}>
            Completed {formatReadyDate(firing.completedAt ?? undefined)}
          </Text>
          <ResultBadge result={firing.result} />
        </View>
      </View>
    </View>
  );
}

function ResultBadge({ result }: { result?: 'success' | 'issues' | 'failure' }) {
  const bg =
    result === 'success'
      ? 'hsl(142 40% 88%)'
      : result === 'issues'
        ? 'hsl(44 70% 88%)'
        : result === 'failure'
          ? 'hsl(0 60% 88%)'
          : 'hsl(35 42% 88%)';
  const fg =
    result === 'success'
      ? 'hsl(142 50% 35%)'
      : result === 'issues'
        ? 'hsl(44 70% 35%)'
        : result === 'failure'
          ? 'hsl(0 60% 38%)'
          : ANALYTICS_THEME.inkSoft;

  return (
    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: bg }}>
      <Text className="text-[10px] font-semibold capitalize" style={{ color: fg }}>
        {result ?? 'completed'}
      </Text>
    </View>
  );
}
