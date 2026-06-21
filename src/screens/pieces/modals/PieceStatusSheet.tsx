import {
  ModalCard,
  ModalSheetFooter,
  ModalShell,
  ModalSheetHeader,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import type { Piece } from '@/src/types/pieces';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { OptionPills } from '../components/OptionPills';
import {
  isConditionStatus,
  PIECE_CONDITION_STATUSES,
  PIECE_DISPOSITION_STATUSES,
  STAGE_LABEL,
} from '../utils/constants';

type PieceStatusSheetProps = {
  piece: Piece;
  onClose: () => void;
  onSave: (piece: Piece) => void;
};

export function PieceStatusSheet({ piece, onClose, onSave }: PieceStatusSheetProps) {
  const sheetHeight = useModalSheetHeight(0.62);
  const currencySymbol = useAppStore((s) => s.pricingSettings.currencySymbol);
  const [status, setStatus] = React.useState(() => piece.status ?? '');
  const [soldPriceDraft, setSoldPriceDraft] = React.useState(() =>
    piece.soldPrice != null ? String(piece.soldPrice) : '',
  );

  const stageLabel = STAGE_LABEL[piece.stage] ?? piece.stage;
  const isSold = status.trim().toLowerCase() === 'sold';

  const handleSave = () => {
    const trimmedStatus = status.trim();
    const parsedSoldPrice = soldPriceDraft.trim() ? Number(soldPriceDraft) : undefined;
    const soldPrice =
      trimmedStatus.toLowerCase() === 'sold'
      && parsedSoldPrice != null
      && !Number.isNaN(parsedSoldPrice)
        ? parsedSoldPrice
        : undefined;

    onSave({
      ...piece,
      status: trimmedStatus || undefined,
      soldPrice,
    });
    onClose();
  };

  return (
    <ModalShell visible onClose={onClose}>
      <ModalCard
        radius={MODAL_SHEET_RADIUS}
        height={sheetHeight}
        maxHeight={sheetHeight}
        withHandle={false}
      >
        <ModalSheetHeader>
          <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Update status
          </Text>
          <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
            {piece.name} · {stageLabel}
          </Text>
        </ModalSheetHeader>

        <ScrollView
          className="px-6"
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground">Listing & outcome</Text>
            <Text className="text-xs text-muted-foreground mt-1 mb-2.5 leading-[18px]">
              Mark sold, available, gifted, and other dispositions.
            </Text>
            <OptionPills
              options={PIECE_DISPOSITION_STATUSES}
              value={isConditionStatus(status) ? '' : status}
              onChange={setStatus}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground">Condition issues</Text>
            <Text className="text-xs text-muted-foreground mt-1 mb-2.5 leading-[18px]">
              Flag cracks or warping at any stage.
            </Text>
            <OptionPills
              options={PIECE_CONDITION_STATUSES}
              value={isConditionStatus(status) ? status : ''}
              onChange={setStatus}
            />
          </View>

          {isSold ? (
            <View className="mb-2">
              <Text className="text-sm font-semibold text-foreground">Sale price</Text>
              <Text className="text-xs text-muted-foreground mt-1 mb-2.5 leading-[18px]">
                Optional — what you actually sold it for.
              </Text>
              <Input
                value={soldPriceDraft}
                onChangeText={setSoldPriceDraft}
                placeholder={`e.g. ${currencySymbol}45.00`}
                keyboardType="decimal-pad"
                className="rounded-2xl bg-card border-border"
              />
            </View>
          ) : null}
        </ScrollView>

        <ModalSheetFooter>
          <View className="flex-row gap-3">
            {status ? (
              <TouchableOpacity
                onPress={() => {
                  setStatus('');
                  setSoldPriceDraft('');
                }}
                activeOpacity={0.82}
                className="flex-1 rounded-2xl border border-border py-3.5 items-center"
              >
                <Text className="text-sm font-semibold text-foreground">Clear</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.82}
              className={`rounded-2xl bg-primary py-3.5 items-center ${status ? 'flex-1' : 'w-full'}`}
            >
              <Text className="text-sm font-semibold text-white">Save status</Text>
            </TouchableOpacity>
          </View>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
