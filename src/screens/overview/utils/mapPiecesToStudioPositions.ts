import type { Piece } from '@/src/types/pieces';

export type StudioPiecePositions = {
  workTable: Piece[];
  dryingShelf: Piece[];
  kilnArea: Piece[];
  glazeRack: Piece[];
  finishedCabinet: Piece[];
};

const IN_PROGRESS_STAGES = new Set(['in-progress', 'idea', 'forming', 'leather-hard', 'trimming']);
const DRYING_STAGES = new Set(['drying']);
const KILN_QUEUE_STAGES = new Set(['bone-dry', 'glazing']);
const GLAZE_PREP_STAGES = new Set(['bisque']);
const FINISHED_STAGES = new Set(['glaze-fired', 'finished']);

function normalizeStage(stage: string) {
  return stage.trim().toLowerCase();
}

export function mapPiecesToStudioPositions(pieces: Piece[]): StudioPiecePositions {
  const positions: StudioPiecePositions = {
    workTable: [],
    dryingShelf: [],
    kilnArea: [],
    glazeRack: [],
    finishedCabinet: [],
  };

  for (const piece of pieces) {
    const stage = normalizeStage(piece.stage);

    if (IN_PROGRESS_STAGES.has(stage)) {
      positions.workTable.push(piece);
      continue;
    }

    if (DRYING_STAGES.has(stage)) {
      positions.dryingShelf.push(piece);
      continue;
    }

    if (KILN_QUEUE_STAGES.has(stage)) {
      positions.kilnArea.push(piece);
      continue;
    }

    if (GLAZE_PREP_STAGES.has(stage)) {
      positions.glazeRack.push(piece);
      continue;
    }

    if (FINISHED_STAGES.has(stage)) {
      positions.finishedCabinet.push(piece);
    }
  }

  return positions;
}
