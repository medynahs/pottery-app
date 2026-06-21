import { ImageLightbox } from '@/src/components/ImageLightbox';
import { Text } from '@/src/components/ui/text';
import { useCommunityComposer } from '@/src/hooks/useCommunityComposer';
import type { BackendFeedPost } from '@/src/services/community';
import { useVisiblePieces } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { ProfilePostGridTile } from './ProfilePostCard';
import {
  getPostsForProfileGrid,
  resolvePostGridImage,
} from '../utils/postGridImage';

const GRID_GAP = 1;
const GRID_COLUMNS = 3;

type ProfileGridProps = {
  posts: BackendFeedPost[];
  loading: boolean;
};

export function ProfileGrid({ posts, loading }: ProfileGridProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pieces = useVisiblePieces();
  const openComposer = useCommunityComposer();

  const gridPosts = useMemo(
    () => getPostsForProfileGrid(posts, pieces),
    [posts, pieces],
  );

  const tileSize = useMemo(() => {
    const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
    return Math.floor((width - totalGap) / GRID_COLUMNS);
  }, [width]);

  const [lightbox, setLightbox] = useState<{ uri: string; caption?: string } | null>(null);

  const handleCreate = () => openComposer({ kind: 'update' });

  if (loading && posts.length === 0) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator size="small" color="hsl(39 57% 51%)" />
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-center justify-end px-4 py-2 border-b border-border">
        <TouchableOpacity
          onPress={handleCreate}
          activeOpacity={0.75}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Create post"
          className="w-9 h-9 items-center justify-center"
        >
          <Plus size={22} color="hsl(24 25% 15%)" />
        </TouchableOpacity>
      </View>

      {gridPosts.length === 0 ? (
        <View className="px-6 py-10 items-center">
          {posts.length === 0 ? (
            <>
              <Text className="text-sm text-muted-foreground text-center leading-5">
                Share piece journals, firings, and studio updates to build your profile.
              </Text>
              <TouchableOpacity
                onPress={handleCreate}
                activeOpacity={0.85}
                className="mt-4 px-4 py-2.5 rounded-xl bg-primary"
              >
                <Text className="text-xs font-bold text-white">Create your first post</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-sm text-muted-foreground text-center leading-5">
                Add a photo when you share to show work on your grid. Text-only posts live in your archive.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/profile/posts' as never)}
                activeOpacity={0.85}
                className="mt-4"
              >
                <Text className="text-xs font-bold text-primary">
                  View {posts.length} post{posts.length === 1 ? '' : 's'} →
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
          {gridPosts.map((post) => {
            const imageUri = resolvePostGridImage(post, pieces)!;
            return (
              <ProfilePostGridTile
                key={post.id}
                post={post}
                imageUri={imageUri}
                size={tileSize}
                onPress={() => setLightbox({ uri: imageUri })}
              />
            );
          })}
        </View>
      )}

      <ImageLightbox
        visible={lightbox != null}
        uri={lightbox?.uri}
        caption={lightbox?.caption}
        onClose={() => setLightbox(null)}
      />
    </View>
  );
}
