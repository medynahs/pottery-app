import type { Piece } from '@/src/types/pieces';

/** Returns true when the piece matches a free-text query against name and notes. */
export function pieceMatchesSearch(piece: Piece, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (piece.name.toLowerCase().includes(q)) return true;
  if (piece.description?.toLowerCase().includes(q)) return true;
  if (piece.notes?.toLowerCase().includes(q)) return true;

  for (const entry of piece.timeline) {
    if (entry.notes?.toLowerCase().includes(q)) return true;
  }

  return false;
}
