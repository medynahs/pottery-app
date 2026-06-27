import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path, Rect } from 'react-native-svg';

export const CEMETERY_SKY_GRADIENT = ['#1A1210', '#2A1C16', '#3D2B22', '#4A3828'] as const;

const TUFT_WIDTHS = [12, 17, 10, 19, 14, 16, 11, 18, 13, 15, 10, 20, 12, 17];
const STAR_FIELDS = [
  { left: '8%', top: 14, size: 2, baseOpacity: 0.55, delay: 0 },
  { left: '22%', top: 22, size: 1.5, baseOpacity: 0.35, delay: 400 },
  { left: '38%', top: 11, size: 2, baseOpacity: 0.45, delay: 800 },
  { left: '54%', top: 18, size: 1.5, baseOpacity: 0.3, delay: 200 },
  { left: '71%', top: 12, size: 2, baseOpacity: 0.5, delay: 600 },
  { left: '86%', top: 20, size: 1.5, baseOpacity: 0.38, delay: 1000 },
  { left: '92%', top: 8, size: 2, baseOpacity: 0.42, delay: 300 },
] as const;
const PEBBLES = [
  { left: '6%', bottom: 28, size: 5 },
  { left: '18%', bottom: 18, size: 4 },
  { left: '44%', bottom: 22, size: 6 },
  { left: '63%', bottom: 16, size: 4 },
  { left: '78%', bottom: 24, size: 5 },
  { left: '90%', bottom: 20, size: 4 },
] as const;
const WILDFLOWERS = [
  { left: '12%', bottom: 52, emoji: '✿', opacity: 0.45 },
  { left: '31%', bottom: 44, emoji: '🌾', opacity: 0.35 },
  { left: '58%', bottom: 48, emoji: '✿', opacity: 0.4 },
  { left: '82%', bottom: 40, emoji: '🪻', opacity: 0.38 },
] as const;
const FIREFLIES = [
  { left: '16%', bottom: 72, delay: 0 },
  { left: '48%', bottom: 96, delay: 700 },
  { left: '71%', bottom: 58, delay: 1400 },
  { left: '88%', bottom: 84, delay: 2100 },
] as const;

function TwinklingStar({
  left,
  top,
  size,
  baseOpacity,
  delay,
}: {
  left: DimensionValue;
  top: number;
  size: number;
  baseOpacity: number;
  delay: number;
}) {
  const twinkle = useSharedValue(baseOpacity);

  React.useEffect(() => {
    twinkle.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(Math.min(baseOpacity * 2.2, 1), {
            duration: 1400 + delay * 0.5,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(baseOpacity * 0.35, {
            duration: 1400 + delay * 0.5,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
  }, [baseOpacity, delay, twinkle]);

  const style = useAnimatedStyle(() => ({
    opacity: twinkle.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        { left, top, width: size, height: size, borderRadius: size },
        style,
      ]}
    />
  );
}

function GlowingMoon() {
  const glow = useSharedValue(0.16);

  React.useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.28, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.14, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [glow]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.35 }],
  }));

  const moonStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + glow.value * 0.8,
  }));

  return (
    <>
      <Animated.View style={[styles.moonHalo, haloStyle]} />
      <Animated.View style={[styles.moon, moonStyle]} />
    </>
  );
}

