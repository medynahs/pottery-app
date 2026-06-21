import { apiListMyPosts, type BackendFeedPost } from '@/src/services/community';
import { useAppStore } from '@/src/store/appStore';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useProfilePosts() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const [posts, setPosts] = useState<BackendFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (options?: { background?: boolean }) => {
    if (!sessionToken) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setError(null);
    if (options?.background) {
      setIsReloading(true);
    } else {
      setLoading(true);
    }
    try {
      const page = await apiListMyPosts(sessionToken, { limit: 50 });
      setPosts(page.items ?? page.posts ?? []);
    } catch (e) {
      console.error('[useProfilePosts] load error:', e);
      setError('Could not load posts.');
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  }, [sessionToken]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const reload = useCallback(() => load({ background: true }), [load]);

  return { posts, loading, error, reload, isReloading, sessionToken };
}
