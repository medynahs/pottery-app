import { CEMETERY_MODE_TRANSITION_MS } from '@/src/screens/pieces/cemeteryTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const DRIFTING_MOTES = [
  { left: '12%', top: '18%', delay: 0, size: 3 },
  { left: '68%', top: '28%', delay: 1200, size: 2.5 },
  { left: '44%', top: '52%', delay: 600, size: 2 },
  { left: '82%', top: '62%', delay: 1800, size: 2.5 },
  { left: '26%', top: '72%', delay: 900, size: 2 },
];

function DriftingMote({
  left,
  top,
  delay,
  size,
}: {
  left: string;
  top: string;
  delay: number;
  size: number;
}) {
  const opacity = useSharedValue(0);
  const drift = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.12, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(6, { duration: 4800, easing: Easing.inOut(Easing.sin) }),
          withTiming(-4, { duration: 4800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, drift, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: drift.value }, { translateY: drift.value * 0.4 }],
  }));

  return (
    <Animated.View
      style={[
        styles.mote,
        { left, top, width: size, height: size, borderRadius: size },
        style,
      ]}
    />
  );
}

interface CemeteryScrollAtmosphereProps {
  active: boolean;
}

export function CemeteryScrollAtmosphere({ active }: CemeteryScrollAtmosphereProps) {
  const veil = useSharedValue(0);

  React.useEffect(() => {
    veil.value = withTiming(active ? 1 : 0, {
      duration: CEMETERY_MODE_TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, veil]);

  const veilStyle = useAnimatedStyle(() => ({
    opacity: veil.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, veilStyle]} pointerEvents="none">
      <LinearGradient
        colors={[
          'rgba(20, 14, 11, 0.96)',
          'rgba(32, 22, 17, 0.82)',
          'rgba(42, 32, 24, 0.48)',
          'rgba(52, 68, 42, 0.18)',
          'transparent',
        ]}
        locations={[0, 0.22, 0.45, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(26, 18, 14, 0.08)', 'rgba(18, 12, 9, 0.22)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.vignette]}
      />
      {active
        ? DRIFTING_MOTES.map((mote, index) => (
            <DriftingMote key={`mote-${index}`} {...mote} />
          ))
        : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  vignette: {
    top: '30%',
  },
  mote: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 232, 170, 0.85)',
    shadowColor: '#FFE8B0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
