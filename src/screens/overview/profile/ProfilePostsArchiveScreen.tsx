import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { DetailScreenShell } from '@/src/components/DetailScreenShell';
import { Text } from '@/src/components/ui/text';
import { FeedPostCard } from '@/src/screens/community/components/FeedPostCard';
import { useCommunityComposer } from '@/src/hooks/useCommunityComposer';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { summarizePosts } from './components/ProfilePostCard';
import { useProfilePosts } from './hooks/useProfilePosts';

export default function ProfilePostsArchiveScreen() {
  const router = useRouter();
  const openComposer = useCommunityComposer();
  const { posts, loading, error, reload, removePost } = useProfilePosts();
  const summary = React.useMemo(() => summarizePosts(posts), [posts]);

  return (
    <DetailScreenShell
      title="Your posts"
      subtitle="Everything you've shared with the community"
      onBack={() => router.back()}
      headerRight={
        <TouchableOpacity
          onPress={() => openComposer({ kind: 'update' })}
          activeOpacity={0.75}
          className="w-9 h-9 rounded-full bg-primary items-center justify-center"
          accessibilityLabel="Create post"
        >
          <Plus size={18} color="white" />
        </TouchableOpacity>
      }
    >
      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color="hsl(39 57% 51%)" />
        </View>
      ) : error ? (
        <View className="px-6 py-8">
          <InlineErrorCard message={error} onRetry={reload} />
        </View>
      ) : posts.length === 0 ? (
        <View className="px-6 py-12 items-center">
          <Text className="text-sm text-muted-foreground text-center leading-5">
            No posts yet. Share a piece journal, firing, or studio update to build your profile grid.
          </Text>
          <TouchableOpacity
            onPress={() => openComposer({ kind: 'update' })}
            activeOpacity={0.85}
            className="mt-4 px-4 py-2.5 rounded-xl bg-primary"
          >
            <Text className="text-xs font-bold text-white">Create your first post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="px-4 gap-3 py-4 pb-8">
          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              onDeleted={removePost}
            />
          ))}
          {summary.reactions > 0 || summary.comments > 0 ? (
            <Text className="text-center text-[11px] text-muted-foreground mt-2">
              {summary.reactions} reactions · {summary.comments} comments
            </Text>
          ) : null}
        </View>
      )}
    </DetailScreenShell>
  );
}
