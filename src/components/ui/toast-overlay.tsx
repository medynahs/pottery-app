/**
 * ToastOverlay — global in-app feedback banner.
 *
 * Reads from the Zustand store and auto-dismisses after 3 seconds.
 * Mount exactly once near the root (inside providers, outside any navigator).
 */
import { useAppStore } from '@/src/store';
import { MotiView } from 'moti';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AUTO_DISMISS_MS = 3000;

export function ToastOverlay() {
  const toast = useAppStore(s => s.toast);
  const dismissToast = useAppStore(s => s.dismissToast);
  const insets = useSafeAreaInsets();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dismissToast();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast, dismissToast]);

  if (!toast) return null;

  const isSuccess = toast.variant === 'success';

  return (
    <View
      pointerEvents="none"
      style={[styles.container, { top: insets.top + 12 }]}
    >
      <MotiView
        from={{ opacity: 0, translateY: -12 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -12 }}
        transition={{ type: 'timing', duration: 220 }}
        style={[
          styles.pill,
          isSuccess ? styles.pillSuccess : styles.pillError,
        ]}
      >
        <Text style={styles.dot}>{isSuccess ? '✓' : '✕'}</Text>
        <Text style={[styles.message, isSuccess ? styles.messageSuccess : styles.messageError]}>
          {toast.message}
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: 320,
  },
  pillSuccess: {
    backgroundColor: '#EEF7EC',
    borderWidth: 1,
    borderColor: '#C5E0BE',
  },
  pillError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dot: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  messageSuccess: {
    color: 'hsl(100 38% 32%)',
  },
  messageError: {
    color: 'hsl(0 65% 38%)',
  },
});
