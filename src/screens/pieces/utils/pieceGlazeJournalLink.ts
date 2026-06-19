import { formatGlazeDisplayName } from '@/src/screens/library/atlas/glazeListUtils';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { resolveGlazePhotoUri } from '@/src/screens/glazes/glazePieceLink';
import type { Piece } from '@/src/types/pieces';
import { GLAZE_OUTCOME_LABELS } from './constants';

export type PieceGlazeJournalLink = {
  glazeId: string;
  name: string;
  batchId?: string;
  outcomeLabel?: string;
  photoUri?: string;
};

export function resolvePieceGlazeJournalLink(
  piece: Piece,
  glazes: GlazeLibraryItem[],
): PieceGlazeJournalLink | null {
  if (!piece.glazeId) return null;

  const glaze = glazes.find((item) => item.id === piece.glazeId);
  if (!glaze) {
    return {
      glazeId: piece.glazeId,
      name: 'Unknown glaze batch',
      outcomeLabel: piece.glazeOutcome ? GLAZE_OUTCOME_LABELS[piece.glazeOutcome] : undefined,
    };
  }

  return {
    glazeId: glaze.id,
    name: formatGlazeDisplayName(glaze),
    batchId: glaze.batchId,
    outcomeLabel: piece.glazeOutcome ? GLAZE_OUTCOME_LABELS[piece.glazeOutcome] : undefined,
    photoUri: resolveGlazePhotoUri(glaze),
  };
}
