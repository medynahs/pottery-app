import {
  POTTERY_STUDIO_ORNAMENTS,
  type PotteryArtOrnament,
  STUDIO_BACKDROP_COLOR,
} from '@/src/components/potteryStudioArt';
import { CanvasCropImage } from '@/src/components/SplashPotteryRing';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

type StudioOrnamentBackdropProps = {
  animated?: boolean;
  opacity?: number;
};

function StaticOrnament({
  ornament,
  width,
  height,
  opacity,
}: {
  ornament: PotteryArtOrnament;
  width: number;
  height: number;
  opacity: number;
}) {
  const iconSize = Math.round(Math.min(width, height) * ornament.sizeRatio);

  const positionStyle = {
    ...(ornament.top != null ? { top: height * ornament.top } : {}),
    ...(ornament.bottom != null ? { bottom: height * ornament.bottom } : {}),
    ...(ornament.left != null ? { left: width * ornament.left } : {}),
    ...(ornament.right != null ? { right: width * ornament.right } : {}),
  };

  return (
    <View style={[styles.ornament, positionStyle, { opacity }]}>
      <CanvasCropImage source={ornament.source} size={iconSize} bbox={ornament.bbox} />
    </View>
  );
}

function AnimatedOrnament({
  ornament,
  index,
  width,
  height,
  opacity,
}: {
  ornament: PotteryArtOrnament;
  index: number;
  width: number;
  height: number;
  opacity: number;
}) {
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.55)).current;
  const translateX = useRef(new Animated.Value(ornament.enterX)).current;
  const translateY = useRef(new Animated.Value(ornament.enterY)).current;
  const float = useRef(new Animated.Value(0)).current;

  const iconSize = Math.round(Math.min(width, height) * ornament.sizeRatio);

  useEffect(() => {
    const enterDelay = 240 + index * 100;
    let floatLoop: Animated.CompositeAnimation | undefined;

    const enter = Animated.sequence([
      Animated.delay(enterDelay),
      Animated.parallel([
        Animated.timing(enterOpacity, {
          toValue: opacity,
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
  }, [enterOpacity, float, index, opacity, scale, translateX, translateY]);

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
          opacity: enterOpacity,
          transform: [
            { translateX },
            { translateY: Animated.add(translateY, floatOffset) },
            { scale },
          ],
        },
      ]}
    >
      <CanvasCropImage source={ornament.source} size={iconSize} bbox={ornament.bbox} />
    </Animated.View>
  );
}

export function StudioOrnamentBackdrop({
  animated = false,
  opacity = 0.88,
}: StudioOrnamentBackdropProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View pointerEvents="none" style={styles.layer}>
      {POTTERY_STUDIO_ORNAMENTS.map((ornament, index) =>
        animated ? (
          <AnimatedOrnament
            key={ornament.key}
            ornament={ornament}
            index={index}
            width={width}
            height={height}
            opacity={opacity}
          />
        ) : (
          <StaticOrnament
            key={ornament.key}
            ornament={ornament}
            width={width}
            height={height}
            opacity={opacity}
          />
        )
      )}
    </View>
  );
}

export { STUDIO_BACKDROP_COLOR };

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: STUDIO_BACKDROP_COLOR,
  },
  ornament: {
    position: 'absolute',
  },
});
