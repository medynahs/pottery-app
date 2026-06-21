import type { KilnkinCompanion } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import type { NotificationEventKind, NotificationEventPayload } from '@/src/services/notificationMessages';

export type NotificationDebugEvent = {
  kind: NotificationEventKind;
  label: string;
  payload: NotificationEventPayload;
};

export const NOTIFICATION_DEBUG_EVENTS: NotificationDebugEvent[] = [
  { kind: 'kiln-finished', label: 'Kiln finished', payload: { firingName: 'Bisque firing' } },
  { kind: 'firing-scheduled', label: 'Firing today', payload: { firingName: 'Cone 6 glaze' } },
  { kind: 'piece-drying', label: 'Drying alert', payload: { pieceName: 'Morning mug', days: 4 } },
  {
    kind: 'stage-overage',
    label: 'Stage overage',
    payload: { pieceName: 'River mug', stageName: 'trimming', days: 9 },
  },
  { kind: 'daily-mission', label: 'Daily mission', payload: { missionCount: 2 } },
  {
    kind: 'challenge-deadline',
    label: 'Challenge deadline',
    payload: { challengeTitle: 'Spring Mug Sprint', hoursLeft: 36 },
  },
  { kind: 'achievement', label: 'Achievement', payload: { achievementName: 'First shelf full' } },
  {
    kind: 'weekly-summary',
    label: 'Weekly summary',
    payload: { finishedPieces: 3, totalPieces: 5 },
  },
];

export function getNotificationDebugEvent(kind: NotificationEventKind): NotificationDebugEvent {
  return NOTIFICATION_DEBUG_EVENTS.find((event) => event.kind === kind) ?? NOTIFICATION_DEBUG_EVENTS[0];
}

export function formatNotificationDebugLabel(companion: KilnkinCompanion, kind: NotificationEventKind): string {
  const event = getNotificationDebugEvent(kind);
  return `${companion.name} · ${event.label}`;
}
