import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { ArrowRight, BookOpen, Heart, Layers, MoreHorizontal, PackageCheck } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { LIFECYCLE_ORDER, isConditionStatus } from './constants';
import type { Piece } from './types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ClayBeadProgress({
  stage,
  lifecycleOrder,
}: {
  stage: string;
  lifecycleOrder?: string[];
}) {
  const order = lifecycleOrder && lifecycleOrder.length > 0 ? lifecycleOrder : [...LIFECYCLE_ORDER];
  const isCemetery = stage === 'cemetery';
  const stageIndex = order.indexOf(stage);
  const totalStages = order.length;
  const beadCount = totalStages;
  const currentBeadIndex = stageIndex >= 0 ? stageIndex : 0;

  return (
    <View
      className="mt-2 flex-row items-center gap-1.5 self-start"
      accessibilityLabel={isCemetery ? 'Honored piece progress' : `Stage ${stageIndex + 1} of ${totalStages}`}
    >
      {Array.from({ length: beadCount }, (_, i) => {
        const beadState = isCemetery
          ? 'cemetery'
          : i < currentBeadIndex
          ? 'complete'
          : i === currentBeadIndex
          ? 'current'
          : 'upcoming';

        const beadSize = beadState === 'current' ? 12 : 9;
        const beadColor = beadState === 'complete'
          ? 'hsl(15 55% 56%)'
          : beadState === 'current'
          ? 'hsl(15 50% 50%)'
          : beadState === 'cemetery'
          ? 'hsl(24 22% 74%)'
          : 'hsl(34 28% 82%)';
        const borderColor = beadState === 'current'
          ? 'hsl(34 40% 92%)'
          : beadState === 'upcoming'
          ? 'hsl(34 24% 78%)'
          : beadState === 'cemetery'
          ? 'hsl(24 20% 70%)'
          : 'transparent';

        return (
          <View
            key={i}
            style={{
              width: beadSize,
              height: beadSize,
              borderRadius: 999,
              backgroundColor: beadColor,
              borderWidth: beadState === 'current' || beadState === 'upcoming' || beadState === 'cemetery' ? 1.25 : 0,
              borderColor,
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: beadState === 'current' ? 2.25 : 1.5,
                left: beadState === 'current' ? 2.25 : 1.5,
                width: beadState === 'current' ? 3.5 : 2.5,
                height: beadState === 'current' ? 3.5 : 2.5,
                borderRadius: 999,
                backgroundColor: beadState === 'upcoming'
                  ? 'rgba(255,255,255,0.35)'
                  : 'rgba(255,255,255,0.55)',
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

interface PieceCardProps {
  piece: Piece;
  stageLabel?: string;
  nextStageLabel?: string;
  progressStageOrder?: string[];
  onPress?: () => void;
  onAdvance?: () => void;
  onSendToCemetery?: () => void;
  onJournal?: () => void;
  onMore?: () => void;
}

export function PieceCard({
  piece,
  stageLabel,
  nextStageLabel,
  progressStageOrder,
  onPress,
  onAdvance,
  onSendToCemetery,
  onJournal,
  onMore,
}: PieceCardProps) {
  return (
    <TouchableOpacity className="flex-1" activeOpacity={0.85} onPress={onPress}>
      <Card className="overflow-hidden flex-1">
        <TouchableOpacity
          activeOpacity={onJournal ? 0.85 : 1}
          onPress={onJournal}
          disabled={!onJournal}
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
              <View className="w-full h-full items-center justify-center bg-muted/60">
                <PackageCheck size={32} color="hsl(24 20% 60%)" />
              </View>
            )}
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
            {onJournal && (
              <View className="absolute bottom-2 right-2">
                <View className="bg-black/30 rounded-full p-1.5">
                  <BookOpen size={10} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View className="p-3 bg-card">
          <Text className="font-serif font-bold text-sm text-foreground mt-1" numberOfLines={1}>
            {piece.name}
          </Text>
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">
            {piece.clay}
          </Text>
          <ClayBeadProgress
            stage={piece.stage}
            lifecycleOrder={progressStageOrder}
          />
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
              "{piece.epitaph}"
            </Text>
          ) : null}
          <View className="flex-row items-center justify-between mt-2">
            {piece.stage === 'cemetery' ? (
              <View className="flex-row items-center gap-1">
                <Heart size={10} color="hsl(15 50% 50%)" fill="hsl(15 50% 50%)" />
                <Text className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  Remembered
                </Text>
              </View>
            ) : (
              <Text className="text-[10px] font-bold text-muted-foreground">{formatDate(piece.createdAt)}</Text>
            )}
            {onMore && (
              <TouchableOpacity onPress={onMore} activeOpacity={0.7} className="p-1.5 -mr-1.5">
                <MoreHorizontal size={14} color="hsl(24 20% 55%)" />
              </TouchableOpacity>
            )}
          </View>
          {onAdvance && nextStageLabel && (
            <View className="mt-2 flex-row gap-2">
              <TouchableOpacity
                onPress={onAdvance}
                activeOpacity={0.7}
                className="flex-1 flex-row items-center justify-center gap-1 py-2 rounded-xl bg-primary/10"
              >
                <Text className="text-[11px] font-body-medium text-primary">
                  {nextStageLabel}
                </Text>
                <ArrowRight size={10} color="hsl(15 50% 50%)" />
              </TouchableOpacity>
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
