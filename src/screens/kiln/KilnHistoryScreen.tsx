// src/screens/kiln/KilnHistoryScreen.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock3, FlameKindling, Package, Receipt, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Firing } from '../../types/kiln';
import { FiringDetailModal } from './components/FiringDetailModal';
import { FIRING_STATE_LABELS, FIRING_TYPE_LABELS, KILN_TYPE_LABELS } from './constants';
import { formatReadyDate } from './firingEstimations';

function ResultBadge({ result }: { result?: string }) {
  const bg =
    result === 'success'
      ? 'hsl(142 40% 88%)'
      : result === 'issues'
        ? 'hsl(44 70% 88%)'
        : result === 'failure'
          ? 'hsl(0 60% 88%)'
          : 'hsl(34 30% 85%)';
  const fg =
    result === 'success'
      ? 'hsl(142 50% 35%)'
      : result === 'issues'
        ? 'hsl(44 70% 35%)'
        : result === 'failure'
          ? 'hsl(0 60% 38%)'
          : 'hsl(24 20% 40%)';

  return (
    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: bg }}>
      <Text className="text-[10px] font-semibold capitalize" style={{ color: fg }}>
        {result ?? 'completed'}
      </Text>
    </View>
  );
}

function getResultAccent(result?: string) {
  if (result === 'success') return 'hsl(142 50% 45%)';
  if (result === 'issues') return 'hsl(44 70% 42%)';
  if (result === 'failure') return 'hsl(0 62% 45%)';
  return 'hsl(24 20% 45%)';
}

