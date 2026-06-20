import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ImageSourcePropType,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

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

const LETTERING_BBOX = { minX: 716, minY: 630, maxX: 1330, maxY: 1749 };
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

type OrnamentPlacement = {
  bbox: BBox;
  bottom?: number;
  enterX: number;
  enterY: number;
  floatAmplitude: number;
  key: string;
  left?: number;
  right?: number;
  sizeRatio: number;
  source: ImageSourcePropType;
  top?: number;
};

const BACKGROUND_ORNAMENTS: OrnamentPlacement[] = [
  {
    key: 'rib',
    source: require('../../assets/images/ribtool.png'),
    sizeRatio: 0.17,
    top: 0.055,
    left: 0.035,
    bbox: { minX: 382, minY: 180, maxX: 712, maxY: 528 },
    enterX: -24,
    enterY: -18,
    floatAmplitude: 5,
  },
  {
    key: 'kiln',
    source: require('../../assets/images/kilnsplash.png'),
    sizeRatio: 0.17,
    top: 0.05,
    right: 0.03,
    bbox: { minX: 1580, minY: 177, maxX: 1912, maxY: 596 },
    enterX: 22,
    enterY: -16,
    floatAmplitude: 4,
  },
  {
    key: 'trim2',
    source: require('../../assets/images/trimmingtool2.png'),
    sizeRatio: 0.15,
    top: 0.24,
    right: 0.02,
    bbox: { minX: 1664, minY: 976, maxX: 1843, maxY: 1405 },
    enterX: 28,
    enterY: 0,
    floatAmplitude: 6,
  },
  {
    key: 'wood',
    source: require('../../assets/images/woodtool.png'),
    sizeRatio: 0.14,
    top: 0.4,
    left: 0.02,
    bbox: { minX: 272, minY: 954, maxX: 417, maxY: 1363 },
    enterX: -26,
    enterY: 0,
    floatAmplitude: 5,
  },
  {
    key: 'turntable',
    source: require('../../assets/images/turntablewithvase.png'),
    sizeRatio: 0.17,
    bottom: 0.1,
    right: 0.04,
    bbox: { minX: 1414, minY: 1758, maxX: 1743, maxY: 2141 },
    enterX: 18,
    enterY: 22,
    floatAmplitude: 5,
  },
  {
    key: 'trim',
    source: require('../../assets/images/trimmingtool.png'),
    sizeRatio: 0.15,
    bottom: 0.075,
    left: 0.42,
    bbox: { minX: 972, minY: 1902, maxX: 1087, maxY: 2342 },
    enterX: 0,
    enterY: 26,
    floatAmplitude: 7,
  },
  {
    key: 'whimsy',
    source: require('../../assets/images/whimsyvase.png'),
    sizeRatio: 0.16,
    bottom: 0.115,
    left: 0.035,
    bbox: { minX: 258, minY: 1717, maxX: 534, maxY: 2159 },
    enterX: -20,
    enterY: 24,
    floatAmplitude: 6,
  },
];

type AnimatedOrnamentProps = {
  height: number;
  index: number;
  ornament: OrnamentPlacement;
  width: number;
};

function AnimatedOrnament({ ornament, index, width, height }: AnimatedOrnamentProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.55)).current;
  const translateX = useRef(new Animated.Value(ornament.enterX)).current;
  const translateY = useRef(new Animated.Value(ornament.enterY)).current;
  const float = useRef(new Animated.Value(0)).current;

  const iconSize = Math.round(
    Math.min(width, height) * ornament.sizeRatio
  );

  useEffect(() => {
    const enterDelay = 240 + index * 100;
    let floatLoop: Animated.CompositeAnimation | undefined;

    const enter = Animated.sequence([
      Animated.delay(enterDelay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.88,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    enter.start(({ finished }) => {
      if (!finished) return;

      floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            toValue: 1,
            duration: 2400 + index * 120,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: 0,
            duration: 2400 + index * 120,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      floatLoop.start();
    });

    return () => {
      enter.stop();
      floatLoop?.stop();
    };
  }, [float, index, opacity, scale, translateX, translateY]);

  const floatOffset = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ornament.floatAmplitude],
  });

  const positionStyle = {
    ...(ornament.top != null ? { top: height * ornament.top } : {}),
    ...(ornament.bottom != null ? { bottom: height * ornament.bottom } : {}),
    ...(ornament.left != null ? { left: width * ornament.left } : {}),
    ...(ornament.right != null ? { right: width * ornament.right } : {}),
  };

  return (
    <Animated.View
      style={[
        styles.ornament,
        positionStyle,
        {
          opacity,
          transform: [
            { translateX },
            { translateY: Animated.add(translateY, floatOffset) },
            { scale },
          ],
        },
      ]}
    >
      <CanvasCropImage
        source={ornament.source}
        size={iconSize}
        bbox={ornament.bbox}
      />
    </Animated.View>
  );
}

export function SplashBackgroundOrnaments() {
  const { width, height } = useWindowDimensions();

  return (
    <View pointerEvents="none" style={styles.ornamentLayer}>
      {BACKGROUND_ORNAMENTS.map((ornament, index) => (
        <AnimatedOrnament
          key={ornament.key}
          ornament={ornament}
          index={index}
          width={width}
          height={height}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  crop: {
    overflow: 'hidden',
  },
  ornament: {
    position: 'absolute',
  },
  ornamentLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});
