import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationPrefs } from '../store/appStore';
import { deregisterPushToken, registerPushToken, updateProfile } from './api';
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
 * Mirror notification prefs to the API for a signed-in user: register the
 * device token while at least one toggle is on, deregister it (and flip the
 * server-side opt-out, so other devices' stale tokens go quiet too) when the
 * user turns everything off.
 */
export async function syncPushTokenWithBackend(
  prefs: NotificationPrefs,
  knownToken?: string | null,
): Promise<void> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return;
  if (syncInFlight) return;

  if (!hasEnabledNotificationPrefs(prefs)) {
    syncInFlight = true;
    try {
      await updateProfile({ push_notifications_enabled: false });
      await deregisterPushTokenFromBackend();
    } catch {
      // best-effort; the server-side flag is the backstop
    } finally {
      syncInFlight = false;
    }
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  syncInFlight = true;
  try {
    const token = knownToken ?? await resolveExpoPushToken();
    if (!token || token === lastRegisteredToken) return;

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    await registerPushToken(token, platform);
    await updateProfile({ push_notifications_enabled: true }).catch(() => {});
    lastRegisteredToken = token;
  } finally {
    syncInFlight = false;
  }
}

/**
 * Unregister this device's token before sign-out (needs the still-valid
 * session). Best-effort: a failure must never block signing out.
 */
export async function deregisterPushTokenFromBackend(): Promise<void> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return;

  try {
    const token = lastRegisteredToken ?? await resolveExpoPushToken();
    if (!token) return;
    await deregisterPushToken(token);
  } catch {
    // ignore: the API prunes dead tokens on Expo receipt errors anyway
  } finally {
    lastRegisteredToken = null;
  }
}
