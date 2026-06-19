import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { KilnkinCompanion } from '../screens/overview/kilnkin/kilnkinCompanion';
import {
    buildVoicedNotificationMessage,
    type NotificationEventKind,
    type NotificationEventPayload,
} from './notificationMessages';

type ScheduleKilnkinNotificationInput = {
  companion: KilnkinCompanion;
  kind: NotificationEventKind;
  payload?: NotificationEventPayload;
  trigger: Notifications.NotificationTriggerInput;
};

let configured = false;

export function configureNotificationRuntime() {
  if (configured) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  configured = true;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('kilnkin-default', {
    name: 'Kilnkin Updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 180, 120, 180],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  configureNotificationRuntime();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    await ensureAndroidChannel();
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  if (requested.granted) {
    await ensureAndroidChannel();
    return true;
  }

  return false;
}

export async function cancelScheduledNotificationsByKind(kind: NotificationEventKind): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();

  const matching = all.filter((item) => {
    const data = item.content.data as { kind?: string } | undefined;
    return data?.kind === kind;
  });

  await Promise.all(matching.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export async function scheduleKilnkinNotification(
  input: ScheduleKilnkinNotificationInput,
): Promise<string | null> {
  const allowed = await ensureNotificationPermission();
  if (!allowed) return null;

  const body = buildVoicedNotificationMessage(input.companion, input.kind, input.payload);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: input.companion.name,
      body,
      sound: 'default',
      data: {
        kind: input.kind,
        companionId: input.companion.id,
      },
    },
    trigger: input.trigger,
  });
}

export async function scheduleWeeklySummaryNotification(
  companion: KilnkinCompanion,
  payload?: NotificationEventPayload,
): Promise<string | null> {
  await cancelScheduledNotificationsByKind('weekly-summary');

  return scheduleKilnkinNotification({
    companion,
    kind: 'weekly-summary',
    payload,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 7 * 24 * 60 * 60,
      repeats: true,
      channelId: Platform.OS === 'android' ? 'kilnkin-default' : undefined,
    },
  });
}
