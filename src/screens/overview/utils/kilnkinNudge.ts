import { getKilnkinVoiceLine } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import type { StudioPiecePositions } from '@/src/screens/overview/utils/mapPiecesToStudioPositions';
import type { Piece } from '@/src/types/pieces';

type NudgeParams = {
  kilnReady: boolean;
  dryingTooLong: boolean;
  scrapOverflow: boolean;
  stagePositions: StudioPiecePositions;
  pieces: Piece[];
  personality?: import('@/src/screens/overview/kilnkin/kilnkinCompanion').KilnkinPersonality;
};

export function getKilnkinNudge({ kilnReady, dryingTooLong, scrapOverflow, stagePositions, pieces, personality }: NudgeParams): string {
  const totalInFlight = pieces.filter((p) => p.stage.trim().toLowerCase() !== 'finished').length;
  let raw: string;
  if (kilnReady) {
    const n = stagePositions.kilnArea.length;
    raw = `${n} piece${n !== 1 ? 's' : ''} ${n !== 1 ? 'are' : 'is'} bone dry and ready for the kiln — ${n !== 1 ? "they've" : "it's"} been patient!`;
  } else if (dryingTooLong) {
    raw = 'Some pieces on the drying shelf have been sitting a while — are they bone dry yet?';
  } else if (scrapOverflow) {
    raw = "The reclaim bucket's getting full. A short reclaim session could really clear your headspace.";
  } else if (stagePositions.finishedCabinet.length > 0 && totalInFlight === 0) {
    const n = stagePositions.finishedCabinet.length;
    raw = `${n} finished piece${n !== 1 ? 's' : ''} in the cabinet — that's what it's all about! Time to start something new?`;
  } else if (totalInFlight === 0) {
    raw = 'The studio bench is clear — a blank slate. A great time to throw something.';
  } else if (totalInFlight === 1) {
    raw = "One piece in the works. Nice and focused — let's see it through.";
  } else {
    raw = `${totalInFlight} pieces moving through the studio. Looking good!`;
  }
  if (!personality) return raw;
  return getKilnkinVoiceLine({ personality } as never, raw);
}
