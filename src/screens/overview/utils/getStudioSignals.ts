import type { Firing } from '@/src/types/kiln';
import type { Piece } from '@/src/types/pieces';

export type StudioSignals = {
  dryingTooLong: boolean;
  scrapOverflow: boolean;
  kilnReady: boolean;
};

export type StudioSignalData = {
  pieces: Piece[];
  firings: Firing[];
  now?: Date;
};

function toDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getCurrentStageTimestamp(piece: Piece): Date | null {
  const fromTimeline = [...piece.timeline]
    .reverse()
    .find((entry) => entry.stage.trim().toLowerCase() === piece.stage.trim().toLowerCase());

  return toDate(fromTimeline?.timestamp) ?? toDate(piece.createdAt);
}

function daysBetween(earlier: Date, later: Date): number {
  const diffMs = later.getTime() - earlier.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

export function getStudioSignals(data: StudioSignalData): StudioSignals {
  const { pieces, firings } = data;
  const now = data.now ?? new Date();

  const dryingPieces = pieces.filter((piece) => {
    const stage = piece.stage.trim().toLowerCase();
    if (stage !== 'drying' && stage !== 'bone-dry') return false;

    const enteredAt = getCurrentStageTimestamp(piece);
    if (!enteredAt) return false;

    return daysBetween(enteredAt, now) > 3;
  });

  const trimmingPieces = pieces.filter((piece) => piece.stage.trim().toLowerCase() === 'trimming').length;
  const failedPieces = pieces.filter((piece) => {
    const status = piece.status?.trim().toLowerCase();
    return status === 'cracked' || status === 'warped';
  }).length;

  const readyStages = new Set(['bone-dry', 'glaze-fired']);
  const readyPieces = pieces.filter((piece) => readyStages.has(piece.stage.trim().toLowerCase())).length;

  const nearReadyFiring = firings.some((firing) => firing.state === 'cooling' || firing.state === 'unloading');

  return {
    dryingTooLong: dryingPieces.length > 0,
    scrapOverflow: trimmingPieces + failedPieces >= 5,
    kilnReady: readyPieces > 0 || nearReadyFiring,
  };
}
