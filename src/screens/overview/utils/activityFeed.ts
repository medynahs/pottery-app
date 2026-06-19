import type { Piece } from '@/src/types/pieces';

export type ActivityEntry = {
  id: string;
  pieceId: number;
  pieceName: string;
  piecePhoto?: string;
  stage: string;
  timestamp: string;
  daysAgo: number;
};

export function buildActivityFeed(pieces: Piece[], limit = 8): ActivityEntry[] {
  const now = new Date();
  const entries: ActivityEntry[] = [];
  for (const piece of pieces) {
    for (const entry of piece.timeline) {
      if (!entry.timestamp) continue;
      const t = new Date(entry.timestamp);
      if (Number.isNaN(t.getTime())) continue;
      entries.push({
        id: `${piece.id}-${entry.stage}-${entry.timestamp}`,
        pieceId: piece.id,
        pieceName: piece.name,
        piecePhoto: piece.photo ?? piece.imgUrl,
        stage: entry.stage,
        timestamp: entry.timestamp,
        daysAgo: Math.floor((now.getTime() - t.getTime()) / (1000 * 60 * 60 * 24)),
      });
    }
  }
  return entries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
