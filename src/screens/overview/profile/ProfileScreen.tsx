import { Text } from '@/src/components/ui/text';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Crown } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { ProfileGrid } from './components/ProfileGrid';
import { ProfileHeader } from './components/ProfileHeader';
import { useProfilePosts } from './hooks/useProfilePosts';

export default function ProfileScreen() {
  const router = useRouter();
  const meQuery = useCurrentUser();
  const isPremium = useAppStore((s) => s.isPremium);
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

      {!isPremium && (
        <TouchableOpacity
          onPress={() => router.push('/premium')}
          activeOpacity={0.8}
          style={{
            marginHorizontal: 16,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FEF9ED',
            borderWidth: 1,
            borderColor: '#E8D9BE',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Crown size={16} color="hsl(39, 57%, 51%)" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'hsl(24, 25%, 15%)' }}>
              Upgrade to Premium
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: 'hsl(24, 20%, 45%)' }}>Unlock all features →</Text>
        </TouchableOpacity>
      )}

      <ProfileGrid posts={posts} loading={loading} />
      {PaywallGate}
      <View className="h-8" />
    </ScrollView>
  );
}
