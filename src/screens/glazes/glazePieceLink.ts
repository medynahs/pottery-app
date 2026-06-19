import { glazeCardColor } from '@/src/screens/library/atlas/helpers';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import type { GlazeOutcome, Piece } from '@/src/types/pieces';

export function resolveGlazePhotoUri(glaze: GlazeLibraryItem): string | undefined {
  return glaze.bucketPhotoUri ?? glaze.testTilePhotoUris[0];
}

export function selectPiecesByGlazeId(pieces: Piece[], glazeId: string): Piece[] {
  return pieces.filter((piece) => !piece.deleted && piece.glazeId === glazeId);
}

export function summarizeGlazePieceOutcomes(pieces: Piece[]) {
  const linked = pieces.filter((piece) => piece.glazeId);
  const successCount = linked.filter((piece) => piece.glazeOutcome === 'success').length;
  const crawlingCount = linked.filter((piece) => piece.glazeOutcome === 'crawling').length;
  const underfiredCount = linked.filter((piece) => piece.glazeOutcome === 'underfired').length;
  const crackCount = linked.filter((piece) => piece.glazeOutcome === 'crack').length;
  const withOutcome = linked.filter((piece) => piece.glazeOutcome).length;

  return {
    total: linked.length,
    successCount,
    crawlingCount,
    underfiredCount,
    crackCount,
    withOutcome,
  };
}

export function glazeCardColorForItem(glaze: GlazeLibraryItem): string {
  return glazeCardColor(glaze.colorFamily);
}

export function isGlazeOutcome(value: string): value is GlazeOutcome {
  return value === 'success' || value === 'crawling' || value === 'underfired' || value === 'crack';
}
