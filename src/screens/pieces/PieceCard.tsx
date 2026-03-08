import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Heart, PackageCheck } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { STAGE_LABEL } from './constants';
import type { Piece } from './types';

interface PieceCardProps {
  piece: Piece;
  onPress?: () => void;
}

export function PieceCard({ piece, onPress }: PieceCardProps) {
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
        </View>

        <View className="p-3 bg-card">
          <Text className="font-serif font-bold text-sm text-foreground" numberOfLines={1}>
            {piece.name}
          </Text>
          <Text className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">
            {piece.clay}
          </Text>
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
            <Text className="text-[10px] font-bold text-muted-foreground">{piece.date}</Text>
            {piece.stage === 'cemetery' && (
              <View className="flex-row items-center gap-1">
                <Heart size={10} color="hsl(15 50% 50%)" fill="hsl(15 50% 50%)" />
                <Text className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  Remembered
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
