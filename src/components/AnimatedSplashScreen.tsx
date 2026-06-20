import {
  SplashBackgroundOrnaments,
  SplashLettering,
  SPLASH_LETTERING_SIZE,
} from '@/src/components/SplashPotteryRing';
import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type AnimatedSplashScreenProps = {
  onFinish: () => void;
};

const SPLASH_HOLD_MS = 2600;
const LOGO_STAGE_SIZE = 420;

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoTranslateY = useRef(new Animated.Value(22)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const letteringOpacity = useRef(new Animated.Value(0)).current;
  const letteringScale = useRef(new Animated.Value(0.9)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.72)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let glowPulseLoop: Animated.CompositeAnimation | undefined;
    const pulseTimer = setTimeout(() => {
      glowPulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      glowPulseLoop.start();
    }, 1200);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 1300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          delay: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 70,
          delay: 120,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 1100,
          delay: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1100,
          delay: 120,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(letteringOpacity, {
          toValue: 1,
          duration: 800,
          delay: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(letteringScale, {
          toValue: 1,
          friction: 7,
          tension: 60,
          delay: 380,
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

    return () => {
      clearTimeout(pulseTimer);
      animation.stop();
      glowPulseLoop?.stop();
    };
  }, [
    containerOpacity,
    glowOpacity,
    glowPulse,
    glowScale,
    letteringOpacity,
    letteringScale,
    logoOpacity,
    logoRotate,
    logoScale,
    logoTranslateY,
    onFinish,
  ]);

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-4deg', '0deg'],
  });

  const glowPulseScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { opacity: containerOpacity }]}
    >
      <SplashBackgroundOrnaments />

      <View style={styles.centerStage}>
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
              transform: [{ scale: Animated.multiply(glowScale, glowPulseScale) }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.letteringWrap,
            {
              opacity: letteringOpacity,
              transform: [{ scale: letteringScale }],
            },
          ]}
        >
          <SplashLettering size={SPLASH_LETTERING_SIZE} />
        </Animated.View>
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [
              { translateY: logoTranslateY },
              { scale: logoScale },
              { rotate: logoRotation },
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centerStage: {
    alignItems: 'center',
    height: LOGO_STAGE_SIZE,
    justifyContent: 'center',
    width: LOGO_STAGE_SIZE,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#FBF0E0',
    justifyContent: 'center',
    zIndex: 999,
  },
  glow: {
    backgroundColor: '#F1D7B4',
    borderRadius: 140,
    height: 240,
    position: 'absolute',
    width: 240,
  },
  letteringWrap: {
    position: 'absolute',
  },
  logo: {
    height: 220,
    width: 220,
  },
});
