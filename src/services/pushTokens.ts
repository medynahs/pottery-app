import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationPrefs } from '../store/appStore';
import { registerPushToken } from './api';
import { configureNotificationRuntime } from './notifications';

/** Set true once verified on device — sync is deduped to prevent registration loops. */
export const PUSH_NOTIFICATIONS_ENABLED = false;

let lastRegisteredToken: string | null = null;
let syncInFlight = false;

export function resetPushTokenRegistration(): void {
  lastRegisteredToken = null;
}

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
  knownToken?: string | null,
): Promise<void> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return;
  if (!hasEnabledNotificationPrefs(prefs)) return;
  if (syncInFlight) return;

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  syncInFlight = true;
  try {
    const token = knownToken ?? await resolveExpoPushToken();
    if (!token || token === lastRegisteredToken) return;

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    await registerPushToken(token, platform);
    lastRegisteredToken = token;
  } finally {
    syncInFlight = false;
  }
}
