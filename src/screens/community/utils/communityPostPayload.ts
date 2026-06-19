import type { CommunityPostKind } from '@/src/screens/community/utils/createPostCompose';

export const COMMUNITY_POST_META_START = '---pottery-life-community-post:v1---';
export const COMMUNITY_POST_META_END = '---end-pottery-life-community-post---';

/** @deprecated Legacy piece-journal embed; still parsed. */
export const PIECE_JOURNAL_POST_START = '---pottery-life-piece-journal:v1---';

export type CommunityPostMeta = {
  v: 1;
  postKind: CommunityPostKind;
  pieceJournal?: {
    pieceId: number;
    pieceName: string;
  };
  kilnFiring?: {
    firingId: string;
    firingName: string;
    firingType: string;
    cone: string;
    pieceIds: number[];
    pieceNames: string[];
  };
  challenge?: {
    challengeId: string;
    title: string;
    hashtag: string;
  };
  ask?: {
    topic?: 'glaze' | 'firing' | 'general';
  };
};

export function buildCommunityPostMeta(input: {
  postKind: CommunityPostKind;
  pieceJournal?: CommunityPostMeta['pieceJournal'];
  kilnFiring?: CommunityPostMeta['kilnFiring'];
  challenge?: CommunityPostMeta['challenge'];
  ask?: CommunityPostMeta['ask'];
}): CommunityPostMeta {
  return {
    v: 1,
    postKind: input.postKind,
    pieceJournal: input.pieceJournal,
    kilnFiring: input.kilnFiring,
    challenge: input.challenge,
    ask: input.ask,
  };
}

export function embedCommunityPostMeta(content: string, meta: CommunityPostMeta | null): string {
  if (!meta) return content.trim();
  const json = JSON.stringify(meta);
  return `${content.trim()}\n\n${COMMUNITY_POST_META_START}\n${json}\n${COMMUNITY_POST_META_END}`;
}

export function parseCommunityPostMeta(content: string): CommunityPostMeta | null {
  const start = content.indexOf(COMMUNITY_POST_META_START);
  if (start < 0) return parseLegacyPieceJournalPayload(content);
  const after = content.slice(start + COMMUNITY_POST_META_START.length);
  const end = after.indexOf(COMMUNITY_POST_META_END);
  const json = (end >= 0 ? after.slice(0, end) : after).trim();
  try {
    const parsed = JSON.parse(json) as CommunityPostMeta;
    if (parsed?.v === 1 && parsed.postKind) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function parseLegacyPieceJournalPayload(content: string): CommunityPostMeta | null {
  const legacyStart = content.indexOf(PIECE_JOURNAL_POST_START);
  if (legacyStart < 0) return null;
  const after = content.slice(legacyStart + PIECE_JOURNAL_POST_START.length);
  const end = after.indexOf('---end-pottery-life-piece-journal---');
  const json = (end >= 0 ? after.slice(0, end) : after).trim();
  try {
    const parsed = JSON.parse(json) as { pieceId?: number; pieceName?: string; kind?: string };
    if (parsed?.pieceId && parsed.pieceName) {
      return {
        v: 1,
        postKind: 'piece_journal',
        pieceJournal: { pieceId: parsed.pieceId, pieceName: parsed.pieceName },
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function stripCommunityPostMeta(content: string): string {
  let trimmed = content.trim();
  const unifiedStart = trimmed.indexOf(COMMUNITY_POST_META_START);
  if (unifiedStart >= 0) trimmed = trimmed.slice(0, unifiedStart).trim();
  const legacyStart = trimmed.indexOf(PIECE_JOURNAL_POST_START);
  if (legacyStart >= 0) trimmed = trimmed.slice(0, legacyStart).trim();
  return trimmed;
}
