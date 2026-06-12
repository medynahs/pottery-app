import { EmptyState } from '@/src/components/EmptyState';
import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { Text } from '@/src/components/ui/text';
import { apiListMyPosts, type BackendFeedPost } from '@/src/services/community';
import { useAppStore } from '@/src/store/appStore';
import { useFocusEffect } from 'expo-router';
import { Heart, Image as ImageIcon, MessageCircle } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';

function relativeDate(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo}mo ago`;
    return `${Math.floor(mo / 12)}y ago`;
  } catch {
    return '';
  }
}

function PostCard({ post }: { post: BackendFeedPost }) {
  const assetCount = post.asset_ids?.length ?? post.assets?.length ?? 0;
  const reactionCount = post.reaction_count ?? 0;
  const commentCount = post.comment_count ?? 0;
  return (
    <View className="mx-6 mb-4 rounded-2xl border border-border bg-card overflow-hidden">
      <View className="p-4">
        {post.content ? (
          <Text className="text-sm text-foreground leading-relaxed mb-3">{post.content}</Text>
        ) : null}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Heart size={14} color="hsl(340 60% 55%)" />
              <Text className="text-xs text-muted-foreground">{reactionCount}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <MessageCircle size={14} color="hsl(213 60% 55%)" />
              <Text className="text-xs text-muted-foreground">{commentCount}</Text>
            </View>
            {assetCount > 0 && (
              <View className="flex-row items-center gap-1.5">
                <ImageIcon size={14} color="hsl(24 20% 55%)" />
                <Text className="text-xs text-muted-foreground">{assetCount}</Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-muted-foreground">{relativeDate(post.created_at)}</Text>
        </View>
      </View>
    </View>
  );
}

export function PostsTab() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const [posts, setPosts] = useState<BackendFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionToken) return;
    setError(null);
    setLoading(true);
    try {
      const page = await apiListMyPosts(sessionToken, { limit: 50 });
      setPosts(page.items ?? page.posts ?? []);
    } catch (e) {
      console.error('[PostsTab] load error:', e);
      setError('Could not load posts.');
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View className="flex-1 items-center py-16">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-8 px-4">
        <InlineErrorCard message={error} onRetry={load} />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Share updates, finished pieces, and discoveries with the community."
      />
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View className="pt-2 pb-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </View>
    </ScrollView>
  );
}
