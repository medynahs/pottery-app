import { Text } from '@/src/components/ui/text';
import { BrandColors } from '@/src/constants/theme';
import { BookOpen, Check } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import type { Kiln } from '../../../types/kiln';
import type { Piece } from '../../../types/pieces';
import { KILN_UI } from '../utils/kilnTheme';
import { formatMoney } from '../utils/kilnUtils';

type FiringPieceRowProps = {
  piece: Piece;
  kiln?: Kiln;
  selected?: boolean;
  selectable?: boolean;
  lineCost?: number | null;
  currencySymbol?: string;
  survived?: boolean;
  onToggle?: () => void;
  onPreviewImage?: () => void;
  onOpenJournal?: () => void;
};

export function FiringPieceRow({
  piece,
  kiln,
  selected = false,
  selectable = false,
  lineCost = null,
  currencySymbol = '$',
  survived,
  onToggle,
  onPreviewImage,
  onOpenJournal,
}: FiringPieceRowProps) {
  const imageUri = piece.photo ?? piece.imgUrl;
  const showCost = selected && lineCost != null;
  const showJournal = Boolean(onOpenJournal);

  const rowBody = (
    <>
      {selectable ? (
        <View
          className={`w-5 h-5 rounded-md border-2 items-center justify-center ${
            selected ? 'bg-[#3A2810] border-[#3A2810]' : 'border-muted-foreground/40 bg-background'
          }`}
        >
          {selected ? <Check size={11} color={KILN_UI.cream} /> : null}
        </View>
      ) : null}

      {imageUri ? (
        <Pressable
          onPress={onPreviewImage}
          disabled={!onPreviewImage}
          hitSlop={4}
          className="w-12 h-12 rounded-xl overflow-hidden border"
          style={{ borderColor: KILN_UI.brownSoftBorder }}
        >
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </Pressable>
      ) : (
        <View
          className="w-12 h-12 rounded-xl items-center justify-center border"
          style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.brownSoft }}
        >
          <Text className="text-[10px] font-semibold" style={{ color: KILN_UI.brownMuted }}>
            {piece.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}

      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {piece.name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {piece.clay}
          {kiln?.pricingModel === 'per-volume' && piece.volumeCm3
            ? ` · ${piece.volumeCm3} cm³`
            : ''}
        </Text>
        {survived === false ? (
          <Text className="text-[10px] font-semibold mt-0.5" style={{ color: 'hsl(0 62% 45%)' }}>
            Issue reported
          </Text>
        ) : null}
      </View>

      {showCost ? (
        <Text className="text-xs font-semibold text-foreground">
          {formatMoney(currencySymbol, lineCost)}
        </Text>
      ) : null}

      {showJournal ? (
        <Pressable
          onPress={onOpenJournal}
          hitSlop={8}
          className="flex-row items-center gap-1 px-2.5 py-2 rounded-xl border"
          style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.brownSoft }}
        >
          <BookOpen size={13} color={BrandColors.primary} />
          <Text className="text-[11px] font-semibold" style={{ color: KILN_UI.brown }}>
            Journal
          </Text>
        </Pressable>
      ) : null}
    </>
  );

  if (selectable) {
    return (
      <Pressable
        onPress={onToggle}
        className={`flex-row items-center gap-3 rounded-2xl border px-3 py-3 ${
          selected ? 'border-[#3A2810] bg-[#3A2810]/8' : 'border-border bg-card'
        }`}
      >
        {rowBody}
      </Pressable>
    );
  }

  return (
    <View
      className="flex-row items-center gap-3 rounded-2xl border px-3 py-3"
      style={{ borderColor: KILN_UI.warmBorder, backgroundColor: KILN_UI.warmCard }}
    >
      {rowBody}
    </View>
  );
}
