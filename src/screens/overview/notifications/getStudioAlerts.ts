import type { Firing } from '@/src/screens/kiln/types';
import { getKilnkinVoiceLine, type KilnkinCompanion } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import { getDateKey, type StudioRhythmConfig } from '@/src/screens/overview/studioRythm/studioRhythm';
import type { Piece } from '@/src/screens/pieces/types';

export type StudioAlert = {
  id: string;
  title: string;
  body: string;
  route: string;
  actionLabel: string;
  freshnessLabel: string;
  type: 'kiln' | 'planner' | 'seasonal' | 'piece';
};

type StudioAlertData = {
  companion: KilnkinCompanion;
  pieces: Piece[];
  firings: Firing[];
  studioRhythmConfig: StudioRhythmConfig;
  now?: Date;
};

function getSeasonLabel(date: Date) {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

function toDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getFreshnessLabel(date: Date, now: Date) {
  const deltaMs = date.getTime() - now.getTime();
  const deltaDays = Math.round(deltaMs / (1000 * 60 * 60 * 24));

  if (Math.abs(deltaMs) < 1000 * 60 * 90) {
    return 'Just now';
  }

  if (deltaDays <= 0) {
    return 'Today';
  }

  if (deltaDays === 1) {
    return 'Tomorrow';
  }

  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function getKilnAlert(
  companion: KilnkinCompanion,
  pieces: Piece[],
  firings: Firing[],
  now: Date
): StudioAlert | null {
  const latestActiveFiring = [...firings]
    .filter((firing) => ['scheduled', 'loading', 'firing', 'cooling'].includes(firing.state))
    .sort((left, right) => {
      const leftDate = toDate(left.startedAt) ?? toDate(left.scheduledDate) ?? now;
      const rightDate = toDate(right.startedAt) ?? toDate(right.scheduledDate) ?? now;
      return rightDate.getTime() - leftDate.getTime();
    })[0];

  if (!latestActiveFiring || latestActiveFiring.pieceIds.length === 0) {
    return null;
  }

  const loadedPieces = pieces.filter((piece) => latestActiveFiring.pieceIds.includes(piece.id));
  const firstPiece = loadedPieces[0];
  const pieceSummary =
    loadedPieces.length <= 1 && firstPiece
      ? `${firstPiece.name.toLowerCase()} to the kiln`
      : `${loadedPieces.length} pieces to the kiln`;

  const alertDate = toDate(latestActiveFiring.startedAt) ?? toDate(latestActiveFiring.scheduledDate) ?? now;

  return {
    id: `kiln-${latestActiveFiring.id}`,
    title: 'Kiln Update',
    body: getKilnkinVoiceLine(companion, `the studio just moved ${pieceSummary}.`),
    route: '/(tabs)/kiln',
    actionLabel: 'Open Kiln',
    freshnessLabel: getFreshnessLabel(alertDate, now),
    type: 'kiln',
  };
}

function getPlannerAlerts(
  companion: KilnkinCompanion,
  studioRhythmConfig: StudioRhythmConfig,
  now: Date
): StudioAlert[] {
  return studioRhythmConfig.scheduledEvents
    .filter((event) => event.notificationsEnabled)
    .filter((event) => {
      const eventDate = toDate(event.date);
      if (!eventDate) return false;
      const delta = eventDate.getTime() - now.getTime();
      return delta >= 0 && delta <= 1000 * 60 * 60 * 24 * 3;
    })
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(0, 2)
    .map((event) => {
      const eventDate = toDate(event.date) ?? now;

      return {
        id: `event-${event.id}`,
        title: event.title,
        body: getKilnkinVoiceLine(companion, `${event.title.toLowerCase()} is coming up soon.`),
        route: '/profile/studio-rhythm',
        actionLabel: 'Open Calendar',
        freshnessLabel: getFreshnessLabel(eventDate, now),
        type: 'planner' as const,
      };
    });
}

function getSeasonalWrapAlert(companion: KilnkinCompanion, pieces: Piece[], now: Date): StudioAlert | null {
  const completedPieces = pieces.filter((piece) => piece.stage === 'finished').length;
  const seasonLabel = getSeasonLabel(now);

  if (completedPieces === 0) {
    return null;
  }

  return {
    id: `seasonal-wrap-${getDateKey(now)}`,
    title: `${seasonLabel} Wrap`,
    body: getKilnkinVoiceLine(companion, `your ${seasonLabel.toLowerCase()} studio wrap is ready to peek at.`),
    route: '/overview-analytics',
    actionLabel: 'Open Wrap',
    freshnessLabel: 'Fresh',
    type: 'seasonal',
  };
}

function getPieceProgressAlert(companion: KilnkinCompanion, pieces: Piece[], now: Date): StudioAlert | null {
  const finishedCount = pieces.filter((piece) => piece.stage === 'finished').length;

  if (finishedCount === 0) {
    return null;
  }

  return {
    id: `piece-progress-${finishedCount}`,
    title: 'Studio Shelf',
    body: getKilnkinVoiceLine(companion, `${finishedCount} finished ${finishedCount === 1 ? 'piece is' : 'pieces are'} ready for admiration.`),
    route: '/(tabs)/pieces?stage=finished',
    actionLabel: 'Open Pieces',
    freshnessLabel: 'Today',
    type: 'piece',
  };
}

export function getStudioAlerts(data: StudioAlertData): StudioAlert[] {
  const now = data.now ?? new Date();
  const alerts: StudioAlert[] = [];

  const kilnAlert = getKilnAlert(data.companion, data.pieces, data.firings, now);
  if (kilnAlert) {
    alerts.push(kilnAlert);
  }

  alerts.push(...getPlannerAlerts(data.companion, data.studioRhythmConfig, now));

  const seasonalWrapAlert = getSeasonalWrapAlert(data.companion, data.pieces, now);
  if (seasonalWrapAlert) {
    alerts.push(seasonalWrapAlert);
  }

  const pieceProgressAlert = getPieceProgressAlert(data.companion, data.pieces, now);
  if (pieceProgressAlert) {
    alerts.push(pieceProgressAlert);
  }

  return alerts.slice(0, 4);
}