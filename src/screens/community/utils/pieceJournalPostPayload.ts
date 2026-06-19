import type { Piece } from '@/src/types/pieces';

export const PIECE_JOURNAL_POST_START = '---pottery-life-piece-journal:v1---';
export const PIECE_JOURNAL_POST_END = '---end-pottery-life-piece-journal---';

export type CommunityPieceJournalPayload = {
  v: 1;
  kind: 'piece-journal';
  pieceId: number;
  pieceName: string;
  stage: string;
  clay: string;
  photoUri?: string;
};

export function buildPieceJournalPostPayload(piece: Piece): CommunityPieceJournalPayload {
  return {
    v: 1,
    kind: 'piece-journal',
    pieceId: piece.id,
    pieceName: piece.name,
    stage: piece.stage,
    clay: piece.clay,
  };
}

export function embedPieceJournalPayload(content: string, piece: Piece | null): string {
  if (!piece) return content;
  const json = JSON.stringify(buildPieceJournalPostPayload(piece));
  return `${content}\n\n${PIECE_JOURNAL_POST_START}\n${json}\n${PIECE_JOURNAL_POST_END}`;
}

export function stripPieceJournalPayload(content: string): string {
  const start = content.indexOf(PIECE_JOURNAL_POST_START);
  if (start < 0) return content.trim();
  return content.slice(0, start).trim();
}

export function parsePieceJournalFromPost(content: string): CommunityPieceJournalPayload | null {
  const start = content.indexOf(PIECE_JOURNAL_POST_START);
  if (start < 0) return null;
  const after = content.slice(start + PIECE_JOURNAL_POST_START.length);
  const end = after.indexOf(PIECE_JOURNAL_POST_END);
  const json = (end >= 0 ? after.slice(0, end) : after).trim();
  try {
    const parsed = JSON.parse(json) as CommunityPieceJournalPayload;
    if (parsed?.v === 1 && parsed.kind === 'piece-journal' && parsed.pieceId) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}
