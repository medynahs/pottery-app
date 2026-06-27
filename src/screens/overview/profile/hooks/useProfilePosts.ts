import {
  apiListMyPosts,
  CommunityApiError,
  type BackendFeedPost,
} from '@/src/services/community';
import { useAppStore } from '@/src/store/appStore';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  getCachedProfilePosts,
  mergeProfilePosts,
} from '../utils/profilePostCache';

export function useProfilePosts() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const communityFeedRevision = useAppStore((s) => s.communityFeedRevision);
  const [posts, setPosts] = useState<BackendFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);

  const load = useCallback(async (options?: { background?: boolean }) => {
    if (!isSignedIn) {
      setPosts([]);
      setLoading(false);
      return;
    }

    if (options?.background) {
      setIsReloading(true);
    } else {
      setLoading(true);
    }

    const cached = getCachedProfilePosts();

    try {
      const page = await apiListMyPosts({ limit: 50 });
      const serverPosts = page.items ?? page.posts ?? [];
      setPosts(mergeProfilePosts(serverPosts, cached));
    } catch (e) {
      const details = e instanceof CommunityApiError ? e.details : null;
      if (__DEV__) {
        console.warn(
          '[useProfilePosts] GET /users/me/posts failed',
          e instanceof CommunityApiError ? e.message : e,
          details ? `(${details})` : '',
        );
      }

      // Backend 500 (often missing DB columns) — show cached posts if we have them.
      setPosts(cached);
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  }, [isSignedIn]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    if (communityFeedRevision === 0) return;
    void load({ background: true });
  }, [communityFeedRevision, load]);

  const reload = useCallback(() => load({ background: true }), [load]);

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return { posts, loading, reload, isReloading, removePost };
}
