import type { KilnkinCompanion } from '../screens/overview/kilnkin/kilnkinCompanion';
import {
  buildKilnkinNotificationMessage,
  type KilnkinVoiceEventKind,
  type KilnkinVoicePayload,
} from '../screens/overview/kilnkin/kilnkinVoice';

export type NotificationEventKind = KilnkinVoiceEventKind;
export type NotificationEventPayload = KilnkinVoicePayload;

export function buildVoicedNotificationMessage(
  companion: KilnkinCompanion,
  kind: NotificationEventKind,
  payload: NotificationEventPayload = {},
  variantSalt = 0,
): string {
  return buildKilnkinNotificationMessage(companion, kind, payload, variantSalt);
}
