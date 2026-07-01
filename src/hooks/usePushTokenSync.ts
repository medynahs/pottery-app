import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { PUSH_NOTIFICATIONS_ENABLED, resetPushTokenRegistration, syncPushTokenWithBackend } from '../services/pushTokens';
import { useAppStore } from '../store/appStore';

const SYNC_DEBOUNCE_MS = 2000;

/**
 * Keeps the backend push-token registry in sync on sign-in, app launch,
 * notification-pref changes, and native token rotation.
 */
export function usePushTokenSync() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const notificationPrefs = useAppStore((s) => s.notificationPrefs);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSignedInRef = useRef(false);

  useEffect(() => {
    if (isSignedIn && !prevSignedInRef.current) {
      resetPushTokenRegistration();
    }
    prevSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  const sync = useCallback(
    (knownToken?: string | null) => {
      if (!PUSH_NOTIFICATIONS_ENABLED || !isSignedIn) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void syncPushTokenWithBackend(notificationPrefs, knownToken).catch(() => {
          // Best-effort — local notifications still work without server registration.
        });
      }, SYNC_DEBOUNCE_MS);
    },
    [isSignedIn, notificationPrefs],
  );

  useEffect(() => {
    if (!PUSH_NOTIFICATIONS_ENABLED) return;
    sync();
  }, [sync]);

  useEffect(() => {
    if (!PUSH_NOTIFICATIONS_ENABLED) return;
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    const subscription = Notifications.addPushTokenListener((event) => {
      // Use the token from the event — do not re-fetch (that re-triggers this listener).
      sync(event.data);
    });

    return () => {
      subscription.remove();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sync]);
}
