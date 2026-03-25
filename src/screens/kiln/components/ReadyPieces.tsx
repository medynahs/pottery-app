import { Text } from '@/src/components/ui/text';
import type { Piece } from '@/src/screens/pieces/types';
import { Layers } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

interface ReadyFilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}

export function ReadyFilterChip({ label, count, active, onPress }: ReadyFilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl border ${active ? 'bg-card border-primary' : 'bg-background border-border'}`}
    >
      <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </Text>
      <View className={`px-1.5 py-0.5 rounded-full ${active ? 'bg-primary/15' : 'bg-muted'}`}>
        <Text className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface ReadySortChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function ReadySortChip({ label, active, onPress }: ReadySortChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-2.5 py-1 rounded-lg border ${active ? 'bg-card border-primary' : 'bg-background border-border'}`}
    >
      <Text className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface ReadyPieceRowProps {
  piece: Piece;
  waitingDays: number;
  onPreviewPhoto: () => void;
  onOpenInPieces: () => void;
}

export function ReadyPieceRow({ piece, waitingDays, onPreviewPhoto, onOpenInPieces }: ReadyPieceRowProps) {
  const imageUri = piece.photo ?? piece.imgUrl;
  const primaryDetail = piece.location ?? 'No location';

  return (
    <View className="rounded-xl border border-border bg-background px-2.5 py-2">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onPreviewPhoto}
          disabled={!imageUri}
          activeOpacity={0.8}
          className="w-12 h-12 rounded-lg overflow-hidden bg-muted/40 items-center justify-center mr-2.5"
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Layers size={14} color="hsl(24 12% 48%)" />
          )}
        </TouchableOpacity>

        <View className="flex-1 pr-2">
          <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
            {piece.name}
          </Text>
          <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
            {piece.clay} · {primaryDetail}
          </Text>
          <Text className="text-[10px] text-primary mt-0.5" numberOfLines={1}>
            Waiting {waitingDays} day{waitingDays !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onOpenInPieces}
          className="px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
        >
          <Text className="text-[11px] font-semibold text-primary">View Piece</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
