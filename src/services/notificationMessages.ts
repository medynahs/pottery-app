import type { KilnkinCompanion } from '../screens/overview/kilnkin/kilnkinCompanion';
import {
  buildKilnkinNotificationMessage,
  type KilnkinVoiceEventKind,
  type KilnkinVoicePayload,
} from '../screens/overview/kilnkin/kilnkinVoice';

export type NotificationEventKind = KilnkinVoiceEventKind;
export type NotificationEventPayload = KilnkinVoicePayload;

/** @deprecated Use buildVoicedNotificationMessage instead. */
export function buildBaseNotificationMessage(
  kind: NotificationEventKind,
  payload: NotificationEventPayload = {},
): string {
  const fallback = { id: 'terra' } as KilnkinCompanion;
  return buildKilnkinNotificationMessage(fallback, kind, payload);
}

/** @deprecated Tone is woven into companion-specific messages. */
export function applyKilnkinNotificationTone(
  companion: KilnkinCompanion,
  _kind: NotificationEventKind,
  baseMessage: string,
): string {
  return baseMessage;
}

export function buildVoicedNotificationMessage(
  companion: KilnkinCompanion,
  kind: NotificationEventKind,
  payload: NotificationEventPayload = {},
  variantSalt = 0,
): string {
  return buildKilnkinNotificationMessage(companion, kind, payload, variantSalt);
}
