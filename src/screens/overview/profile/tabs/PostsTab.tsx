import { EmptyState } from '@/src/components/EmptyState';
import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { FeedPostCard } from '@/src/screens/community/components/FeedPostCard';
import { useCommunityComposer } from '@/src/hooks/useCommunityComposer';
import { apiListMyPosts, type BackendFeedPost } from '@/src/services/community';
import { useAppStore } from '@/src/store/appStore';
import { useFocusEffect } from 'expo-router';
import { PenLine, Plus } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

function ComposeBar({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="mx-6 mb-4 rounded-2xl px-4 py-3.5">
      <TouchableOpacity
        onPress={onCreate}
        activeOpacity={0.85}
        className="flex-row items-center gap-3"
      >
        <View className="flex-1 rounded-2xl border border-border bg-muted/50 px-4 py-3">
          <Text className="text-sm text-muted-foreground">Share an update with the community…</Text>
        </View>
        <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center">
          <Plus size={18} color="white" />
        </View>
      </TouchableOpacity>
    </Card>
  );
}

export function PostsTab() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const openComposer = useCommunityComposer();
  const [posts, setPosts] = useState<BackendFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionToken) {
      setPosts([]);
      setLoading(false);
      return;
    }
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

  const handleCreate = useCallback(() => openComposer({ kind: 'update' }), [openComposer]);

  if (loading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator size="large" color="hsl(39 57% 51%)" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-8 px-6">
        <InlineErrorCard message={error} onRetry={load} />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View>
        <ComposeBar onCreate={handleCreate} />
        <EmptyState
          icon={PenLine}
          title="Your studio feed"
          description="Piece journals, firings, glaze recipes, and studio updates you share live here — just like the community feed."
          ctaLabel="Create your first post"
          ctaIcon={Plus}
          onCtaPress={handleCreate}
        />
      </View>
    );
  }

  return (
    <View className="pb-6">
      <ComposeBar onCreate={handleCreate} />

      <View className="px-6 gap-3">
        {posts.map((post) => (
          <FeedPostCard key={post.id} post={post} sessionToken={sessionToken ?? ''} />
        ))}
      </View>
    </View>
  );
}