function getDurationLabel(firing: Firing) {
  if (!firing.startedAt || !firing.completedAt) return null;

  const start = new Date(firing.startedAt).getTime();
  const end = new Date(firing.completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;

  const totalHours = Math.round((end - start) / (1000 * 60 * 60));
  if (totalHours < 24) return `${totalHours}h`;

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
}) {
  const Icon = icon;
  return (
    <View className="flex-1 min-w-[84px] rounded-xl bg-muted/45 px-2.5 py-2">
      <View className="flex-row items-center gap-1.5 mb-1">
        <Icon size={12} color="hsl(24 20% 45%)" />
        <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Text>
      </View>
      <Text className="text-xs font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function getStateBadgeColors(state: Firing['state']) {
  if (state === 'scheduled') return { bg: 'hsl(210 55% 90%)', fg: 'hsl(214 70% 38%)' };
  if (state === 'loading') return { bg: 'hsl(43 80% 90%)', fg: 'hsl(36 75% 34%)' };
  if (state === 'firing') return { bg: 'hsl(22 85% 89%)', fg: 'hsl(18 80% 35%)' };
  if (state === 'cooling') return { bg: 'hsl(196 65% 90%)', fg: 'hsl(197 70% 34%)' };
  if (state === 'unloading') return { bg: 'hsl(153 45% 88%)', fg: 'hsl(152 55% 32%)' };
  return { bg: 'hsl(34 30% 85%)', fg: 'hsl(24 20% 40%)' };
}

function FiringActiveCard({
  firing,
  currencySymbol,
  onPress,
}: {
  firing: Firing;
  currencySymbol: string;
  onPress: () => void;
}) {
  const stateColors = getStateBadgeColors(firing.state);
  const timingLabel = formatReadyDate(firing.expectedReadyAt ?? firing.scheduledDate ?? firing.createdAt);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card className="p-4 mb-3 border border-border/80 bg-card">
        <View className="flex-row items-start justify-between mb-2">
          <Text className="text-sm font-semibold text-foreground flex-1 pr-3" numberOfLines={1}>
            {firing.name}
          </Text>
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: stateColors.bg }}>
            <Text className="text-[10px] font-semibold" style={{ color: stateColors.fg }}>
              {FIRING_STATE_LABELS[firing.state]}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-1.5 mb-2">
          <View className="px-2 py-1 rounded-full bg-muted/50">
            <Text className="text-[10px] font-semibold text-foreground">{FIRING_TYPE_LABELS[firing.type]}</Text>
          </View>
          {firing.cone ? (
            <View className="px-2 py-1 rounded-full bg-muted/50">
              <Text className="text-[10px] font-semibold text-foreground">Cone {firing.cone}</Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row gap-2">
          <StatPill icon={Package} label="Pieces" value={`${firing.pieceIds.length}`} />
          <StatPill icon={Clock3} label="ETA" value={timingLabel} />
          <StatPill
            icon={Receipt}
            label="Planned cost"
            value={firing.estimatedTotalCost != null ? `${currencySymbol}${firing.estimatedTotalCost.toFixed(0)}` : '—'}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function FiringHistoryCard({
  firing,
  currencySymbol,
  onPress,
}: {
  firing: Firing;
  currencySymbol: string;
  onPress: () => void;
}) {
  const [expandReceipts, setExpandReceipts] = React.useState(false);
  const hasReceipts = (firing.pieceReceipts?.length ?? 0) > 0;
  const durationLabel = getDurationLabel(firing);
  const receipts = firing.pieceReceipts ?? [];
  const survivedCount = receipts.filter((receipt) => receipt.survived).length;
  const survivalPct = receipts.length > 0 ? Math.round((survivedCount / receipts.length) * 100) : null;
  const accent = getResultAccent(firing.result);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card className="relative overflow-hidden p-4 mb-3 border border-border/80">
        <View
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: accent }}
        />

        {/* Row 1: name + result badge */}
        <View className="flex-row items-start justify-between mb-1.5">
          <Text className="text-sm font-semibold text-foreground flex-1 pr-3" numberOfLines={1}>
            {firing.name}
          </Text>
          <ResultBadge result={firing.result} />
        </View>

        {/* Row 2: metadata chips */}
        <View className="flex-row flex-wrap gap-1.5 mb-2">
          <View className="px-2 py-1 rounded-full bg-muted/50">
            <Text className="text-[10px] font-semibold text-foreground">{FIRING_TYPE_LABELS[firing.type]}</Text>
          </View>
          {firing.cone ? (
            <View className="px-2 py-1 rounded-full bg-muted/50">
              <Text className="text-[10px] font-semibold text-foreground">Cone {firing.cone}</Text>
            </View>
          ) : null}
          {durationLabel ? (
            <View className="px-2 py-1 rounded-full bg-muted/50">
              <Text className="text-[10px] font-semibold text-foreground">{durationLabel}</Text>
            </View>
          ) : null}
        </View>

        {/* Row 3: clay bodies */}
        {firing.clayBodiesUsed && firing.clayBodiesUsed.length > 0 ? (
          <Text className="text-xs text-muted-foreground mb-2">
            {firing.clayBodiesUsed.join(', ')}
          </Text>
        ) : null}

        <View className="flex-row flex-wrap gap-2 mb-2">
          <StatPill
            icon={Package}
            label="Pieces"
            value={`${firing.pieceIds.length}`}
          />
          <StatPill
            icon={TrendingUp}
            label="Survival"
            value={survivalPct != null ? `${survivalPct}%` : '—'}
          />
          <StatPill
            icon={Receipt}
            label="Cost"
            value={firing.estimatedTotalCost != null ? `${currencySymbol}${firing.estimatedTotalCost.toFixed(0)}` : '—'}
          />
          <StatPill
            icon={Clock3}
            label="Finished"
            value={formatReadyDate(firing.completedAt ?? undefined)}
          />
        </View>

        {/* result notes */}
        {firing.resultNotes ? (
          <Text className="text-xs text-muted-foreground italic mt-0.5 mb-2" numberOfLines={2}>
            "{firing.resultNotes}"
          </Text>
        ) : null}

        {/* Footer: detail hint + receipt summary */}
        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
          <Text className="text-[11px] text-muted-foreground">Tap for full firing details</Text>
          {hasReceipts ? (
            <Text className="text-[11px] font-semibold text-foreground">
              {survivedCount}/{receipts.length} survived
            </Text>
          ) : null}
        </View>

        {/* Piece receipts */}
        {hasReceipts ? (
          <TouchableOpacity
            onPress={() => setExpandReceipts((v) => !v)}
            className="mt-2 self-start"
          >
            <Text className="text-[11px] font-semibold text-primary">
              {expandReceipts ? 'Hide piece receipts' : `Show ${firing.pieceReceipts!.length} piece receipts`}
            </Text>
          </TouchableOpacity>
        ) : null}

        {expandReceipts && hasReceipts ? (
          <View className="mt-2 gap-1.5">
            {firing.pieceReceipts!.map((receipt, index) => (
              <View
                key={`${receipt.pieceBackendId}-${index}`}
                className="flex-row items-center justify-between bg-muted/40 rounded-xl px-3 py-2"
              >
                <Text className="text-xs text-foreground flex-1 pr-2" numberOfLines={1}>
                  {receipt.pieceName}
                </Text>
                <View className="flex-row items-center gap-2">
                  {receipt.firingFee != null ? (
                    <Text className="text-[11px] text-muted-foreground">
                      {receipt.firingFee.toFixed(0)}
                    </Text>
                  ) : null}
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: receipt.survived ? 'hsl(142 40% 88%)' : 'hsl(0 60% 88%)' }}
                  >
                    <Text
                      className="text-[10px] font-semibold"
                      style={{ color: receipt.survived ? 'hsl(142 50% 35%)' : 'hsl(0 60% 38%)' }}
                    >
                      {receipt.survived ? 'Survived' : 'Lost'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}

export default function KilnHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { kilnId } = useLocalSearchParams<{ kilnId: string }>();

  const kilns = useAppStore((s) => s.kilns);
  const firings = useAppStore((s) => s.firings);
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);

  const kiln = React.useMemo(() => kilns.find((k) => k.id === kilnId), [kilns, kilnId]);

  const kilnFirings = React.useMemo(
    () =>
      firings
        .filter((f) => f.kilnId === kilnId && f.state === 'completed')
        .sort(
          (a, b) =>
            new Date(b.completedAt ?? b.createdAt).getTime() -
            new Date(a.completedAt ?? a.createdAt).getTime()
        ),
    [firings, kilnId]
  );

  const activeFirings = React.useMemo(
    () =>
      firings
        .filter((f) => f.kilnId === kilnId && f.state !== 'completed')
        .sort(
          (a, b) =>
            new Date(a.scheduledDate ?? a.createdAt).getTime() -
            new Date(b.scheduledDate ?? b.createdAt).getTime()
        ),
    [firings, kilnId]
  );

  const [detailFiring, setDetailFiring] = React.useState<Firing | null>(null);

  const totalPieces = kilnFirings.reduce((sum, f) => sum + f.pieceIds.length, 0);
  const totalCost = kilnFirings.reduce((sum, f) => sum + (f.estimatedTotalCost ?? 0), 0);
  const successCount = kilnFirings.filter((f) => f.result === 'success').length;
  const successPct = kilnFirings.length > 0 ? Math.round((successCount / kilnFirings.length) * 100) : null;
  const avgCost = kilnFirings.length > 0 && totalCost > 0 ? totalCost / kilnFirings.length : null;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-serif font-bold text-foreground" numberOfLines={1}>
            {kiln?.name ?? 'Kiln History'}
          </Text>
          {kiln ? (
            <Text className="text-[11px] text-muted-foreground">
              {KILN_TYPE_LABELS[kiln.type]}
              {kiln.coneRange ? `  ·  ${kiln.coneRange}` : ''}
            </Text>
          ) : null}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      >
        {/* Kiln image */}
        {kiln?.imageUri ? (
          <Image
            source={{ uri: kiln.imageUri }}
            style={{ width: '100%', height: 160, borderRadius: 16, marginBottom: 16 }}
            resizeMode="cover"
          />
        ) : null}

        {/* Stats row */}
        {kilnFirings.length > 0 ? (
          <View className="flex-row gap-2.5 mb-5">
            <Card className="flex-1 p-3 items-center">
              <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Firings</Text>
              <Text className="text-xl font-serif font-bold text-foreground">{kilnFirings.length}</Text>
            </Card>
            <Card className="flex-1 p-3 items-center">
              <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Pieces</Text>
              <Text className="text-xl font-serif font-bold text-foreground">{totalPieces}</Text>
            </Card>
            <Card className="flex-1 p-3 items-center">
              <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Success</Text>
              <Text className="text-xl font-serif font-bold text-foreground">
                {successPct != null ? `${successPct}%` : '—'}
              </Text>
            </Card>
            <Card className="flex-1 p-3 items-center">
              <Text className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Avg cost</Text>
              <Text className="text-xl font-serif font-bold text-foreground">
                {avgCost != null ? `${currencySymbol}${avgCost.toFixed(0)}` : '—'}
              </Text>
            </Card>
          </View>
        ) : null}

        {/* Upcoming and active */}
        {activeFirings.length > 0 ? (
          <>
            <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Upcoming & Active
            </Text>
            {activeFirings.map((firing) => (
              <FiringActiveCard
                key={firing.id}
                firing={firing}
                currencySymbol={currencySymbol}
                onPress={() => setDetailFiring(firing)}
              />
            ))}
            <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-1">
              Completed Sessions
            </Text>
          </>
        ) : (
          <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Firing Sessions
          </Text>
        )
        }

        {/* Completed firing list */}

        {kilnFirings.length === 0 ? (
          <Card className="p-8 items-center mt-2">
            <View className="w-12 h-12 rounded-2xl bg-muted items-center justify-center mb-3">
              <FlameKindling size={22} color={colors.mutedForeground} />
            </View>
            <Text className="text-sm font-semibold text-foreground text-center">No completed firings yet</Text>
            <Text className="text-xs text-muted-foreground mt-1 text-center leading-relaxed">
              Complete a firing session with this kiln to see its history here.
            </Text>
          </Card>
        ) : (
          kilnFirings.map((firing) => (
            <FiringHistoryCard
              key={firing.id}
              firing={firing}
              currencySymbol={currencySymbol}
              onPress={() => setDetailFiring(firing)}
            />
          ))
        )}
      </ScrollView>

      <FiringDetailModal
        firing={detailFiring}
        visible={detailFiring !== null}
        onClose={() => setDetailFiring(null)}
      />
    </View>
  );
}
