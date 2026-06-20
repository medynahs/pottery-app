import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { Text } from '@/src/components/ui/text';
import { useCommunityComposer } from '@/src/hooks/useCommunityComposer';
import { apiListMyPosts, type BackendFeedPost } from '@/src/services/community';
import { useAppStore } from '@/src/store/appStore';
import { useFocusEffect } from 'expo-router';
import { Grid3X3, LayoutList, PenLine, Plus } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import {
  ProfilePostCard,
  ProfilePostGridTile,
  summarizePosts,
} from '../components/ProfilePostCard';
import { PROFILE_THEME } from '../profileTheme';

type ViewMode = 'grid' | 'list';

function PostsEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <View
      className="mx-4 rounded-[24px] border items-center px-6 py-10"
      style={{
        backgroundColor: PROFILE_THEME.cardBg,
        borderColor: PROFILE_THEME.cardBorder,
      }}
    >
      <View
        className="w-16 h-16 rounded-[22px] items-center justify-center mb-4"
        style={{ backgroundColor: PROFILE_THEME.accentSoft }}
      >
        <PenLine size={28} color={PROFILE_THEME.accent} />
      </View>
      <Text className="font-serif text-xl font-bold text-center mb-2" style={{ color: PROFILE_THEME.ink }}>
        Your public archive
      </Text>
      <Text className="text-sm text-center leading-5 mb-6" style={{ color: PROFILE_THEME.inkMuted }}>
        Piece journals, firings, and studio updates you share with the community live here.
      </Text>
      <TouchableOpacity
        onPress={onCreate}
        activeOpacity={0.85}
        className="flex-row items-center gap-2 px-5 py-3 rounded-2xl"
        style={{ backgroundColor: PROFILE_THEME.chipActiveBg }}
      >
        <Plus size={16} color={PROFILE_THEME.heroText} />
        <Text className="text-sm font-bold" style={{ color: PROFILE_THEME.heroText }}>
          Create your first post
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function PostsSummaryBar({
  postCount,
  reactions,
  comments,
  viewMode,
  onViewModeChange,
  onCreate,
}: {
  postCount: number;
  reactions: number;
  comments: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreate: () => void;
}) {
  return (
    <View
      className="mx-4 mb-4 rounded-[20px] border px-4 py-3.5"
      style={{ backgroundColor: PROFILE_THEME.cardBg, borderColor: PROFILE_THEME.cardBorder }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="font-serif text-lg font-bold" style={{ color: PROFILE_THEME.ink }}>
            {postCount} post{postCount === 1 ? '' : 's'}
          </Text>
          <Text className="text-[11px] mt-0.5" style={{ color: PROFILE_THEME.inkMuted }}>
            {reactions} reactions · {comments} comments
          </Text>
        </View>
        <TouchableOpacity
          onPress={onCreate}
          activeOpacity={0.85}
          className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl border"
          style={{ backgroundColor: PROFILE_THEME.accentSoft, borderColor: PROFILE_THEME.cardBorder }}
        >
          <Plus size={14} color={PROFILE_THEME.accent} />
          <Text className="text-xs font-bold" style={{ color: PROFILE_THEME.ink }}>New</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2">
        {([
          { mode: 'grid' as const, icon: Grid3X3, label: 'Grid' },
          { mode: 'list' as const, icon: LayoutList, label: 'List' },
        ]).map(({ mode, icon: Icon, label }) => {
          const active = viewMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              onPress={() => onViewModeChange(mode)}
              activeOpacity={0.82}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-xl border"
              style={{
                backgroundColor: active ? PROFILE_THEME.chipActiveBg : PROFILE_THEME.chipIdleBg,
                borderColor: active ? PROFILE_THEME.chipActiveBg : PROFILE_THEME.cardBorder,
              }}
            >
              <Icon size={14} color={active ? PROFILE_THEME.heroText : PROFILE_THEME.inkSoft} />
              <Text className="text-xs font-semibold" style={{ color: active ? PROFILE_THEME.heroText : PROFILE_THEME.inkSoft }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function PostsTab() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const openComposer = useCommunityComposer();
  const [posts, setPosts] = useState<BackendFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

  const summary = useMemo(() => summarizePosts(posts), [posts]);
  const handleCreate = useCallback(() => openComposer({ kind: 'update' }), [openComposer]);

  if (loading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator size="large" color={PROFILE_THEME.accent} />
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
    return <PostsEmpty onCreate={handleCreate} />;
  }

  return (
    <View className="pb-6">
      <PostsSummaryBar
        postCount={posts.length}
        reactions={summary.reactions}
        comments={summary.comments}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreate={handleCreate}
      />

      {viewMode === 'grid' ? (
        <View className="px-4 gap-2">
          {Array.from({ length: Math.ceil(posts.length / 2) }, (_, rowIndex) => {
            const row = posts.slice(rowIndex * 2, rowIndex * 2 + 2);
            return (
              <View key={row.map((p) => p.id).join('-')} className="flex-row gap-2">
                {row.map((post) => (
                  <View key={post.id} style={{ flex: 1 }}>
                    <ProfilePostGridTile post={post} />
                  </View>
                ))}
                {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
              </View>
            );
          })}
        </View>
      ) : (
        <View className="px-4">
          {posts.map((post) => (
            <ProfilePostCard key={post.id} post={post} />
          ))}
        </View>
      )}
    </View>
  );
}
