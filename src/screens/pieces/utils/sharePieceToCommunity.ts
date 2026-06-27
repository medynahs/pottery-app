import { resolvePieceJournalPhoto } from '@/src/screens/community/utils/createPostCompose';
import type { CommunityPostComposerPreset } from '@/src/screens/community/types/composerPreset';
import type { Piece } from '@/src/types/pieces';

export function buildPieceSharePreset(piece: Piece): CommunityPostComposerPreset {
  return {
    kind: 'piece_journal',
    pieceId: piece.id,
    photoUri: resolvePieceJournalPhoto(piece),
  };
}
