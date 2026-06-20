import { Text } from '@/src/components/ui/text';
import {
  communityPostChallengeHashtag,
  communityPostKindLabel,
  stripCommunityPostPayload,
} from '@/src/screens/community/utils/feedDisplayContent';
import { parseCommunityPostMeta } from '@/src/screens/community/utils/communityPostPayload';
import { parsePieceJournalFromPost } from '@/src/screens/community/utils/pieceJournalPostPayload';
import type { BackendFeedPost } from '@/src/services/community';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { postKindStyle, PROFILE_THEME } from '../profileTheme';

function PostKindIcon({ style, size }: { style: ReturnType<typeof postKindStyle>; size: number }) {
  const { Icon, accent } = style;
  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{
        width: size + 20,
        height: size + 20,
        backgroundColor: PROFILE_THEME.cardBg,
        borderWidth: 1,
        borderColor: style.border,
      }}
    >
      <Icon size={size} color={accent} />
    </View>
  );
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function usePostDisplay(post: BackendFeedPost) {
  return useMemo(() => {
    const kindLabel = post.content ? communityPostKindLabel(post.content) : null;
    const displayContent = post.content ? stripCommunityPostPayload(post.content) : '';
    const meta = post.content ? parseCommunityPostMeta(post.content) : null;
    const legacyJournal = post.content ? parsePieceJournalFromPost(post.content) : null;
    const pieceJournal = meta?.pieceJournal ?? (legacyJournal
      ? { pieceId: legacyJournal.pieceId, pieceName: legacyJournal.pieceName }
      : null);
    const challengeTag = post.content ? communityPostChallengeHashtag(post.content) : null;
    const firstAsset = post.assets?.[0];
    const style = postKindStyle(kindLabel);

    return {
      kindLabel,
      displayContent,
      pieceJournal,
      challengeTag,
      firstAsset,
      style,
    };
  }, [post]);
}

export function ProfilePostCard({
  post,
  onPress,
}: {
  post: BackendFeedPost;
  onPress?: () => void;
}) {
  const router = useRouter();
  const { kindLabel, displayContent, pieceJournal, challengeTag, firstAsset, style } = usePostDisplay(post);

  const handleOpenJournal = () => {
    if (!pieceJournal) return;
    router.push(`/(tabs)/pieces?openJournalPieceId=${pieceJournal.pieceId}` as never);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="rounded-[22px] border overflow-hidden mb-3"
      style={{
        backgroundColor: PROFILE_THEME.cardBg,
        borderColor: PROFILE_THEME.cardBorder,
        shadowColor: PROFILE_THEME.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {firstAsset ? (
        <Image
          source={{ uri: firstAsset.url }}
          style={{ width: '100%', height: 168 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : (
        <View
          className="w-full items-center justify-center"
          style={{ height: 120, backgroundColor: style.bg }}
        >
          <PostKindIcon style={style} size={24} />
        </View>
      )}

      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <View
            className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border"
            style={{ backgroundColor: style.bg, borderColor: style.border }}
          >
            <style.Icon size={11} color={style.accent} />
            <Text className="text-[10px] font-bold" style={{ color: style.text }}>
              {kindLabel ?? 'Update'}
            </Text>
          </View>
          <Text className="text-[10px]" style={{ color: PROFILE_THEME.inkMuted }}>
            {timeAgo(post.created_at)}
          </Text>
        </View>

        {displayContent ? (
          <Text
            className="text-sm leading-5 mb-2"
            style={{ color: PROFILE_THEME.ink }}
            numberOfLines={3}
          >
            {displayContent}
          </Text>
        ) : null}

        {challengeTag ? (
          <Text className="text-[10px] font-semibold mb-2" style={{ color: PROFILE_THEME.accent }}>
            {challengeTag}
          </Text>
        ) : null}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Heart size={13} color="hsl(340 60% 55%)" />
              <Text className="text-[11px]" style={{ color: PROFILE_THEME.inkMuted }}>
                {post.reaction_count ?? 0}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MessageCircle size={13} color={PROFILE_THEME.inkMuted} />
              <Text className="text-[11px]" style={{ color: PROFILE_THEME.inkMuted }}>
                {post.comment_count ?? 0}
              </Text>
            </View>
          </View>
          {pieceJournal ? (
            <TouchableOpacity onPress={handleOpenJournal} activeOpacity={0.8}>
              <Text className="text-[11px] font-bold" style={{ color: PROFILE_THEME.accent }}>
                Open journal →
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ProfilePostGridTile({ post }: { post: BackendFeedPost }) {
  const { kindLabel, firstAsset, style } = usePostDisplay(post);

  return (
    <View
      className="rounded-[16px] overflow-hidden border"
      style={{
        flex: 1,
        aspectRatio: 1,
        backgroundColor: style.bg,
        borderColor: PROFILE_THEME.cardBorder,
      }}
    >
      {firstAsset ? (
        <Image
          source={{ uri: firstAsset.url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <PostKindIcon style={style} size={20} />
        </View>
      )}
      <View
        className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      >
        <Text className="text-[9px] font-bold text-white">{kindLabel ?? 'Post'}</Text>
      </View>
      {(post.reaction_count ?? 0) > 0 ? (
        <View
          className="absolute bottom-2 right-2 flex-row items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <Heart size={10} color="white" />
          <Text className="text-[9px] font-bold text-white">{post.reaction_count}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function summarizePosts(posts: BackendFeedPost[]) {
  const reactions = posts.reduce((sum, p) => sum + (p.reaction_count ?? 0), 0);
  const comments = posts.reduce((sum, p) => sum + (p.comment_count ?? 0), 0);
  const withPhotos = posts.filter((p) => (p.assets?.length ?? 0) > 0).length;
  return { reactions, comments, withPhotos };
}
