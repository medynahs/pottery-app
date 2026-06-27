import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
  communityPostChallengeTitle,
  communityPostKindLabel,
  stripCommunityPostPayload,
} from '@/src/screens/community/utils/feedDisplayContent';
import { parseCommunityPostMeta } from '@/src/screens/community/utils/communityPostPayload';
import type { BackendFeedPost } from '@/src/services/community';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { postKindStyle } from '../profileTheme';

function PostKindIcon({ style, size }: { style: ReturnType<typeof postKindStyle>; size: number }) {
  const { Icon, accent } = style;
  return (
    <View
      className="items-center justify-center rounded-2xl bg-card border border-border"
      style={{
        width: size + 20,
        height: size + 20,
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
    const pieceJournal = meta?.pieceJournal ?? null;
    const challengeTitle = post.content ? communityPostChallengeTitle(post.content) : null;
    const firstAsset = post.assets?.[0];
    const style = postKindStyle(kindLabel);

    return {
      kindLabel,
      displayContent,
      pieceJournal,
      challengeTitle,
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
  const { kindLabel, displayContent, pieceJournal, challengeTitle, firstAsset, style } =
    usePostDisplay(post);

  const handleOpenJournal = () => {
    if (!pieceJournal) return;
    router.push(`/(tabs)/pieces?openJournalPieceId=${pieceJournal.pieceId}` as never);
  };

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} className="mb-3">
      <Card className="rounded-2xl overflow-hidden">
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
            className="w-full items-center justify-center bg-muted"
            style={{ height: 120 }}
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
            <Text className="text-[10px] text-muted-foreground">
              {timeAgo(post.created_at)}
            </Text>
          </View>

          {displayContent ? (
            <Text className="text-sm leading-5 mb-2 text-foreground" numberOfLines={3}>
              {displayContent}
            </Text>
          ) : null}

          {challengeTitle ? (
            <Text className="text-[10px] font-semibold mb-2 text-primary">
              Challenge · {challengeTitle}
            </Text>
          ) : null}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <Heart size={13} color="hsl(340 60% 55%)" />
                <Text className="text-[11px] text-muted-foreground">
                  {post.reaction_count ?? 0}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <MessageCircle size={13} color="hsl(24 20% 45%)" />
                <Text className="text-[11px] text-muted-foreground">
                  {post.comment_count ?? 0}
                </Text>
              </View>
            </View>
            {pieceJournal ? (
              <TouchableOpacity onPress={handleOpenJournal} activeOpacity={0.8}>
                <Text className="text-[11px] font-bold text-primary">
                  Open journal →
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export function ProfilePostGridTile({
  post,
  imageUri,
  size,
  onPress,
}: {
  post: BackendFeedPost;
  imageUri: string;
  size: number;
  onPress?: () => void;
}) {
  const assetCount = post.assets?.length ?? 0;

  const tile = (
    <View style={{ width: size, height: size }}>
      <Image
        source={{ uri: imageUri }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        cachePolicy="memory-disk"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
      {assetCount > 1 ? (
        <View
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <Text className="text-[9px] font-bold text-white">▦</Text>
        </View>
      ) : null}
      {(post.reaction_count ?? 0) > 0 ? (
        <View
          className="absolute bottom-1.5 left-1.5 flex-row items-center gap-1 px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <Heart size={10} color="white" />
          <Text className="text-[9px] font-bold text-white">{post.reaction_count}</Text>
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return tile;

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} accessibilityLabel="View post in feed">
      {tile}
    </TouchableOpacity>
  );
}

export function summarizePosts(posts: BackendFeedPost[]) {
  const reactions = posts.reduce((sum, p) => sum + (p.reaction_count ?? 0), 0);
  const comments = posts.reduce((sum, p) => sum + (p.comment_count ?? 0), 0);
  const withPhotos = posts.filter((p) => (p.assets?.length ?? 0) > 0).length;
  return { reactions, comments, withPhotos };
}
