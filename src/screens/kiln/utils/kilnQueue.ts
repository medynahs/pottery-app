import type { Firing, FiringType } from '@/src/types/kiln';
import type { Piece, Stage } from '@/src/types/pieces';
import { FIRING_SOURCE_STAGE } from '../constants';

export type ReadyQueueSort = 'longest' | 'newest';

export function getAssignedPieceIds(firings: readonly Firing[]): Set<number> {
  const ids = new Set<number>();
  firings
    .filter((firing) => firing.state !== 'completed')
    .forEach((firing) => firing.pieceIds.forEach((pieceId) => ids.add(pieceId)));
  return ids;
}

export function getReadyStageForFiringType(type: FiringType): Stage | undefined {
  return FIRING_SOURCE_STAGE[type];
}

export function getQueueEnteredAt(piece: Piece, queueStage: Stage): string {
  for (let index = piece.timeline.length - 1; index >= 0; index -= 1) {
    const timelineEntry = piece.timeline[index];
    if (timelineEntry.stage === queueStage) {
      return timelineEntry.timestamp;
    }
  }
  return piece.createdAt;
}

/** Pieces ready for a firing type — same pool as the Kiln tab Queue. */
export function getReadyQueuePieces({
  pieces,
  firingType,
  firings,
  sort = 'longest',
}: {
  pieces: readonly Piece[];
  firingType: FiringType;
  firings: readonly Firing[];
  sort?: ReadyQueueSort;
}): Piece[] {
  const readyStage = getReadyStageForFiringType(firingType);
  if (!readyStage) return [];

  const assignedPieceIds = getAssignedPieceIds(firings);
  const ready = pieces.filter(
    (piece) => piece.stage === readyStage && !assignedPieceIds.has(piece.id),
  );

  return [...ready].sort((a, b) => {
    const aEnteredAt = new Date(getQueueEnteredAt(a, readyStage)).getTime();
    const bEnteredAt = new Date(getQueueEnteredAt(b, readyStage)).getTime();
    return sort === 'longest' ? aEnteredAt - bEnteredAt : bEnteredAt - aEnteredAt;
  });
}

export function getReadyQueueEmptyMessage(firingType: FiringType): string {
  const readyStage = getReadyStageForFiringType(firingType);
  if (readyStage === 'bone-dry') {
    return 'No bone-dry pieces ready for bisque. Move pieces to bone-dry in Pieces, or check the Queue tab.';
  }
  if (readyStage === 'glazing') {
    return 'No glazing pieces ready to fire. Move pieces to glazing in Pieces, or check the Queue tab.';
  }
  return 'No pieces are ready for this firing type yet.';
}
