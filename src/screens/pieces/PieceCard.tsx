import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { ArrowRight, BookOpen, Heart, Layers, MoreHorizontal, PackageCheck } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { LIFECYCLE_ORDER, STAGE_LABEL, isConditionStatus, nextStage } from './constants';
import type { Piece } from './types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ProgressSegments({ stage }: { stage: string }) {
  const isCemetery = stage === 'cemetery';
  const idx = LIFECYCLE_ORDER.indexOf(stage as typeof LIFECYCLE_ORDER[number]);
  return (
    <View style={{ flexDirection: 'row', gap: 2, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 2 }}>
      {LIFECYCLE_ORDER.map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 99,
            backgroundColor: isCemetery
              ? 'hsl(24 20% 78%)'
              : i <= idx
              ? 'hsl(15 50% 50%)'
              : 'hsl(34 25% 84%)',
          }}
        />
      ))}
    </View>
  );
}

interface PieceCardProps {
  piece: Piece;
  onPress?: () => void;
  onAdvance?: () => void;
  onSendToCemetery?: () => void;
  onJournal?: () => void;
  onMore?: () => void;
}

export function PieceCard({ piece, onPress, onAdvance, onSendToCemetery, onJournal, onMore }: PieceCardProps) {
  return (
    <TouchableOpacity className="flex-1" activeOpacity={0.85} onPress={onPress}>
      <Card className="overflow-hidden flex-1">
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
                {STAGE_LABEL[piece.stage] ?? piece.stage}
              </Text>
            </Badge>
          </View>
          {piece.batchSize && piece.batchSize > 1 ? (
            <View className="absolute bottom-2 left-2 flex-row items-center gap-1 bg-foreground/75 rounded-full px-2 py-0.5">
              <Layers size={9} color="hsl(34 35% 92%)" />
              <Text className="text-[9px] font-bold text-background">×{piece.batchSize}</Text>
            </View>
          ) : null}
        </View>

        <View className="p-3 bg-card">
          <ProgressSegments stage={piece.stage} />
          <Text className="font-serif font-bold text-sm text-foreground mt-1" numberOfLines={1}>
            {piece.name}
          </Text>
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">
            {piece.clay}{piece.weight ? ` · ${piece.weight}` : ''}
          </Text>
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
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
            <Text className="text-[10px] font-bold text-muted-foreground">{formatDate(piece.createdAt)}</Text>
            <View className="flex-row items-center gap-0.5">
              {piece.stage === 'cemetery' && (
                <View className="flex-row items-center gap-1 mr-1">
                  <Heart size={10} color="hsl(15 50% 50%)" fill="hsl(15 50% 50%)" />
                  <Text className="text-[10px] font-bold text-primary uppercase tracking-tight">
                    Remembered
                  </Text>
                </View>
              )}
              {onJournal && (
                <TouchableOpacity onPress={onJournal} activeOpacity={0.7} className="p-1.5">
                  <BookOpen size={13} color="hsl(24 20% 55%)" />
                </TouchableOpacity>
              )}
              {onMore && (
                <TouchableOpacity onPress={onMore} activeOpacity={0.7} className="p-1.5">
                  <MoreHorizontal size={14} color="hsl(24 20% 55%)" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {onAdvance && nextStage(piece.stage) && (
            <View className="mt-2 flex-row gap-2">
              <TouchableOpacity
                onPress={onAdvance}
                activeOpacity={0.7}
                className="flex-1 flex-row items-center justify-center gap-1 py-2 rounded-xl bg-primary/10"
              >
                <Text className="text-[11px] font-body-medium text-primary">
                  {STAGE_LABEL[nextStage(piece.stage)!]}
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
