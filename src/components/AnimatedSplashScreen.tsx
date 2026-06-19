import { SplashPotteryRing } from '@/src/components/SplashPotteryRing';
import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type AnimatedSplashScreenProps = {
  onFinish: () => void;
};

const SPLASH_HOLD_MS = 2600;
const LOGO_STAGE_SIZE = 320;

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const logoTranslateY = useRef(new Animated.Value(18)).current;
  const ornamentOpacity = useRef(new Animated.Value(0)).current;
  const ornamentScale = useRef(new Animated.Value(0.88)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ornamentOpacity, {
          toValue: 1,
          duration: 720,
          delay: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ornamentScale, {
          toValue: 1,
          duration: 900,
          delay: 120,
          easing: Easing.out(Easing.back(1.05)),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(SPLASH_HOLD_MS),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 520,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => animation.stop();
  }, [
    containerOpacity,
    glowOpacity,
    glowScale,
    logoOpacity,
    logoScale,
    logoTranslateY,
    onFinish,
    ornamentOpacity,
    ornamentScale,
    titleOpacity,
    titleTranslateY,
  ]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { opacity: containerOpacity }]}
    >
      <View style={styles.logoWrap}>
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ornamentLayer,
            {
              opacity: ornamentOpacity,
              transform: [{ scale: ornamentScale }],
            },
          ]}
        >
          <SplashPotteryRing size={LOGO_STAGE_SIZE} />
        </Animated.View>
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [
              { translateY: logoTranslateY },
              { scale: logoScale },
            ],
          }}
        >
          <Image
            source={require('../../assets/PotteryNookLogo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>
      </View>
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        Pottery Nook
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#FBF0E0',
    justifyContent: 'center',
    zIndex: 999,
  },
  logoWrap: {
    alignItems: 'center',
    height: LOGO_STAGE_SIZE,
    justifyContent: 'center',
    width: LOGO_STAGE_SIZE,
  },
  ornamentLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    backgroundColor: '#F1D7B4',
    borderRadius: 140,
    height: 240,
    position: 'absolute',
    width: 240,
  },
  logo: {
    height: 220,
    width: 220,
  },
  title: {
    color: '#7A4328',
    fontFamily: 'Fraunces_700Bold',
    fontSize: 26,
    letterSpacing: 0.4,
    marginTop: 12,
  },
});
