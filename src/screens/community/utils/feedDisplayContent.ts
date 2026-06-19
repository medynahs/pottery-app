import { stripPayloadFromDisplay as stripGlazePayload } from '@/src/screens/glazes/shareGlazeRecipe/glazePostPayload';
import { parseCommunityPostMeta, stripCommunityPostMeta } from '@/src/screens/community/utils/communityPostPayload';

export function stripCommunityPostPayload(content: string): string {
  return stripCommunityPostMeta(stripGlazePayload(content));
}

export function communityPostKindLabel(content: string): string | null {
  const meta = parseCommunityPostMeta(content);
  if (meta) {
    switch (meta.postKind) {
      case 'piece_journal':
        return 'Piece journal';
      case 'studio_notice':
        return 'Studio notice';
      case 'ask_community':
        return 'Ask the community';
      case 'kiln_firing':
        return 'Firing complete';
      default:
        break;
    }
  }

  const visible = stripCommunityPostPayload(content);
  if (visible.startsWith('📌 Studio notice')) return 'Studio notice';
  if (visible.startsWith('📖')) return 'Piece journal';
  if (visible.startsWith('❓ Ask the community')) return 'Ask the community';
  if (visible.startsWith('🔥 Firing complete')) return 'Firing complete';
  if (visible.includes('<!-- pottery-life-glaze:v1') || visible.includes('---pottery-life-glaze:v1---')) {
    return 'Glaze recipe';
  }
  return null;
}

export function communityPostAskTopicLabel(content: string): string | null {
  const meta = parseCommunityPostMeta(content);
  if (!meta?.ask?.topic) return null;
  if (meta.ask.topic === 'glaze') return 'Glaze / surface';
  if (meta.ask.topic === 'firing') return 'Firing / kiln';
  return 'General';
}

export function communityPostChallengeHashtag(content: string): string | null {
  return parseCommunityPostMeta(content)?.challenge?.hashtag ?? null;
}
