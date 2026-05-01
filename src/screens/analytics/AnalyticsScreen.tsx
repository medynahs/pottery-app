import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { ArrowLeft, FlameKindling, Layers, TrendingUp, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIRING_TYPE_LABELS } from '../kiln/constants';
import { formatReadyDate } from '../kiln/firingEstimations';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="flex-1 p-4">
      <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</Text>
      <Text className="text-2xl font-serif font-bold text-foreground">{value}</Text>
      {sub ? <Text className="text-[11px] text-muted-foreground mt-0.5">{sub}</Text> : null}
    </Card>
  );
}

function SectionLabel({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <View className="flex-row items-center gap-2 mb-3 mt-5">
      {icon}
      <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pieces = useAppStore((s) => s.pieces);
  const firings = useAppStore((s) => s.firings);
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);

  // ── Pieces section ──────────────────────────────────────────────
  const activePieces = React.useMemo(
    () => pieces.filter((p) => p.stage !== 'cemetery'),
    [pieces]
  );
  const finishedPieces = React.useMemo(
    () => pieces.filter((p) => p.stage === 'finished' || p.stage === 'glaze-fired'),
    [pieces]
  );
  const cemeteryPieces = React.useMemo(
    () => pieces.filter((p) => p.stage === 'cemetery'),
    [pieces]
  );

  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    activePieces.forEach((p) => {
      counts[p.stage] = (counts[p.stage] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [activePieces]);

  const topClay = React.useMemo(() => {
    const counts: Record<string, number> = {};
    pieces.forEach((p) => { if (p.clay) counts[p.clay] = (counts[p.clay] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [pieces]);

  const topFormingMethod = React.useMemo(() => {
    const counts: Record<string, number> = {};
    pieces.forEach((p) => { if (p.formingMethod) counts[p.formingMethod] = (counts[p.formingMethod] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [pieces]);

  // ── Studio Activity section ──────────────────────────────────────
  const totalWorkHours = React.useMemo(
    () => pieces.reduce((sum, p) => sum + (p.workHours ?? 0), 0),
    [pieces]
  );
  const piecesWithCost = React.useMemo(
    () => pieces.filter((p) => (p.totalCost ?? 0) > 0),
    [pieces]
  );
  const totalEstimatedCost = React.useMemo(
    () => piecesWithCost.reduce((sum, p) => sum + (p.totalCost ?? 0), 0),
    [piecesWithCost]
  );
  const avgCostPerPiece = piecesWithCost.length > 0 ? totalEstimatedCost / piecesWithCost.length : 0;

  // ── Firings section ─────────────────────────────────────────────
  const completedFirings = React.useMemo(
    () => firings.filter((f) => f.state === 'completed'),
    [firings]
  );

  const totalFirings = completedFirings.length;
  const firingCost = completedFirings.reduce((sum, f) => sum + (f.estimatedTotalCost ?? 0), 0);
  const firingPieces = completedFirings.reduce((sum, f) => sum + f.pieceIds.length, 0);
  const avgCostPerFiring = totalFirings > 0 ? firingCost / totalFirings : 0;
  const bisqueCount = completedFirings.filter((f) => f.type === 'bisque').length;
  const glazeCount = completedFirings.filter((f) => f.type === 'glaze').length;

  const recentFirings = React.useMemo(
    () =>
      [...completedFirings]
        .sort(
          (a, b) =>
            new Date(b.completedAt ?? b.createdAt).getTime() -
            new Date(a.completedAt ?? a.createdAt).getTime()
        )
        .slice(0, 10),
    [completedFirings]
  );

  const STAGE_LABELS: Record<string, string> = {
    idea: 'Idea', forming: 'Forming', 'leather-hard': 'Leather Hard',
    trimming: 'Trimming', drying: 'Drying', 'bone-dry': 'Bone Dry',
    bisque: 'Bisque', glazing: 'Glazing', 'glaze-fired': 'Glaze Fired',
    finished: 'Finished',
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={20} color="hsl(24 20% 40%)" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-serif font-bold text-foreground">Studio Analytics</Text>
          <Text className="text-[11px] text-muted-foreground">Pieces, activity &amp; firings</Text>
        </View>
        <TrendingUp size={20} color="hsl(24 20% 45%)" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      >
        {/* ── Section 1: Pieces ── */}
        <SectionLabel title="Pieces" icon={<Layers size={14} color="hsl(24 20% 40%)" />} />

        <View className="flex-row gap-3 mb-3">
          <StatCard label="Active" value={String(activePieces.length)} sub="in progress" />
          <StatCard label="Finished" value={String(finishedPieces.length)} />
          <StatCard label="Cemetery" value={String(cemeteryPieces.length)} />
        </View>

        {stageCounts.length > 0 ? (
          <Card className="p-4 mb-3">
            <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Stage Breakdown</Text>
            <View className="flex-row flex-wrap gap-2">
              {stageCounts.map(([stage, count]) => (
                <View key={stage} className="flex-row items-center gap-1 bg-muted/50 rounded-xl px-3 py-1.5">
                  <Text className="text-xs text-foreground font-medium">
                    {STAGE_LABELS[stage] ?? stage}
                  </Text>
                  <Text className="text-xs text-muted-foreground">{count}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {(topClay || topFormingMethod) ? (
          <View className="flex-row gap-3 mb-1">
            {topClay ? (
              <Card className="flex-1 p-4">
                <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Top Clay Body</Text>
                <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>{topClay}</Text>
              </Card>
            ) : null}
            {topFormingMethod ? (
              <Card className="flex-1 p-4">
                <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Top Forming Method</Text>
                <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>{topFormingMethod}</Text>
              </Card>
            ) : null}
          </View>
        ) : null}

        {/* ── Section 2: Studio Activity ── */}
        <SectionLabel title="Studio Activity" icon={<Users size={14} color="hsl(24 20% 40%)" />} />

        <View className="flex-row gap-3 mb-3">
          <StatCard
            label="Work hours"
            value={totalWorkHours > 0 ? `${totalWorkHours.toFixed(1)}h` : '—'}
            sub="logged across pieces"
          />
          <StatCard
            label="Pieces costed"
            value={String(piecesWithCost.length)}
            sub={`of ${pieces.length} total`}
          />
        </View>
        <View className="flex-row gap-3 mb-1">
          <StatCard
            label="Total est. cost"
            value={totalEstimatedCost > 0 ? `${currencySymbol}${totalEstimatedCost.toFixed(0)}` : '—'}
          />
          <StatCard
            label="Avg cost / piece"
            value={avgCostPerPiece > 0 ? `${currencySymbol}${avgCostPerPiece.toFixed(0)}` : '—'}
          />
        </View>

        {/* ── Section 3: Firings ── */}
        <SectionLabel title="Firings" icon={<FlameKindling size={14} color="hsl(24 20% 40%)" />} />

        {totalFirings === 0 ? (
          <Card className="p-6 items-center">
            <FlameKindling size={28} color="hsl(24 20% 60%)" />
            <Text className="text-sm font-semibold text-foreground mt-3 mb-1">No completed firings yet</Text>
            <Text className="text-xs text-muted-foreground text-center">
              Complete a firing session to see history and cost data here.
            </Text>
          </Card>
        ) : (
          <>
            <View className="flex-row gap-3 mb-3">
              <StatCard label="Total firings" value={String(totalFirings)} sub={`${bisqueCount} bisque · ${glazeCount} glaze`} />
              <StatCard label="Pieces fired" value={String(firingPieces)} />
            </View>
            <View className="flex-row gap-3 mb-4">
              <StatCard
                label="Total cost"
                value={firingCost > 0 ? `${currencySymbol}${firingCost.toFixed(0)}` : '—'}
              />
              <StatCard
                label="Avg cost / firing"
                value={avgCostPerFiring > 0 ? `${currencySymbol}${avgCostPerFiring.toFixed(0)}` : '—'}
              />
            </View>

            <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Recent Firings
            </Text>
            <View className="gap-2">
              {recentFirings.map((firing) => (
                <Card key={firing.id} className="p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                        {firing.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {FIRING_TYPE_LABELS[firing.type]} · Cone {firing.cone}
                      </Text>
                    </View>
                    <View className="items-end">
                      {firing.estimatedTotalCost ? (
                        <Text className="text-sm font-semibold text-foreground">
                          {currencySymbol}{firing.estimatedTotalCost.toFixed(0)}
                        </Text>
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
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          firing.result === 'success'
                            ? 'hsl(142 40% 88%)'
                            : firing.result === 'issues'
                              ? 'hsl(44 70% 88%)'
                              : 'hsl(0 60% 88%)',
                      }}
                    >
                      <Text
                        className="text-[10px] font-semibold capitalize"
                        style={{
                          color:
                            firing.result === 'success'
                              ? 'hsl(142 50% 35%)'
                              : firing.result === 'issues'
                                ? 'hsl(44 70% 35%)'
                                : 'hsl(0 60% 38%)',
                        }}
                      >
                        {firing.result ?? 'completed'}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
            {completedFirings.length > 10 ? (
              <Text className="text-[11px] text-muted-foreground mt-2 text-center">
                Showing 10 most recent · Full history per kiln in the Kilns tab
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
