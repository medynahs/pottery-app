import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationPrefs } from '../store/appStore';
import { registerPushToken } from './api';
import { configureNotificationRuntime } from './notifications';

/** Kill-switch — re-enable once push-token sync loop is fixed on the client. */
export const PUSH_NOTIFICATIONS_ENABLED = false;

export function hasEnabledNotificationPrefs(prefs: NotificationPrefs): boolean {
  return Object.values(prefs).some(Boolean);
}

function resolveExpoProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId
    ?? Constants.easConfig?.projectId
    ?? undefined
  );
}

/** Resolve the Expo push token for this device. Returns null on web, simulators, or missing project id. */
export async function resolveExpoPushToken(): Promise<string | null> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;

  const projectId = resolveExpoProjectId();
  if (!projectId) return null;

  configureNotificationRuntime();

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data || null;
  } catch {
    return null;
  }
}

/**
 * Register the device push token with the API when the user is signed in,
 * notifications are permitted, and at least one notification toggle is on.
 */
export async function syncPushTokenWithBackend(
  
    prefs: NotificationPrefs,
): Promise<void> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return;
  if (!hasEnabledNotificationPrefs(prefs)) return;

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  const token = await resolveExpoPushToken();
  if (!token) return;

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  await registerPushToken(token, platform);
}
