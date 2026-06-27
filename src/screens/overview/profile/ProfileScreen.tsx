import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { ProfileDeletionGraceBanner } from './components/ProfileDeletionGraceBanner';
import { ProfileFreeTierPromo } from './components/ProfileFreeTierPromo';
import { ProfileGrid } from './components/ProfileGrid';
import { ProfileHeader } from './components/ProfileHeader';
import { useProfilePosts } from './hooks/useProfilePosts';

export default function ProfileScreen() {
  const router = useRouter();
  const meQuery = useCurrentUser();
  const { PaywallGate } = usePremiumGate();
  const { posts, loading, reload, isReloading } = useProfilePosts();

  const onRefresh = useCallback(async () => {
    await Promise.all([meQuery.refetch(), reload()]);
  }, [meQuery.refetch, reload]);

  const refreshing = meQuery.isFetching || isReloading;

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ProfileHeader
        postCount={loading ? null : posts.length}
        onBack={() => router.back()}
        onOpenAccountSettings={() => router.push('/account-settings')}
        onOpenPosts={() => router.push('/profile/posts' as never)}
        onOpenJourney={() => router.push('/profile/journey' as never)}
      />

      <ProfileDeletionGraceBanner />
      <ProfileFreeTierPromo />

      <ProfileGrid posts={posts} loading={loading} />
      {PaywallGate}
      <View className="h-8" />
    </ScrollView>
  );
}
