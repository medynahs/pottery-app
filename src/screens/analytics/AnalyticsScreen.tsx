import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useVisiblePieces, useAppStore } from '@/src/store';
import {
  computeStudioStats,
  type CostBreakdown,
  type PieceEconomicRow,
  type RankedUsage,
} from '@/src/utils/computeStudioStats';
import {
  ANALYTICS_PERIOD_OPTIONS,
  type AnalyticsPeriodId,
} from '@/src/utils/analyticsPeriods';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { checkPremium, PremiumFeature } from '@/src/utils/premiumGate';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Coins,
  FlameKindling,
  Layers,
  Receipt,
  TrendingUp,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIRING_TYPE_LABELS } from '../kiln/constants';
import { formatReadyDate } from '../kiln/firingEstimations';

type EconomicsFilter = 'all' | 'finished' | 'sold' | 'lost';

type AnalyticsTab = 'overview' | 'costs' | 'firings' | 'pieces' | 'materials';

const ANALYTICS_TABS: { id: AnalyticsTab; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'costs', label: 'Costs', icon: Coins },
  { id: 'firings', label: 'Firings', icon: FlameKindling },
  { id: 'pieces', label: 'Pieces', icon: Receipt },
  { id: 'materials', label: 'Materials', icon: Layers },
];

const STAGE_LABELS: Record<string, string> = {
  idea: 'Idea', forming: 'Forming', 'leather-hard': 'Leather Hard',
  trimming: 'Trimming', drying: 'Drying', 'bone-dry': 'Bone Dry',
  bisque: 'Bisque', glazing: 'Glazing', 'glaze-fired': 'Glaze Fired',
  finished: 'Finished', cemetery: 'Cemetery',
};

const COST_BREAKDOWN_META: { key: keyof CostBreakdown; label: string; color: string }[] = [
  { key: 'clay', label: 'Clay', color: 'hsl(24 45% 55%)' },
  { key: 'glaze', label: 'Glaze', color: 'hsl(200 45% 55%)' },
  { key: 'energy', label: 'Energy', color: 'hsl(44 70% 55%)' },
  { key: 'firing', label: 'Firing fee', color: 'hsl(8 60% 58%)' },
  { key: 'labor', label: 'Labor', color: 'hsl(142 40% 50%)' },
  { key: 'admin', label: 'Admin', color: 'hsl(280 35% 60%)' },
  { key: 'overhead', label: 'Overhead', color: 'hsl(24 20% 55%)' },
  { key: 'other', label: 'Other', color: 'hsl(24 10% 70%)' },
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="flex-1 p-4">
      <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</Text>
      <Text className="text-2xl font-serif font-bold text-foreground">{value}</Text>
      {sub ? <Text className="text-[11px] text-muted-foreground mt-0.5">{sub}</Text> : null}
    </Card>
  );
}

