import { Text } from '@/src/components/ui/text';
import { Image } from 'expo-image';
import { Sparkle } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, type StyleProp, type ViewStyle } from 'react-native';

type AnimatedLogoHeroProps = {
  /** Logo width/height in px. Halos scale proportionally. */
  logoSize?: number;
  /** Show the uppercase Pottery Nook pill above the logo. */
  showWordmark?: boolean;
  wordmark?: string;
  /** Headline + subcopy rendered below the logo with entrance animation. */
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedLogoHero({
  logoSize = 156,
  showWordmark = true,
  wordmark = 'Pottery Nook',
  children,
  style,
}: AnimatedLogoHeroProps) {
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const contentY = useRef(new Animated.Value(16)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const twinkleA = useRef(new Animated.Value(0)).current;
  const twinkleB = useRef(new Animated.Value(0)).current;

  const haloOuter = logoSize * 1.205;
  const haloInner = logoSize * 0.91;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 460, delay: 320, useNativeDriver: true }),
      Animated.timing(contentY, { toValue: 0, duration: 460, delay: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -8, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    floatLoop.start();

    const mkTwinkle = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
    const tA = mkTwinkle(twinkleA, 0);
    const tB = mkTwinkle(twinkleB, 650);
    tA.start();
    tB.start();

    return () => {
      floatLoop.stop();
      tA.stop();
      tB.stop();
    };
  }, [heroOpacity, logoOpacity, logoScale, contentOpacity, contentY, floatY, twinkleA, twinkleB]);

  return (
    <Animated.View style={[{ alignItems: 'center' }, style, { opacity: heroOpacity }]}>
      <View style={{ width: '100%', alignItems: 'center', position: 'relative', minHeight: logoSize + 24 }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: logoSize * 0.08,
            left: '18%',
            opacity: twinkleA,
            transform: [{ scale: twinkleA.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
          }}
        >
          <Sparkle size={20} color="rgba(255, 244, 222, 0.9)" fill="rgba(255, 244, 222, 0.9)" />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            top: logoSize * 0.38,
            right: '16%',
            opacity: twinkleB,
            transform: [{ scale: twinkleB.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }}
        >
          <Sparkle size={14} color="rgba(255, 244, 222, 0.85)" fill="rgba(255, 244, 222, 0.85)" />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            bottom: logoSize * 0.12,
            left: '22%',
            opacity: twinkleB,
            transform: [{ scale: twinkleB.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
          }}
        >
          <Sparkle size={12} color="rgba(255, 244, 222, 0.8)" fill="rgba(255, 244, 222, 0.8)" />
        </Animated.View>

        {showWordmark ? (
          <View
            style={{
              alignSelf: 'center',
              borderRadius: 999,
              backgroundColor: 'rgba(255, 252, 245, 0.72)',
              paddingHorizontal: 13,
              paddingVertical: 6,
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#7a4b2a',
              }}
            >
              {wordmark}
            </Text>
          </View>
        ) : null}

        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ translateY: floatY }, { scale: logoScale }],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: haloOuter,
              height: haloOuter,
              borderRadius: haloOuter / 2,
              backgroundColor: 'rgba(255, 248, 232, 0.22)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: haloInner,
              height: haloInner,
              borderRadius: haloInner / 2,
              backgroundColor: 'rgba(255, 248, 232, 0.28)',
            }}
          />
          <Image
            source={require('../../assets/PotteryNookLogo.png')}
            style={{ width: logoSize, height: logoSize }}
            contentFit="contain"
          />
        </Animated.View>
      </View>

      {children ? (
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentY }],
            width: '100%',
            alignItems: 'center',
          }}
        >
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
