import { parseCommunityPostMeta } from '@/src/screens/community/utils/communityPostPayload';
import { parsePieceJournalFromPost } from '@/src/screens/community/utils/pieceJournalPostPayload';
import type { BackendFeedPost } from '@/src/services/community';
import type { Piece } from '@/src/types/pieces';

/** Image URL for the profile photo grid — post asset first, then linked piece cover. */
export function resolvePostGridImage(
  post: BackendFeedPost,
  pieces: Piece[],
): string | null {
  const asset = post.assets?.[0]?.url;
  if (asset) return asset;

  const meta = post.content ? parseCommunityPostMeta(post.content) : null;
  const legacy = post.content ? parsePieceJournalFromPost(post.content) : null;
  const pieceId = meta?.pieceJournal?.pieceId ?? legacy?.pieceId;
  if (!pieceId) return null;

  const piece = pieces.find((p) => p.id === pieceId);
  return piece?.photo ?? piece?.imgUrl ?? null;
}

export function getPostsForProfileGrid(
  posts: BackendFeedPost[],
  pieces: Piece[],
): BackendFeedPost[] {
  return posts.filter((post) => resolvePostGridImage(post, pieces) != null);
}
