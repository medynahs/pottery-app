import { Text } from '@/src/components/ui/text';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export type GlazePhotoTileProps = {
  width: number;
  name: string;
  coneLabel: string;
  finishLabel: string;
  previewUri?: string;
  colorHex: string;
  matchesCone?: boolean;
  favorite?: boolean;
  onPress: () => void;
};

/** Masonry photo card — shared by Discover and My Atlas grids. */
export function GlazePhotoTile({
  width,
  name,
  coneLabel,
  finishLabel,
  previewUri,
  colorHex,
  matchesCone = false,
  favorite = false,
  onPress,
}: GlazePhotoTileProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{ width }}
      className="mb-3 rounded-2xl overflow-hidden border border-border bg-card"
    >
      <View style={{ width, height: width * 1.25 }} className="relative bg-muted">
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: colorHex }} />
        )}

        <View className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/55">
          <Text className="text-[10px] font-bold text-white">{coneLabel}</Text>
        </View>

        {matchesCone ? (
          <View className="absolute top-2 right-2 px-2 py-1 rounded-full bg-green-600/90">
            <Text className="text-[9px] font-bold text-white">Your cone</Text>
          </View>
        ) : favorite ? (
          <View className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/45 items-center justify-center">
            <Star size={13} color="hsl(38 80% 55%)" fill="hsl(38 80% 55%)" />
          </View>
        ) : null}

        <View
          className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-8"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <Text
            className="text-sm text-white font-semibold"
            numberOfLines={2}
            style={{ fontFamily: 'Fraunces_600SemiBold' }}
          >
            {name}
          </Text>
          <Text className="text-[10px] text-white/80 mt-0.5">{finishLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
