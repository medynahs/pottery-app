import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';

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
