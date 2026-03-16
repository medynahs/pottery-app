import type { Piece } from '@/src/screens/pieces/types';

export type StudioPiecePositions = {
  workTable: Piece[];
  dryingShelf: Piece[];
  kilnArea: Piece[];
  glazeRack: Piece[];
  finishedCabinet: Piece[];
};

const IN_PROGRESS_STAGES = new Set(['in-progress', 'idea', 'forming', 'leather-hard', 'trimming']);
const DRYING_STAGES = new Set(['drying', 'bone-dry']);
const BISQUE_STAGES = new Set(['bisque']);
const GLAZED_STAGES = new Set(['glazed', 'glazing', 'glaze-fired']);
const FINISHED_STAGES = new Set(['finished']);

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

    if (BISQUE_STAGES.has(stage)) {
      positions.glazeRack.push(piece);
      continue;
    }

    if (GLAZED_STAGES.has(stage)) {
      positions.kilnArea.push(piece);
      continue;
    }

    if (FINISHED_STAGES.has(stage)) {
      positions.finishedCabinet.push(piece);
    }
  }

  return positions;
}
