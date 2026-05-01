// src/screens/kiln/KilnHistoryScreen.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAppStore } from '@/src/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, FlameKindling } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Firing } from '../../types/kiln';
import { FiringDetailModal } from './components/FiringDetailModal';
import { FIRING_TYPE_LABELS, KILN_TYPE_LABELS } from './constants';
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

function FiringHistoryCard({
  firing,
  onPress,
}: {
  firing: Firing;
  onPress: () => void;
}) {
  const [expandReceipts, setExpandReceipts] = React.useState(false);
  const hasReceipts = (firing.pieceReceipts?.length ?? 0) > 0;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card className="p-4 mb-3">
        {/* Row 1: name + result badge */}
        <View className="flex-row items-start justify-between mb-1.5">
          <Text className="text-sm font-semibold text-foreground flex-1 pr-3" numberOfLines={1}>
            {firing.name}
          </Text>
          <ResultBadge result={firing.result} />
        </View>

        {/* Row 2: type · cone · pieces */}
        <Text className="text-xs text-muted-foreground mb-1">
          {FIRING_TYPE_LABELS[firing.type]}
          {firing.cone ? `  ·  Cone ${firing.cone}` : ''}
          {`  ·  ${firing.pieceIds.length} piece${firing.pieceIds.length !== 1 ? 's' : ''}`}
        </Text>

        {/* Row 3: clay bodies */}
        {firing.clayBodiesUsed && firing.clayBodiesUsed.length > 0 ? (
          <Text className="text-xs text-muted-foreground mb-1">
            {firing.clayBodiesUsed.join(', ')}
          </Text>
        ) : null}

        {/* result notes */}
        {firing.resultNotes ? (
          <Text className="text-xs text-muted-foreground italic mt-0.5 mb-1" numberOfLines={2}>
            "{firing.resultNotes}"
          </Text>
        ) : null}

        {/* Footer: date + cost */}
        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
          <Text className="text-[11px] text-muted-foreground">
            {formatReadyDate(firing.completedAt ?? undefined)}
          </Text>
          {firing.estimatedTotalCost ? (
            <Text className="text-[11px] font-semibold text-foreground">
              {firing.estimatedTotalCost.toFixed(0)}
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

        {/* Firing list */}
        <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Firing Sessions
        </Text>

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
