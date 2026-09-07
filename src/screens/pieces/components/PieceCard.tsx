import { PiecePlaceholderArt } from '@/src/components/PiecePlaceholderArt';
import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { BookOpen, Check, Heart, Layers, MoreHorizontal } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import type { Piece } from '../../../types/pieces';
import { parseNumericInput } from '../../../types/pricing';
import { isConditionStatus } from '../utils/constants';
import { AdvanceStageButton } from './AdvanceStageButton';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface PieceCardProps {
  piece: Piece;
  stageLabel?: string;
  nextStageLabel?: string;
  progressStageOrder?: string[];
  compact?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  onPress?: () => void;
  onAdvance?: () => void;
  onSendToCemetery?: () => void;
  onJournal?: () => void;
  onMore?: () => void;
  onLongPress?: () => void;
  onToggleSelect?: () => void;
}

export function PieceCard({
  piece,
  stageLabel,
  nextStageLabel,
  progressStageOrder,
  compact = false,
  selectionMode = false,
  selected = false,
  onPress,
  onAdvance,
  onSendToCemetery,
  onJournal,
  onMore,
  onLongPress,
  onToggleSelect,
}: PieceCardProps) {
  const activeSaleMode = piece.salePriceMode ?? 'retail';
  const activePrice = activeSaleMode === 'wholesale'
    ? piece.wholesalePriceTarget ?? piece.wholesalePrice ?? parseNumericInput(piece.price)
    : piece.retailPriceTarget ?? parseNumericInput(piece.price) ?? piece.suggestedPrice;

  const handleCardPress = () => {
    if (selectionMode) {
      onToggleSelect?.();
      return;
    }
    onPress?.();
  };

  const handleLongPress = () => {
    if (selectionMode) {
      onToggleSelect?.();
      return;
    }
    onLongPress?.();
  };

  return (
    <TouchableOpacity
      className="flex-1"
      activeOpacity={0.85}
      onPress={handleCardPress}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <Card className={`overflow-hidden flex-1 ${selected ? 'border-2 border-primary' : ''}`}>
        <TouchableOpacity
          activeOpacity={selectionMode ? 1 : onJournal ? 0.85 : 1}
          onPress={selectionMode ? handleCardPress : onJournal}
          onLongPress={handleLongPress}
          delayLongPress={400}
          disabled={!onJournal && !selectionMode && !onLongPress}
        >
          <View className="aspect-square bg-muted/40 relative">
            {(piece.photo || piece.imgUrl) ? (
              <Image
                source={{ uri: piece.photo ?? piece.imgUrl }}
                className="w-full h-full"
                style={piece.stage === 'cemetery' ? { opacity: 0.5 } : undefined}
                resizeMode="cover"
              />
            ) : (
              <PiecePlaceholderArt seed={String(piece.id)} />
            )}
            {selectionMode ? (
              <View className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 items-center justify-center ${
                selected ? 'bg-primary border-primary' : 'bg-card/90 border-border'
              }`}>
                {selected ? <Check size={13} color="hsl(34 35% 92%)" strokeWidth={3} /> : null}
              </View>
            ) : null}
            <View className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-card/90 border-0 rounded-full px-2.5 py-1">
                <Text className="text-[10px] font-bold text-foreground">
                  {stageLabel ?? piece.stage}
                </Text>
              </Badge>
            </View>
            {piece.batchSize && piece.batchSize > 1 ? (
              <View className="absolute bottom-2 left-2 flex-row items-center gap-1 bg-foreground/75 rounded-full px-2 py-0.5">
                <Layers size={9} color="hsl(34 35% 92%)" />
                <Text className="text-[9px] font-bold text-background">×{piece.batchSize}</Text>
              </View>
            ) : null}
            {onJournal && !selectionMode && (
              <View className="absolute bottom-2 right-2">
                <View className="bg-black/30 rounded-full p-1.5">
                  <BookOpen size={10} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View className={`bg-card ${compact ? 'p-2.5' : 'p-3'}`}>
          <Text className="font-serif font-bold text-sm text-foreground mt-1" numberOfLines={1}>
            {piece.name}
          </Text>
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">
            {piece.clay}
          </Text>
          {!compact && (piece.totalCost != null || piece.firingFee != null) ? (
            <Text className="text-[10px] font-medium text-muted-foreground mt-0.5" numberOfLines={1}>
              {piece.totalCost != null ? `Cost ${piece.totalCost.toFixed(2)}` : 'Cost -'}
              {piece.firingFeeQuoteRequired
                ? ' · Firing N.O.T.K'
                : piece.firingFee != null
                  ? ` · Firing ${piece.firingFee.toFixed(2)}`
                  : ''}
            </Text>
          ) : null}
          {!compact && piece.stage === 'finished' && activePrice != null ? (
            <Text className="text-[10px] font-medium text-primary mt-0.5" numberOfLines={1}>
              {activeSaleMode === 'wholesale' ? 'Wholesale' : 'Retail'} {activePrice.toFixed(2)}
            </Text>
          ) : null}

          {piece.status ? (
            <View className={`self-start mt-1.5 px-2 py-0.5 rounded-full ${
              isConditionStatus(piece.status)
                ? 'bg-destructive/10'
                : 'bg-secondary/15'
            }`}>
              <Text className={`text-[10px] font-body-medium ${
                isConditionStatus(piece.status) ? 'text-destructive' : 'text-secondary'
              }`}>
                {piece.status}
              </Text>
            </View>
          ) : null}
          {piece.stage === 'cemetery' && piece.epitaph ? (
            <Text className="text-[11px] font-display italic text-muted-foreground mt-2" numberOfLines={2}>
              &ldquo;{piece.epitaph}&rdquo;
            </Text>
          ) : null}
          <View className="flex-row items-center justify-between mt-2">
            {piece.stage === 'cemetery' ? (
              <View className="flex-row items-center gap-1">
                <Heart size={10} color="hsl(39 57% 51%)" fill="hsl(39 57% 51%)" />
                <Text className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  Remembered
                </Text>
              </View>
            ) : (
              <Text className="text-[10px] font-bold text-muted-foreground">{formatDate(piece.createdAt)}</Text>
            )}
            {onMore && !selectionMode && (
              <TouchableOpacity onPress={onMore} activeOpacity={0.7} className="p-1.5 -mr-1.5">
                <MoreHorizontal size={14} color="hsl(24 20% 55%)" />
              </TouchableOpacity>
            )}
          </View>
          {!selectionMode && onAdvance && nextStageLabel && (
            <View className="mt-2 flex-row gap-2">
              <AdvanceStageButton stageLabel={nextStageLabel} onPress={onAdvance} />
              {onSendToCemetery && (
                <TouchableOpacity
                  onPress={onSendToCemetery}
                  activeOpacity={0.7}
                  className="w-9 items-center justify-center rounded-xl bg-muted/60"
                >
                  <Text className="text-sm">🪦</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
