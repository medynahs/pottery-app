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
  const sessionToken = useAppStore((s) => s.sessionToken);
  const notificationPrefs = useAppStore((s) => s.notificationPrefs);

  const sync = useCallback(async () => {
    if (!sessionToken) return;
    try {
      await syncPushTokenWithBackend(sessionToken, notificationPrefs);
    } catch {
      // Best-effort — local notifications still work without server registration.
    }
  }, [sessionToken, notificationPrefs]);

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
