import { Image } from 'expo-image';
import { Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type AnimatedSplashScreenProps = {
  onFinish: () => void;
};

const SPLASH_HOLD_MS = 2600;

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const logoTranslateY = useRef(new Animated.Value(18)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(0.4)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;
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
      ]),
      Animated.parallel([
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleScale, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleRotate, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
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
    sparkleOpacity,
    sparkleRotate,
    sparkleScale,
    titleOpacity,
    titleTranslateY,
  ]);

  const sparkleRotation = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-18deg', '0deg'],
  });

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
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkleOpacity,
              transform: [
                { scale: sparkleScale },
                { rotate: sparkleRotation },
              ],
            },
          ]}
        >
          <Sparkles color="#D7964C" size={24} strokeWidth={2.4} />
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
    height: 250,
    justifyContent: 'center',
    width: 250,
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
  sparkle: {
    left: 42,
    position: 'absolute',
    top: 40,
  },
  title: {
    color: '#7A4328',
    fontFamily: 'Fraunces_700Bold',
    fontSize: 26,
    letterSpacing: 0.4,
    marginTop: 12,
  },
});
