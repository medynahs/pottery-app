// src/screens/community/components/FeedPostCard.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { apiAddReaction, apiRemoveReaction } from '@/src/services/community';
import { Image } from 'expo-image';
import { Heart, MessageCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { BackendFeedPost } from '../../../services/community';

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  post: BackendFeedPost;
  sessionToken: string;
}

export function FeedPostCard({ post, sessionToken }: Props) {
  const firstAsset = post.assets[0];
  const initial = post.user_id.slice(0, 1).toUpperCase();

  // ── Optimistic reaction state ──
  const [hasReacted, setHasReacted] = useState(post.has_reacted);
  const [reactionCount, setReactionCount] = useState(post.reaction_count);
  const [reacting, setReacting] = useState(false);

  const handleReaction = async () => {
    if (reacting) return;
    setReacting(true);
    const next = !hasReacted;
    // Optimistic update
    setHasReacted(next);
    setReactionCount((c) => c + (next ? 1 : -1));
    try {
      if (next) {
        await apiAddReaction(sessionToken, post.id);
      } else {
        await apiRemoveReaction(sessionToken, post.id);
      }
    } catch {
      // Revert on failure
      setHasReacted(!next);
      setReactionCount((c) => c + (next ? -1 : 1));
    } finally {
      setReacting(false);
    }
  };

  return (
    <Card className="p-4">
      <View className="flex-row items-center gap-3 mb-3">
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: 'hsl(24 35% 76%)' }}
        >
          <Text className="text-sm font-bold text-white">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-foreground">Community Member</Text>
          <Text className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</Text>
        </View>
      </View>

      {firstAsset && (
        <Image
          source={{ uri: firstAsset.url }}
          style={{ height: 200, borderRadius: 12, marginBottom: 10 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      )}

      {post.content ? (
        <Text className="text-sm text-foreground leading-relaxed mb-3">{post.content}</Text>
      ) : null}

      <View className="flex-row items-center gap-4">
        <TouchableOpacity
          onPress={handleReaction}
          disabled={reacting}
          className="flex-row items-center gap-1.5"
          activeOpacity={0.7}
        >
          <Heart
            size={15}
            color={hasReacted ? 'hsl(15 80% 55%)' : 'hsl(24 20% 55%)'}
            fill={hasReacted ? 'hsl(15 80% 55%)' : 'transparent'}
          />
          <Text className="text-xs text-muted-foreground">{reactionCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
          <MessageCircle size={15} color="hsl(24 20% 55%)" />
          <Text className="text-xs text-muted-foreground">{post.comment_count}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
