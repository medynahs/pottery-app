import type { KilnkinCompanion } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import { getKilnkinOverviewNudge } from '@/src/screens/overview/kilnkin/kilnkinVoice';
import type { StudioPiecePositions } from '@/src/screens/overview/utils/mapPiecesToStudioPositions';
import type { Piece } from '@/src/types/pieces';

type NudgeParams = {
  kilnReady: boolean;
  dryingTooLong: boolean;
  scrapOverflow: boolean;
  stagePositions: StudioPiecePositions;
  pieces: Piece[];
  companion?: KilnkinCompanion;
};

export function getKilnkinNudge({
  kilnReady,
  dryingTooLong,
  scrapOverflow,
  stagePositions,
  pieces,
  companion,
}: NudgeParams): string {
  if (!companion) {
    return 'Something shifted in the studio.';
  }

  const totalInFlight = pieces.filter((p) => p.stage.trim().toLowerCase() !== 'finished').length;

  if (kilnReady) {
    return getKilnkinOverviewNudge(companion, 'kiln-ready', { count: stagePositions.kilnArea.length });
  }
  if (dryingTooLong) {
    return getKilnkinOverviewNudge(companion, 'drying-too-long');
  }
  if (scrapOverflow) {
    return getKilnkinOverviewNudge(companion, 'scrap-overflow');
  }
  if (stagePositions.finishedCabinet.length > 0 && totalInFlight === 0) {
    return getKilnkinOverviewNudge(companion, 'all-finished', { count: stagePositions.finishedCabinet.length });
  }
  if (totalInFlight === 0) {
    return getKilnkinOverviewNudge(companion, 'bench-clear');
  }
  if (totalInFlight === 1) {
    return getKilnkinOverviewNudge(companion, 'one-in-flight');
  }
  return getKilnkinOverviewNudge(companion, 'many-in-flight', { totalInFlight });
}
