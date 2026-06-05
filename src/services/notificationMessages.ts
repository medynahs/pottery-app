import type { KilnkinCompanion } from '../screens/overview/kilnkin/kilnkinCompanion';

export type NotificationEventKind =
  | 'kiln-finished'
  | 'firing-scheduled'
  | 'piece-drying'
  | 'stage-overage'
  | 'daily-mission'
  | 'challenge-deadline'
  | 'achievement'
  | 'weekly-summary';

export type NotificationEventPayload = {
  pieceName?: string;
  firingName?: string;
  stageName?: string;
  days?: number;
  missionCount?: number;
  challengeTitle?: string;
  hoursLeft?: number;
  achievementName?: string;
  totalPieces?: number;
  finishedPieces?: number;
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickVariant(options: string[], seed: string): string {
  return options[hashString(seed) % options.length];
}

export function buildBaseNotificationMessage(
  kind: NotificationEventKind,
  payload: NotificationEventPayload = {},
): string {
  const seed = `${kind}:${JSON.stringify(payload)}`;

  switch (kind) {
    case 'kiln-finished': {
      const name = payload.firingName ?? 'A firing';
      return pickVariant([
        `${name} is complete and ready for unload.`,
        `${name} finished and can be unloaded.`,
        `${name} is done. Unload whenever you are ready.`,
      ], seed);
    }
    case 'firing-scheduled': {
      const name = payload.firingName ?? 'A firing';
      return pickVariant([
        `${name} is scheduled for today.`,
        `${name} is on your schedule today.`,
        `Today includes ${name.toLowerCase()}.`,
      ], seed);
    }
    case 'piece-drying': {
      const days = payload.days ?? 3;
      if (payload.pieceName) {
        return pickVariant([
          `${payload.pieceName} has been drying for ${days} days.`,
          `${payload.pieceName} has been drying ${days} days and may be ready for the next step.`,
          `${payload.pieceName} has sat in drying for ${days} days.`,
        ], seed);
      }
      return pickVariant([
        `A piece has been drying for ${days} days.`,
        `One piece has been in drying for ${days} days.`,
        `A drying piece is at ${days} days now.`,
      ], seed);
    }
    case 'stage-overage':
      if (payload.pieceName) {
        return pickVariant([
          `${payload.pieceName} has been in ${payload.stageName ?? 'its current stage'} for ${payload.days ?? 7} days.`,
          `${payload.pieceName} looks stuck in ${payload.stageName ?? 'its current stage'} after ${payload.days ?? 7} days.`,
          `${payload.pieceName} has lingered in ${payload.stageName ?? 'its current stage'} for ${payload.days ?? 7} days.`,
        ], seed);
      }
      return pickVariant([
        `A piece has been in ${payload.stageName ?? 'its current stage'} for longer than expected.`,
        `A piece may be overdue in ${payload.stageName ?? 'its current stage'}.`,
        `One piece has lingered in ${payload.stageName ?? 'its current stage'} beyond your usual timing.`,
      ], seed);
    case 'daily-mission':
      if ((payload.missionCount ?? 0) > 0) {
        return pickVariant([
          `You still have ${payload.missionCount} mission${payload.missionCount === 1 ? '' : 's'} open today.`,
          `${payload.missionCount} mission${payload.missionCount === 1 ? '' : 's'} remain for today.`,
          `There ${payload.missionCount === 1 ? 'is' : 'are'} ${payload.missionCount} mission${payload.missionCount === 1 ? '' : 's'} left today.`,
        ], seed);
      }
      return pickVariant([
        'Your studio missions are waiting for a quick check-in.',
        'Today\'s missions are ready whenever you are.',
        'A short mission check-in is waiting in your studio.',
      ], seed);
    case 'challenge-deadline':
      if (payload.challengeTitle) {
        if (payload.hoursLeft != null) {
          return pickVariant([
            `${payload.challengeTitle} closes in about ${payload.hoursLeft}h.`,
            `${payload.challengeTitle} ends in roughly ${payload.hoursLeft}h.`,
            `${payload.challengeTitle} deadline is around ${payload.hoursLeft}h away.`,
          ], seed);
        }
        return pickVariant([
          `${payload.challengeTitle} deadline is coming up soon.`,
          `${payload.challengeTitle} is closing soon.`,
          `${payload.challengeTitle} is nearing its deadline.`,
        ], seed);
      }
      return pickVariant([
        'A joined challenge deadline is coming up soon.',
        'One of your joined challenges is closing soon.',
        'A challenge you joined is nearing its deadline.',
      ], seed);
    case 'achievement':
      if (payload.achievementName) {
        return pickVariant([
          `You unlocked ${payload.achievementName}.`,
          `${payload.achievementName} just unlocked.`,
          `New achievement: ${payload.achievementName}.`,
        ], seed);
      }
      return pickVariant([
        'You unlocked a new studio milestone.',
        'A new studio milestone just unlocked.',
        'You reached a new achievement in the studio.',
      ], seed);
    case 'weekly-summary':
      if (payload.totalPieces != null || payload.finishedPieces != null) {
        return pickVariant([
          `This week: ${payload.finishedPieces ?? 0} finished out of ${payload.totalPieces ?? 0} tracked pieces.`,
          `Weekly recap: ${payload.finishedPieces ?? 0} finished from ${payload.totalPieces ?? 0} tracked pieces.`,
          `${payload.finishedPieces ?? 0} of ${payload.totalPieces ?? 0} tracked pieces were finished this week.`,
        ], seed);
      }
      return pickVariant([
        'Your weekly studio summary is ready.',
        'Your weekly studio recap is ready.',
        'The week\'s studio summary is ready for review.',
      ], seed);
    default:
      return 'You have a new studio update.';
  }
}

export function applyKilnkinNotificationTone(
  companion: KilnkinCompanion,
  kind: NotificationEventKind,
  baseMessage: string,
): string {
  const seed = `${companion.id}:${kind}:${baseMessage}`;

  switch (companion.personality) {
    case 'fire': {
      const tail = pickVariant([
        'Push one clear step now.',
        'Keep the heat moving.',
        'Take the next action while momentum is hot.',
      ], seed);
      return `${baseMessage} ${tail}`;
    }
    case 'air': {
      const tail = pickVariant([
        'Check in whenever you feel ready.',
        'Ease into it when you have a minute.',
        'A light check-in is enough for now.',
      ], seed);
      return `${baseMessage} ${tail}`;
    }
    case 'water': {
      const tail = pickVariant([
        'Drift over when it feels right.',
        'Flow to it when your hands are free.',
        'A gentle pass keeps things moving.',
      ], seed);
      return `${baseMessage} ${tail}`;
    }
    case 'earth':
    default: {
      const tail = pickVariant([
        'One practical step keeps the rhythm.',
        'A steady check-in will do.',
        'Small progress now sets up the next stage.',
      ], seed);
      return `${baseMessage} ${tail}`;
    }
  }
}

export function buildVoicedNotificationMessage(
  companion: KilnkinCompanion,
  kind: NotificationEventKind,
  payload: NotificationEventPayload = {},
): string {
  const base = buildBaseNotificationMessage(kind, payload);
  return applyKilnkinNotificationTone(companion, kind, base);
}
