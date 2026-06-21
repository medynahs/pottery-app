import { LETTERING_BBOX } from '@/src/components/potteryStudioArt';
import { Image } from 'expo-image';
import React from 'react';
import { ImageSourcePropType, StyleSheet, View } from 'react-native';

const CANVAS_WIDTH = 2048;
const CANVAS_HEIGHT = 2732;

type BBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type CanvasCropImageProps = {
  source: ImageSourcePropType;
  size: number;
  bbox: BBox;
};

export function CanvasCropImage({ source, size, bbox }: CanvasCropImageProps) {
  const bboxWidth = bbox.maxX - bbox.minX;
  const bboxHeight = bbox.maxY - bbox.minY;
  const scale = size / Math.max(bboxWidth, bboxHeight);
  const imageWidth = CANVAS_WIDTH * scale;
  const imageHeight = CANVAS_HEIGHT * scale;
  const offsetX = -bbox.minX * scale + (size - bboxWidth * scale) / 2;
  const offsetY = -bbox.minY * scale + (size - bboxHeight * scale) / 2;

  return (
    <View style={[styles.crop, { width: size, height: size }]}>
      <Image
        source={source}
        style={{
          height: imageHeight,
          left: offsetX,
          position: 'absolute',
          top: offsetY,
          width: imageWidth,
        }}
        contentFit="fill"
      />
    </View>
  );
}

export const SPLASH_LETTERING_SIZE = 370;

type SplashLetteringProps = {
  size?: number;
};

export function SplashLettering({ size = SPLASH_LETTERING_SIZE }: SplashLetteringProps) {
  return (
    <CanvasCropImage
      source={require('../../assets/images/lettering.png')}
      size={size}
      bbox={LETTERING_BBOX}
    />
  );
}

const styles = StyleSheet.create({
  crop: {
    overflow: 'hidden',
  },
});
