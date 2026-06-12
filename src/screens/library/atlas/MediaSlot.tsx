import { Text } from '@/src/components/ui/text';
import { Image } from 'expo-image';
import { Camera } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

export function MediaSlot({
  label,
  uri,
  onPress,
  large,
}: {
  label: string;
  uri?: string;
  onPress: () => void;
  large?: boolean;
}) {
  const height = large ? 160 : 100;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`overflow-hidden rounded-2xl border border-border bg-muted/30 ${large ? 'w-full' : 'flex-1'}`}
      style={({ pressed }) => ({
        height,
        opacity: pressed ? 0.82 : 1,
      })}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height }} contentFit="cover" />
      ) : (
        <View className="flex-1 items-center justify-center px-3 py-4">
          <Camera size={large ? 24 : 18} color="hsl(24 20% 45%)" />
          <Text className="text-[11px] text-muted-foreground mt-2 text-center">{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function GlazeThumbnail({
  uri,
  colorHex,
  size = 72,
  rounded = 16,
}: {
  uri?: string;
  colorHex: string;
  size?: number;
  rounded?: number;
}) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: rounded }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        backgroundColor: colorHex,
      }}
    />
  );
}
