/**
 * CeremonyOverlay, reusable full-screen celebration moment.
 *
 * Shows a glowing aura + orbiting sparkles + central medallion + staggered text.
 * Identical visual language to the onboarding "Enter Studio" ceremony.
 *
 * Usage:
 *   <CeremonyOverlay
 *     visible={showCeremony}
 *     emoji="✨"
 *     title="First piece logged!"
 *     subtitle="Your studio journey starts here."
 *     tint="#d38e4f"           // optional accent colour (defaults to clay gold)
 *     durationMs={2600}        // optional auto-dismiss after ms (0 = manual only)
 *     onDismiss={() => setShowCeremony(false)}
 *   />
 */
import { Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/components/ui/text';

interface CeremonyOverlayProps {
  visible: boolean;
  emoji: string;
  title: string;
  subtitle?: string;
  /** Accent RGB colour for the glow rings. Default: clay gold. */
  tint?: string;
  /** ms before auto-dismiss. 0 = no auto-dismiss (user must tap). Default: 2600. */
  durationMs?: number;
  onDismiss: () => void;
  /** Optional second line below subtitle */
  footnote?: string;
}

export function CeremonyOverlay({
  visible,
  emoji,
  title,
  subtitle,
  tint = 'rgba(211, 142, 79, 1)',
  durationMs = 2600,
  onDismiss,
  footnote,
}: CeremonyOverlayProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const medallionScale  = useRef(new Animated.Value(0.3)).current;
  const medallionY      = useRef(new Animated.Value(32)).current;
  const glowOpacity     = useRef(new Animated.Value(0)).current;
  const glowScale       = useRef(new Animated.Value(0.4)).current;
  const sparkleRotate   = useRef(new Animated.Value(0)).current;
  const textOpacity     = useRef(new Animated.Value(0)).current;
  const autoDismissRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;

    // Reset all values before playing
    backdropOpacity.setValue(0);
    medallionScale.setValue(0.3);
    medallionY.setValue(32);
    glowOpacity.setValue(0);
    glowScale.setValue(0.4);
    sparkleRotate.setValue(0);
    textOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1, duration: 280, useNativeDriver: true,
      }),
      Animated.spring(medallionScale, {
        toValue: 1, friction: 6, tension: 90, useNativeDriver: true,
      }),
      Animated.timing(medallionY, {
        toValue: 0, duration: 440, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 1, duration: 540, useNativeDriver: true }),
          Animated.timing(glowScale, {
            toValue: 1, duration: 850, easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.timing(sparkleRotate, {
        toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(360),
        Animated.timing(textOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]),
    ]).start();

    if (durationMs > 0) {
      autoDismissRef.current = setTimeout(onDismiss, durationMs);
    }

    return () => {
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  // Parse tint into glow rgba strings (we just swap in the tint text)
  const glowOuter = tint.replace('1)', '0.22)');
  const glowInner = tint.replace('1)', '0.18)');

  const spin = sparkleRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onDismiss}
      style={StyleSheet.absoluteFillObject}
      accessibilityRole="button"
      accessibilityLabel="Dismiss celebration"
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: backdropOpacity,
            backgroundColor: 'rgba(18, 10, 4, 0.93)',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Glow rings + sparkles orbit + medallion */}
        <Animated.View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {/* Outer glow */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: 150,
              backgroundColor: glowOuter,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            }}
          />
          {/* Inner glow */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 190,
              height: 190,
              borderRadius: 95,
              backgroundColor: glowInner,
              opacity: glowOpacity,
              transform: [
                {
                  scale: glowScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.1],
                  }),
                },
              ],
            }}
          />
          {/* Orbiting sparkles */}
          <Animated.View style={{ position: 'absolute', transform: [{ rotate: spin }] }}>
            <Sparkles size={182} color="rgba(255, 214, 163, 0.50)" />
          </Animated.View>
          {/* Medallion */}
          <Animated.View
            style={[
              styles.medallion,
              { transform: [{ scale: medallionScale }, { translateY: medallionY }] },
            ]}
          >
            <Text style={styles.medallionEmoji}>{emoji}</Text>
          </Animated.View>
        </Animated.View>

        {/* Text block */}
        <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: 36, paddingHorizontal: 40 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
          {footnote ? (
            <Text style={styles.footnote}>{footnote}</Text>
          ) : null}
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to continue</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  medallion: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(55, 32, 14, 0.97)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 219, 174, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionEmoji: {
    fontSize: 62,
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 28,
    color: '#f0dcc0',
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#c8a57a',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 21,
  },
  footnote: {
    fontSize: 12,
    color: 'rgba(200, 165, 122, 0.65)',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  tapHint: {
    marginTop: 24,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  tapHintText: {
    fontSize: 11,
    color: 'rgba(240, 220, 192, 0.50)',
    letterSpacing: 0.4,
  },
});
