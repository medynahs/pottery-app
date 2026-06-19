import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import type { Firing } from '../../../types/kiln';
import { FIRING_TYPE_LABELS } from '../constants';
import {
  formatFiringLogDate,
  formatHoldTime,
  getFiringDisplayDate,
  getFiringOutcomeEmoji,
} from '../utils/kilnHelpers';
import { formatMoney } from '../utils/kilnUtils';

interface FiringLogHistoryCardProps {
  firing: Firing;
  currencySymbol: string;
  onOpenDetail?: () => void;
}

export function FiringLogHistoryCard({
  firing,
  currencySymbol,
  onOpenDetail,
}: FiringLogHistoryCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const holdLabel = formatHoldTime(firing.holdTimeMinutes);
  const outcomeEmoji = getFiringOutcomeEmoji(firing.result);
  const receipts = firing.pieceReceipts ?? [];
  const hasReceipts = receipts.length > 0;

  return (
    <Card className="overflow-hidden mb-3 border border-border/80">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded((value) => !value)}
        className="p-4"
      >
        <View className="flex-row gap-3">
          {firing.photoUri ? (
            <Image
              source={{ uri: firing.photoUri }}
              style={{ width: 56, height: 56, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-14 h-14 rounded-xl bg-muted/40 items-center justify-center">
              <Text className="text-lg">{outcomeEmoji ?? '🔥'}</Text>
            </View>
          )}

          <View className="flex-1">
            <View className="flex-row items-start justify-between gap-2">
              <Text className="text-sm font-semibold text-foreground flex-1">
                {getFiringDisplayDate(firing)}
              </Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-xs font-semibold">
                  {outcomeEmoji}{' '}
                  {firing.result === 'success'
                    ? 'Success'
                    : firing.result === 'issues'
                      ? 'Issue'
                      : 'Completed'}
                </Text>
                {expanded ? (
                  <ChevronUp size={14} color="hsl(24 20% 45%)" />
                ) : (
                  <ChevronDown size={14} color="hsl(24 20% 45%)" />
                )}
              </View>
            </View>

            <Text className="text-xs text-muted-foreground mt-1">
              {firing.peakTempC != null ? `${firing.peakTempC}°C` : '—'}
              {holdLabel ? ` · ${holdLabel}` : ''}
              {firing.estimatedTotalCost != null
                ? ` · ${formatMoney(currencySymbol, firing.estimatedTotalCost)}`
                : ''}
            </Text>

            {firing.pieceIds.length > 0 ? (
              <Text className="text-[11px] text-muted-foreground mt-1">
                {firing.pieceIds.length} piece{firing.pieceIds.length !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View className="px-4 pb-4 border-t border-border">
          <View className="pt-3 gap-2">
            <DetailRow label="Type" value={FIRING_TYPE_LABELS[firing.type]} />
            {firing.peakTempC != null ? (
              <DetailRow label="Peak temp" value={`${firing.peakTempC}°C`} />
            ) : null}
            {holdLabel ? <DetailRow label="Hold" value={holdLabel.replace('Hold: ', '')} /> : null}
            {firing.firedDate ? (
              <DetailRow label="Fired on" value={formatFiringLogDate(firing.firedDate)} />
            ) : null}
            {firing.estimatedTotalCost != null ? (
              <DetailRow
                label="Total cost"
                value={formatMoney(currencySymbol, firing.estimatedTotalCost)}
              />
            ) : null}
            {firing.resultNotes ? (
              <Text className="text-xs text-muted-foreground italic mt-1">
                "{firing.resultNotes}"
              </Text>
            ) : null}
          </View>

          {hasReceipts ? (
            <View className="mt-3 rounded-xl border border-border overflow-hidden">
              <View className="flex-row justify-between px-3 py-2 bg-muted/40 border-b border-border">
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Piece
                </Text>
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Firing fee
                </Text>
              </View>
              {receipts.map((receipt, index) => (
                <View
                  key={`${receipt.pieceBackendId}-${index}`}
                  className={`flex-row items-center justify-between px-3 py-2.5 ${
                    index < receipts.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
                      {receipt.pieceName}
                    </Text>
                    {receipt.clayBody ? (
                      <Text className="text-[10px] text-muted-foreground">{receipt.clayBody}</Text>
                    ) : null}
                    {receipt.survived === false ? (
                      <Text className="text-[10px] font-semibold mt-0.5" style={{ color: 'hsl(0 62% 45%)' }}>
                        Issue reported
                      </Text>
                    ) : null}
                  </View>
                  <Text className="text-xs font-semibold text-foreground">
                    {formatMoney(currencySymbol, receipt.firingFee)}
                  </Text>
                </View>
              ))}
            </View>
          ) : firing.pieceIds.length > 0 ? (
            <Text className="text-xs text-muted-foreground mt-3">
              {firing.pieceIds.length} piece{firing.pieceIds.length !== 1 ? 's' : ''} linked — open
              details for more.
            </Text>
          ) : null}

          {firing.photoUri ? (
            <Image
              source={{ uri: firing.photoUri }}
              style={{ width: '100%', height: 180, borderRadius: 14, marginTop: 12 }}
              resizeMode="cover"
            />
          ) : null}

          {onOpenDetail ? (
            <TouchableOpacity onPress={onOpenDetail} className="mt-3 self-start">
              <Text className="text-[11px] font-semibold text-primary">Open full firing details</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[11px] text-muted-foreground">{label}</Text>
      <Text className="text-[11px] font-semibold text-foreground">{value}</Text>
    </View>
  );
}