function SectionLabel({ title, icon, hint }: { title: string; icon: React.ReactNode; hint?: string }) {
  return (
    <View className="mb-3 mt-5">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</Text>
      </View>
      {hint ? <Text className="text-[11px] text-muted-foreground mt-1">{hint}</Text> : null}
    </View>
  );
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestAccess, PaywallGate } = usePremiumGate();
  const isPremium = useAppStore((s) => s.isPremium);

  React.useEffect(() => {
    if (!checkPremium(PremiumFeature.Analytics)) {
      requestAccess(PremiumFeature.Analytics);
    }
  }, [requestAccess]);

  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);
  const glazeTests = useAppStore((s) => s.glazeTests);
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);
  const userType = useAppStore((s) => s.onboardingProfile.userType);

  const [periodId, setPeriodId] = React.useState<AnalyticsPeriodId>('this-month');
  const [tab, setTab] = React.useState<AnalyticsTab>('overview');
  const [trendMetric, setTrendMetric] = React.useState<'cost' | 'fired'>('cost');
  const [economicsFilter, setEconomicsFilter] = React.useState<EconomicsFilter>('all');

  const isStudioOwner = userType === 'studio-owner-technician';

  const stats = React.useMemo(
    () => computeStudioStats({ pieces, firings, glazeTests, periodId }),
    [pieces, firings, glazeTests, periodId],
  );

  const money = React.useCallback(
    (v: number | null | undefined, opts?: { dash?: boolean }) => {
      if (v == null || (opts?.dash && v === 0)) return '—';
      return `${currencySymbol}${Math.round(v).toLocaleString()}`;
    },
    [currencySymbol],
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

  // ── Role-ordered KPI strip ──────────────────────────────────────────
  const summaryCards = React.useMemo(() => {
    const finished = (
      <StatCard key="finished" label="Finished" value={String(stats.summary.piecesFinished)} sub={`${stats.summary.piecesCreated} created`} />
    );
    const productionCost = (
      <StatCard key="prod" label="Production cost" value={money(stats.costs.productionTotal, { dash: true })} sub="est. to make" />
    );
    const soldRevenue = (
      <StatCard key="rev" label="Sold revenue" value={money(stats.revenue.soldRevenue, { dash: true })} sub={`${stats.summary.soldCount} sold`} />
    );
    const avgCost = (
      <StatCard key="avg" label="Avg cost / piece" value={money(stats.costs.avgPerPiece, { dash: true })} />
    );
    const firingsDone = (
      <StatCard key="firings" label="Firings" value={String(stats.firings.count)} sub={`${stats.firings.bisqueCount} bisque · ${stats.firings.glazeCount} glaze`} />
    );
    const piecesFired = (
      <StatCard key="fired" label="Pieces fired" value={String(stats.firings.piecesFired)} sub={`${stats.firings.uniquePiecesFired} unique`} />
    );
    const firingSpend = (
      <StatCard key="spend" label="Firing fees paid" value={money(stats.firings.totalCost, { dash: true })} />
    );
    const avgFiring = (
      <StatCard key="avgfir" label="Avg / firing" value={money(stats.firings.avgCostPerFiring, { dash: true })} />
    );

    return isStudioOwner
      ? [firingsDone, piecesFired, firingSpend, avgFiring]
      : [finished, productionCost, soldRevenue, avgCost];
  }, [isStudioOwner, money, stats]);

  if (!isPremium) {
    return <>{PaywallGate}</>;
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={20} color="hsl(24 20% 40%)" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-serif font-bold text-foreground">Studio Analytics</Text>
          <Text className="text-[11px] text-muted-foreground">{stats.period.label} · estimated figures</Text>
        </View>
        <TrendingUp size={20} color="hsl(24 20% 45%)" />
      </View>

      {/* Period picker */}
      <View className="flex-row gap-2 px-4 pt-3 pb-3">
        {ANALYTICS_PERIOD_OPTIONS.map((opt) => {
          const active = opt.id === periodId;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setPeriodId(opt.id)}
              activeOpacity={0.8}
              className={`flex-1 rounded-xl py-2 items-center border ${active ? 'bg-primary border-primary' : 'bg-card border-border'}`}
            >
              <Text className={`text-[11px] font-semibold ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category tabs */}
      <View className="border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 4 }}
        >
          {ANALYTICS_TABS.map(({ id, label, icon: Icon }) => {
            const active = id === tab;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setTab(id)}
                activeOpacity={0.8}
                className="flex-row items-center gap-1.5 px-3 py-3"
                style={active ? { borderBottomWidth: 2, borderBottomColor: 'hsl(24 45% 45%)' } : undefined}
              >
                <Icon size={15} color={active ? 'hsl(24 45% 40%)' : 'hsl(24 10% 60%)'} />
                <Text className={`text-xs font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      >
        {tab === 'overview' ? (
          <>
            <SectionLabel title="Summary" icon={<TrendingUp size={14} color="hsl(24 20% 40%)" />} />
            <View className="flex-row gap-3 mb-3">{summaryCards.slice(0, 2)}</View>
            <View className="flex-row gap-3">{summaryCards.slice(2, 4)}</View>

            <SectionLabel
              title="Monthly trend"
              icon={<TrendingUp size={14} color="hsl(24 20% 40%)" />}
              hint="Rolling 6 months"
            />
            <Card className="p-4">
              <View className="flex-row gap-2 mb-4 self-start">
                {(['cost', 'fired'] as const).map((m) => {
                  const active = m === trendMetric;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setTrendMetric(m)}
                      activeOpacity={0.8}
                      className={`rounded-lg px-3 py-1 border ${active ? 'bg-primary border-primary' : 'bg-muted/40 border-border'}`}
                    >
                      <Text className={`text-[11px] font-semibold ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                        {m === 'cost' ? 'Costs' : 'Pieces fired'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TrendChart data={stats.monthlyTrend} metric={trendMetric} money={money} />
            </Card>
          </>
        ) : null}

        {tab === 'costs' ? (
          <>
            <SectionLabel
              title="Costs"
              icon={<Coins size={14} color="hsl(24 20% 40%)" />}
              hint="What it cost to make your work vs. firing fees paid"
            />
            <View className="flex-row gap-3 mb-3">
              <StatCard label="Production cost" value={money(stats.costs.productionTotal, { dash: true })} sub="materials + labor" />
              <StatCard label="Firing fees" value={money(stats.costs.firingTotal, { dash: true })} sub="paid to kiln" />
            </View>
            <View className="flex-row gap-3 mb-3">
              <StatCard label="Avg / piece" value={money(stats.costs.avgPerPiece, { dash: true })} />
              <StatCard label="Cost / work hr" value={money(stats.costs.costPerWorkHour, { dash: true })} />
            </View>

            {stats.costs.productionTotal > 0 ? (
              <Card className="p-4 mb-1">
                <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Cost breakdown</Text>
                <CostBreakdownBars breakdown={stats.costs.breakdown} total={stats.costs.productionTotal} money={money} />
              </Card>
            ) : (
              <EmptyHint text="No costed pieces in this period yet." />
            )}

            {!isStudioOwner ? (
              <>
                <SectionLabel
                  title="Revenue & margin"
                  icon={<Coins size={14} color="hsl(24 20% 40%)" />}
                  hint="Based on target prices — sale dates not yet tracked"
                />
                <View className="flex-row gap-3 mb-3">
                  <StatCard label="Sold revenue" value={money(stats.revenue.soldRevenue, { dash: true })} sub={`${stats.summary.soldCount} sold`} />
                  <StatCard label="Realized margin" value={money(stats.revenue.realizedMargin, { dash: true })} />
                </View>
                <View className="flex-row gap-3 mb-1">
                  <StatCard label="Avg sale price" value={money(stats.revenue.avgSalePrice, { dash: true })} />
                  <StatCard label="Potential" value={money(stats.revenue.potentialRevenue, { dash: true })} sub="finished, unsold" />
                </View>
              </>
            ) : null}
          </>
        ) : null}

        {tab === 'firings' ? (
          stats.firings.count === 0 ? (
            <View className="mt-1">
              <EmptyHint
                icon={<FlameKindling size={26} color="hsl(24 20% 60%)" />}
                text="No completed firings in this period."
              />
            </View>
          ) : (
            <>
              <SectionLabel title="Firing costs" icon={<FlameKindling size={14} color="hsl(24 20% 40%)" />} />
              <View className="flex-row gap-3 mb-3">
                <StatCard label="Firings" value={String(stats.firings.count)} sub={`${stats.firings.bisqueCount} bisque · ${stats.firings.glazeCount} glaze`} />
                <StatCard label="Pieces fired" value={String(stats.firings.piecesFired)} sub={`${stats.firings.uniquePiecesFired} unique`} />
              </View>
              <View className="flex-row gap-3 mb-3">
                <StatCard label="Avg / firing" value={money(stats.firings.avgCostPerFiring, { dash: true })} />
                <StatCard label="Cost / piece fired" value={money(stats.firings.avgCostPerPiece, { dash: true })} />
              </View>
              <View className="flex-row gap-3 mb-4">
                <StatCard
                  label="Avg load"
                  value={stats.firings.avgPiecesPerFiring != null ? stats.firings.avgPiecesPerFiring.toFixed(1) : '—'}
                  sub="pieces / firing"
                />
                <StatCard
                  label="Firing success"
                  value={stats.firings.successRate != null ? `${Math.round(stats.firings.successRate)}%` : '—'}
                  sub={stats.firings.piecesLost > 0 ? `${stats.firings.piecesLost} lost` : undefined}
                />
              </View>

              <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Recent firings
              </Text>
              <View className="gap-2">
                {stats.firings.recent.map((firing) => (
                  <Card key={firing.id} className="p-4">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>{firing.name}</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          {FIRING_TYPE_LABELS[firing.type]} · Cone {firing.cone}
                        </Text>
                      </View>
                      <View className="items-end">
                        {firing.estimatedTotalCost ? (
                          <Text className="text-sm font-semibold text-foreground">{money(firing.estimatedTotalCost)}</Text>
                        ) : null}
                        <Text className="text-[11px] text-muted-foreground mt-0.5">
                          {firing.pieceIds.length} piece{firing.pieceIds.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between mt-2.5 pt-2.5 border-t border-border">
                      <Text className="text-[11px] text-muted-foreground">
                        Completed {formatReadyDate(firing.completedAt ?? undefined)}
                      </Text>
                      <ResultBadge result={firing.result} />
                    </View>
                  </Card>
                ))}
              </View>
            </>
          )
        ) : null}

        {tab === 'pieces' ? (
          <>
            <SectionLabel
              title="Piece economics"
              icon={<Receipt size={14} color="hsl(24 20% 40%)" />}
              hint="Cost and price per piece"
            />
            <View className="flex-row gap-2 mb-3">
              {(['all', 'finished', 'sold', 'lost'] as EconomicsFilter[]).map((f) => {
                const active = f === economicsFilter;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setEconomicsFilter(f)}
                    activeOpacity={0.8}
                    className={`rounded-lg px-3 py-1.5 border ${active ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                  >
                    <Text className={`text-[11px] font-semibold capitalize ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {filteredEconomics.length === 0 ? (
              <EmptyHint text="No pieces match this filter for the selected period." />
            ) : (
              <View className="gap-2">
                {filteredEconomics.slice(0, 25).map((row) => (
                  <PieceEconomicsRow
                    key={row.id}
                    row={row}
                    money={money}
                    onPress={() => router.push(`/(tabs)/pieces?stage=${row.stage}` as never)}
                  />
                ))}
                {filteredEconomics.length > 25 ? (
                  <Text className="text-[11px] text-muted-foreground mt-1 text-center">
                    Showing 25 of {filteredEconomics.length}
                  </Text>
                ) : null}
              </View>
            )}

            {stats.process.length > 0 ? (
              <>
                <SectionLabel title="Time in stage" icon={<Layers size={14} color="hsl(24 20% 40%)" />} hint="Median days, all time" />
                <Card className="p-4 gap-3">
                  {stats.process.map((d) => (
                    <View key={`${d.from}-${d.to}`} className="flex-row items-center justify-between">
                      <Text className="text-xs text-foreground flex-1" numberOfLines={1}>
                        {STAGE_LABELS[d.from] ?? d.from} → {STAGE_LABELS[d.to] ?? d.to}
                      </Text>
                      <Text className="text-xs font-semibold text-foreground">
                        {d.medianDays < 1 ? '<1 day' : `${d.medianDays.toFixed(1)} days`}
                      </Text>
                    </View>
                  ))}
                </Card>
              </>
            ) : null}
          </>
        ) : null}

        {tab === 'materials' ? (
          <>
            <SectionLabel title="Materials" icon={<Layers size={14} color="hsl(24 20% 40%)" />} hint="All time" />
            <RankedCard title="Clay bodies" rows={stats.materials.clayBodies} />
            <RankedCard title="Forming methods" rows={stats.materials.formingMethods} />
            {stats.materials.glazes.length > 0 ? (
              <RankedCard title="Glaze usage (tests)" rows={stats.materials.glazes} />
            ) : (
              <EmptyHint text="Log glaze tests to see usage here." />
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function TrendChart({
  data,
  metric,
  money,
}: {
  data: { label: string; productionCost: number; firingCost: number; piecesFired: number }[];
  metric: 'cost' | 'fired';
  money: (v: number | null | undefined) => string;
}) {
  const values = data.map((d) =>
    metric === 'cost' ? d.productionCost + d.firingCost : d.piecesFired,
  );
  const max = Math.max(1, ...values);

  return (
    <View className="flex-row items-end justify-between gap-2" style={{ height: 140 }}>
      {data.map((d, i) => {
        const value = values[i];
        const heightPct = (value / max) * 100;
        const prodPct = metric === 'cost' && value > 0 ? (d.productionCost / value) * 100 : 100;
        return (
          <View key={d.label} className="flex-1 items-center justify-end" style={{ height: '100%' }}>
            <Text className="text-[9px] text-muted-foreground mb-1" numberOfLines={1}>
              {metric === 'cost' ? (value > 0 ? money(value) : '') : value > 0 ? String(value) : ''}
            </Text>
            <View
              className="w-full rounded-md overflow-hidden bg-muted/40"
              style={{ height: `${Math.max(2, heightPct)}%`, maxWidth: 36 }}
            >
              {metric === 'cost' ? (
                <>
                  <View style={{ height: `${100 - prodPct}%`, backgroundColor: 'hsl(8 60% 58%)' }} />
                  <View style={{ flex: 1, backgroundColor: 'hsl(24 45% 55%)' }} />
                </>
              ) : (
                <View style={{ flex: 1, backgroundColor: 'hsl(24 45% 55%)' }} />
              )}
            </View>
            <Text className="text-[9px] text-muted-foreground mt-1">{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function CostBreakdownBars({
  breakdown,
  total,
  money,
}: {
  breakdown: CostBreakdown;
  total: number;
  money: (v: number | null | undefined) => string;
}) {
  const rows = COST_BREAKDOWN_META.map((m) => ({ ...m, value: breakdown[m.key] })).filter((r) => r.value > 0);
  return (
    <View className="gap-2.5">
      {rows.map((r) => {
        const pct = total > 0 ? (r.value / total) * 100 : 0;
        return (
          <View key={r.key}>
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-xs text-foreground">{r.label}</Text>
              <Text className="text-xs text-muted-foreground">
                {money(r.value)} · {Math.round(pct)}%
              </Text>
            </View>
            <View className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <View style={{ width: `${Math.max(2, pct)}%`, height: '100%', backgroundColor: r.color }} />
            </View>
          </View>
        );
      })}
    </View>
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
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card className="p-3.5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>{row.name}</Text>
            <Text className="text-[11px] text-muted-foreground mt-0.5">
              {STAGE_LABELS[row.stage.trim().toLowerCase()] ?? row.stage} · {row.dateLabel}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-sm font-semibold text-foreground">{money(row.totalCost)}</Text>
            {row.listPrice != null ? (
              <Text className="text-[11px] text-muted-foreground mt-0.5">list {money(row.listPrice)}</Text>
            ) : null}
          </View>
        </View>
        {row.margin != null ? (
          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
            <Text className="text-[11px] text-muted-foreground">Margin</Text>
            <Text
              className="text-[11px] font-semibold"
              style={{ color: row.margin >= 0 ? 'hsl(142 50% 35%)' : 'hsl(0 60% 45%)' }}
            >
              {money(row.margin)}
            </Text>
          </View>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}

function RankedCard({ title, rows }: { title: string; rows: RankedUsage[] }) {
  if (rows.length === 0) return null;
  return (
    <Card className="p-4 mb-3 gap-2.5">
      <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</Text>
      {rows.slice(0, 5).map((r) => (
        <View key={r.label}>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs text-foreground flex-1" numberOfLines={1}>{r.label}</Text>
            <Text className="text-xs text-muted-foreground">{r.count} · {Math.round(r.pct)}%</Text>
          </View>
          <View className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <View style={{ width: `${Math.max(2, r.pct)}%`, height: '100%', backgroundColor: 'hsl(24 45% 55%)' }} />
          </View>
        </View>
      ))}
    </Card>
  );
}

function ResultBadge({ result }: { result?: 'success' | 'issues' | 'failure' }) {
  const bg =
    result === 'success' ? 'hsl(142 40% 88%)' : result === 'issues' ? 'hsl(44 70% 88%)' : result === 'failure' ? 'hsl(0 60% 88%)' : 'hsl(24 15% 90%)';
  const fg =
    result === 'success' ? 'hsl(142 50% 35%)' : result === 'issues' ? 'hsl(44 70% 35%)' : result === 'failure' ? 'hsl(0 60% 38%)' : 'hsl(24 20% 45%)';
  return (
    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: bg }}>
      <Text className="text-[10px] font-semibold capitalize" style={{ color: fg }}>
        {result ?? 'completed'}
      </Text>
    </View>
  );
}

function EmptyHint({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-6 items-center">
      {icon}
      <Text className="text-xs text-muted-foreground text-center mt-2">{text}</Text>
    </Card>
  );
}