function AnimatedGrassTuftRow({ variant }: { variant: 'ridge' | 'floor' }) {
  const sway = useSharedValue(0);
  const phase = variant === 'ridge' ? 0 : 900;

  React.useEffect(() => {
    sway.value = withDelay(
      phase,
      withRepeat(
        withSequence(
          withTiming(1.8, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
          withTiming(-1.8, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [phase, sway]);

  const swayStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sway.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.tuftRow,
        variant === 'ridge' ? styles.tuftRidge : styles.tuftFloor,
        swayStyle,
      ]}
    >
      {TUFT_WIDTHS.map((width, index) => (
        <View
          key={`${variant}-${index}`}
          style={[
            styles.tuft,
            {
              width,
              height: variant === 'ridge' ? 6 + (index % 3) * 2 : 4 + (index % 2) * 2,
              backgroundColor:
                index % 3 === 0
                  ? 'rgba(170, 200, 130, 0.78)'
                  : 'rgba(186, 214, 148, 0.68)',
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

function Firefly({ left, bottom, delay }: { left: DimensionValue; bottom: number; delay: number }) {
  const opacity = useSharedValue(0.15);
  const driftX = useSharedValue(0);
  const driftY = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    driftX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(8, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
          withTiming(-6, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    driftY.value = withDelay(
      delay + 400,
      withRepeat(
        withSequence(
          withTiming(-5, { duration: 4600, easing: Easing.inOut(Easing.sin) }),
          withTiming(4, { duration: 4600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, driftX, driftY, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: driftX.value }, { translateY: driftY.value }],
  }));

  return (
    <Animated.View style={[styles.firefly, { left, bottom }, style]}>
      <View style={styles.fireflyCore} />
    </Animated.View>
  );
}

function MeadowGate() {
  const barXs = [40, 72, 104, 136, 168, 200, 232, 264];

  return (
    <View style={styles.gateWrap} pointerEvents="none">
      <Svg width="100%" height={30} viewBox="0 0 320 30" preserveAspectRatio="none">
        <Rect x="6" y="3" width="5" height="24" fill="rgba(38, 28, 20, 0.9)" rx="1.5" />
        <Rect x="309" y="3" width="5" height="24" fill="rgba(38, 28, 20, 0.9)" rx="1.5" />
        <Path
          d="M 11 7 Q 160 26 309 7"
          stroke="rgba(52, 40, 30, 0.8)"
          strokeWidth="2.2"
          fill="none"
        />
        <Path
          d="M 11 13 Q 160 30 309 13"
          stroke="rgba(52, 40, 30, 0.55)"
          strokeWidth="1.5"
          fill="none"
        />
        {barXs.map((x) => (
          <Line
            key={x}
            x1={x}
            y1="9"
            x2={x}
            y2="25"
            stroke="rgba(52, 40, 30, 0.42)"
            strokeWidth="1.2"
          />
        ))}
      </Svg>
    </View>
  );
}

function ShiftingMist() {
  const mist = useSharedValue(0.35);

  React.useEffect(() => {
    mist.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [mist]);

  const style = useAnimatedStyle(() => ({
    opacity: mist.value,
  }));

  return (
    <Animated.View style={[styles.mist, style]} pointerEvents="none">
      <LinearGradient
        colors={['rgba(210, 220, 200, 0)', 'rgba(210, 220, 200, 0.22)', 'rgba(210, 220, 200, 0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

function GardenDecor() {
  return (
    <>
      {PEBBLES.map((pebble, index) => (
        <View
          key={`pebble-${index}`}
          style={[
            styles.pebble,
            {
              left: pebble.left,
              bottom: pebble.bottom,
              width: pebble.size,
              height: pebble.size * 0.75,
            },
          ]}
        />
      ))}
      {WILDFLOWERS.map((flower, index) => (
        <Text
          key={`flower-${index}`}
          style={[
            styles.wildflower,
            { left: flower.left, bottom: flower.bottom, opacity: flower.opacity },
          ]}
        >
          {flower.emoji}
        </Text>
      ))}
      {FIREFLIES.map((fly, index) => (
        <Firefly key={`fly-${index}`} {...fly} />
      ))}
    </>
  );
}

function PulsingEmptyMoon() {
  const pulse = useSharedValue(0.7);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.55, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.96 + pulse.value * 0.06 }],
  }));

  return (
    <Animated.Text style={[styles.emptyMoon, style]}>🌙</Animated.Text>
  );
}

export function CemeteryGardenEmpty() {
  return (
    <View style={styles.emptyPlot}>
      <PulsingEmptyMoon />
      <Text className="text-sm text-center leading-6" style={styles.emptyTitle}>
        The garden is quiet
      </Text>
      <Text className="text-xs text-center leading-5" style={styles.emptyBody}>
        When a piece doesn't survive the kiln, send it here to record its epitaph.
      </Text>
    </View>
  );
}

interface CemeteryGardenViewProps {
  count: number;
  children: React.ReactNode;
}

export function CemeteryGardenView({ count, children }: CemeteryGardenViewProps) {
  return (
    <View style={styles.garden}>
      <LinearGradient
        colors={[...CEMETERY_SKY_GRADIENT]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.sky}
      >
        {STAR_FIELDS.map((star, index) => (
          <TwinklingStar key={`star-${index}`} {...star} />
        ))}

        <GlowingMoon />

        <View style={styles.skyContent}>
          <View style={styles.eyebrowRow}>
            <Sparkles size={13} color="rgba(255, 214, 163, 0.75)" />
            <Text style={styles.eyebrow}>Rite of Passage</Text>
          </View>

          <Text style={styles.title}>The Kiln Gods' Garden</Text>
          <Text style={styles.quote}>
            Every crack is a lesson, every explosion a story. We honor the pieces that didn't make it.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{count}</Text>
              <Text style={styles.statLabel}>Honored</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>🪦</Text>
              <Text style={styles.statLabel}>At rest</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.horizonWrap}>
        <LinearGradient
          colors={['#4A3828', '#5A7048', '#557044', '#466038']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.horizon}
        />
        <ShiftingMist />
      </View>

      <LinearGradient
        colors={['#628050', '#557044', '#466038', '#354A2C']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.meadow}
      >
        <MeadowGate />
        <AnimatedGrassTuftRow variant="ridge" />
        <View style={styles.plotArea}>
          <GardenDecor />
          {children}
        </View>
        <AnimatedGrassTuftRow variant="floor" />
        <View style={styles.pathEdge} pointerEvents="none" />
      </LinearGradient>
    </View>
  );
}

/** Headstone width that fits multiple plots across the pieces tab content area. */
export function useCemeteryHeadstoneWidth(screenWidth: number, columns = 2) {
  return React.useMemo(() => {
    const horizontalPadding = 48;
    const columnGap = 10;
    const available = screenWidth - horizontalPadding;
    const columnWidth = (available - columnGap * (columns - 1)) / columns;
    return Math.floor(Math.min(176, columnWidth));
  }, [columns, screenWidth]);
}

const styles = StyleSheet.create({
  garden: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(42, 32, 24, 0.55)',
    shadowColor: '#1A1008',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  sky: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    minHeight: 168,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 244, 228, 0.9)',
  },
  moonHalo: {
    position: 'absolute',
    top: 8,
    right: 14,
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 220, 160, 0.35)',
  },
  moon: {
    position: 'absolute',
    top: 16,
    right: 22,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 232, 196, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 232, 196, 0.32)',
  },
  skyContent: {
    paddingRight: 48,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255, 244, 228, 0.58)',
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 24,
    lineHeight: 30,
    color: '#FFF4E4',
    marginBottom: 8,
  },
  quote: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255, 244, 228, 0.72)',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 20,
    lineHeight: 24,
    color: '#FFD39B',
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(255, 244, 228, 0.5)',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 244, 228, 0.16)',
  },
  horizonWrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  horizon: {
    height: 18,
  },
  mist: {
    ...StyleSheet.absoluteFillObject,
    top: -4,
    bottom: -4,
  },
  meadow: {
    paddingBottom: 10,
    position: 'relative',
  },
  gateWrap: {
    marginTop: -2,
    marginBottom: 2,
    paddingHorizontal: 4,
    opacity: 0.92,
  },
  tuftRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    gap: 3,
  },
  tuftRidge: {
    paddingTop: 8,
    paddingBottom: 2,
    opacity: 0.9,
  },
  tuftFloor: {
    paddingTop: 4,
    paddingBottom: 6,
    opacity: 0.7,
  },
  tuft: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  plotArea: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 10,
    minHeight: 120,
    position: 'relative',
  },
  pebble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(72, 58, 46, 0.42)',
  },
  wildflower: {
    position: 'absolute',
    fontSize: 11,
  },
  firefly: {
    position: 'absolute',
    width: 6,
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireflyCore: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 236, 160, 0.95)',
    shadowColor: '#FFE8A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  pathEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: 'rgba(52, 40, 30, 0.22)',
  },
  emptyPlot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  emptyMoon: {
    fontSize: 28,
    marginBottom: 10,
  },
  emptyTitle: {
    color: 'rgba(232, 244, 214, 0.92)',
    fontFamily: 'Fraunces_700Bold',
    marginBottom: 6,
  },
  emptyBody: {
    color: 'rgba(214, 228, 196, 0.72)',
    maxWidth: 240,
  },
});
