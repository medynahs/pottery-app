import * as Notifications from 'expo-notifications';
import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { syncPushTokenWithBackend } from '../services/pushTokens';
import { useAppStore } from '../store/appStore';

/**
 * Keeps the backend push-token registry in sync on sign-in, app launch,
 * notification-pref changes, and native token rotation.
 */
export function usePushTokenSync() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const notificationPrefs = useAppStore((s) => s.notificationPrefs);

  const sync = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      await syncPushTokenWithBackend(notificationPrefs);
    } catch {
      // Best-effort — local notifications still work without server registration.
    }
  }, [notificationPrefs]);

  useEffect(() => {
    void sync();
  }, [sync]);

  useEffect(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    const subscription = Notifications.addPushTokenListener(() => {
      void sync();
    });

    return () => subscription.remove();
  }, [sync]);
}
