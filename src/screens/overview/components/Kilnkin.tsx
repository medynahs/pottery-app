import type { KilnkinCompanion } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import { getKilnkinStudioHint } from '@/src/screens/overview/kilnkin/kilnkinVoice';
import type { StudioSignals } from '@/src/screens/overview/utils/getStudioSignals';
import { useAppStore } from '@/src/store';
import type { Piece } from '@/src/types/pieces';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

type KilnkinProps = {
  pieces: Piece[];
  signals: StudioSignals;
};

const DRYING_OR_BONE_DRY = new Set(['drying', 'bone-dry']);
let hasShownKilnkinHintThisSession = false;

function pickHint(companion: KilnkinCompanion, pieces: Piece[], signals: StudioSignals): string | null {
  const dryingCandidates = pieces.filter((piece) => DRYING_OR_BONE_DRY.has(piece.stage.trim().toLowerCase())).length;

  const options: string[] = [];

  if (dryingCandidates > 0) {
    options.push(getKilnkinStudioHint(companion, 'trimming-ready'));
  }

  if (signals.scrapOverflow) {
    options.push(getKilnkinStudioHint(companion, 'reclaim-overflow'));
  }

  if (signals.kilnReady) {
    options.push(getKilnkinStudioHint(companion, 'kiln-ready'));
  }

  if (options.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

export function Kilnkin({ pieces, signals }: KilnkinProps) {
  const companion = useAppStore((state) => state.kilnkinCompanion);
  const idleLift = useRef(new Animated.Value(0)).current;
  const wanderX = useRef(new Animated.Value(0)).current;
  const wanderY = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const [hintText, setHintText] = useState<string | null>(null);

  const idleTranslateY = useMemo(
    () => idleLift.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }),
    [idleLift]
  );

  useEffect(() => {
    const idleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(idleLift, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(idleLift, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    idleAnimation.start();

    return () => {
      idleAnimation.stop();
    };
  }, [idleLift]);

  useEffect(() => {
    let cancelled = false;

    const wanderStep = () => {
      if (cancelled) return;

      const nextX = Math.random() * 24 - 12;
      const nextY = Math.random() * 14 - 7;
      const duration = 5000 + Math.round(Math.random() * 3500);

      Animated.parallel([
        Animated.timing(wanderX, {
          toValue: nextX,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wanderY, {
          toValue: nextY,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          wanderStep();
        }
      });
    };

    wanderStep();

    return () => {
      cancelled = true;
      wanderX.stopAnimation();
      wanderY.stopAnimation();
    };
  }, [wanderX, wanderY]);

  useEffect(() => {
    if (hasShownKilnkinHintThisSession) {
      return;
    }

    const hint = pickHint(companion, pieces, signals);
    if (!hint) {
      return;
    }

    const shouldShowHint = Math.random() < 0.28;
    if (!shouldShowHint) {
      return;
    }

    const delay = 5000 + Math.round(Math.random() * 5000);

    const openTimeout = setTimeout(() => {
      hasShownKilnkinHintThisSession = true;
      setHintText(hint);

      Animated.timing(hintOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, delay);

    const closeTimeout = setTimeout(() => {
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setHintText(null));
    }, delay + 6500);

    return () => {
      clearTimeout(openTimeout);
      clearTimeout(closeTimeout);
    };
  }, [companion, hintOpacity, pieces, signals]);

  return (
    <View pointerEvents="none" className="absolute" style={{ left: '45%', top: '72%' }}>
      {/* {hintText ? (
        <Animated.View
          style={{ opacity: hintOpacity }}
          className="absolute -top-16 -left-24 max-w-[180px] rounded-2xl border border-border bg-card/92 px-3 py-2"
        >
          <Text className="text-[11px] text-foreground leading-4">{hintText}</Text>
        </Animated.View>
      ) : null}

      <Animated.View
        style={{
          transform: [{ translateX: wanderX }, { translateY: wanderY }, { translateY: idleTranslateY }],
        }}
      >
        <Image
          source={require('../../../../assets/images/clay-pet.png')}
          style={{ width: 44, height: 44 }}
          resizeMode="contain"
          accessibilityLabel={companion.name}
        />
      </Animated.View> */}
    </View>
  );
}
