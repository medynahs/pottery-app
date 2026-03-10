import { useNetworkConnection } from '@/src/hooks/useNetworkConnection';
import { useAppStore } from '@/src/store/appStore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BANNER_HEIGHT = 36;
const HIDE_DELAY_MS = 2500; // how long the "back online" message stays visible

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkConnection();
  const isOnline = isConnected && isInternetReachable;

  const isSyncing = useAppStore((s) => s.isSyncing);
  const pendingCount = useAppStore((s) => s.pendingSyncOps.length);

  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT)).current;

  // Track whether we should render the banner DOM node at all
  const [rendered, setRendered] = useState(!isOnline);
  // Track whether we're showing the transient "back online" message
  const [showingBackOnline, setShowingBackOnline] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOnline = useRef(isOnline);

  const slideIn = () =>
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();

  const slideOut = (onDone?: () => void) =>
    Animated.timing(translateY, {
      toValue: -BANNER_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onDone?.();
    });

  useEffect(() => {
    const wentOffline = prevOnline.current && !isOnline;
    const cameOnline = !prevOnline.current && isOnline;
    prevOnline.current = isOnline;

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    if (wentOffline) {
      setShowingBackOnline(false);
      setRendered(true);
      slideIn();
    } else if (cameOnline) {
      setShowingBackOnline(true);
      slideIn();
      hideTimer.current = setTimeout(() => {
        slideOut(() => {
          setRendered(false);
          setShowingBackOnline(false);
        });
      }, HIDE_DELAY_MS);
    } else if (!isOnline) {
      // Initial render while already offline
      setRendered(true);
      slideIn();
    }
  }, [isOnline]);

  if (!rendered) return null;

  const message = showingBackOnline
    ? isSyncing
      ? 'Syncing your changes…'
      : 'Back online'
    : pendingCount > 0
    ? `Offline · ${pendingCount} change${pendingCount === 1 ? '' : 's'} saved locally`
    : 'You\'re offline · changes saved locally';

  const backgroundColor = showingBackOnline ? '#3d7a5e' : '#6b4c3b';

  return (
    <Animated.View
      style={[
        styles.banner,
        { top: insets.top, backgroundColor, transform: [{ translateY }] },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    // Subtle shadow so it floats above content
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
