import { STUDIO_BACKDROP_COLOR } from '@/src/components/potteryStudioArt';
import { StudioOrnamentBackdrop } from '@/src/components/StudioOrnamentBackdrop';
import { CEMETERY_BACKDROP, CEMETERY_MODE_TRANSITION_MS } from '@/src/screens/pieces/cemeteryTheme';
import React from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type StudioTabScreenProps = ViewProps & {
  children: React.ReactNode;
  ornamentOpacity?: number;
  cemeteryMode?: boolean;
};

export function StudioTabScreen({
  children,
  ornamentOpacity = 0.34,
  cemeteryMode = false,
  style,
  ...props
}: StudioTabScreenProps) {
  const mode = useSharedValue(cemeteryMode ? 1 : 0);
  const ornaments = useSharedValue(ornamentOpacity);

  React.useEffect(() => {
    mode.value = withTiming(cemeteryMode ? 1 : 0, {
      duration: CEMETERY_MODE_TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
    ornaments.value = withTiming(ornamentOpacity, {
      duration: CEMETERY_MODE_TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [cemeteryMode, mode, ornamentOpacity, ornaments]);

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      mode.value,
      [0, 1],
      [STUDIO_BACKDROP_COLOR, CEMETERY_BACKDROP],
    ),
  }));

  const ornamentStyle = useAnimatedStyle(() => ({
    opacity: ornaments.value,
  }));

  return (
    <Animated.View className="flex-1" style={[backdropStyle, style]} {...props}>
      <Animated.View style={[StyleSheet.absoluteFillObject, ornamentStyle]} pointerEvents="none">
        <StudioOrnamentBackdrop opacity={1} />
      </Animated.View>
      {children}
    </Animated.View>
  );
}
