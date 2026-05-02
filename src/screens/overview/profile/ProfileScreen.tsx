import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Crown } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { TabBar } from '../../../config/TabBar';
import { ProfileHeader } from './components/ProfileHeader';
import type { Tab } from './mockedData/data';
import { JourneyTab } from './tabs/JourneyTab';
import { PortfolioTab } from './tabs/PortfolioTab';
import { PostsTab } from './tabs/PostsTab';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');
  const meQuery = useCurrentUser();
  const isPremium = useAppStore((s) => s.isPremium);

  const onRefresh = useCallback(async () => {
    await meQuery.refetch();
  }, [meQuery.refetch]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={meQuery.isFetching} onRefresh={onRefresh} />
      }
    >
      <ProfileHeader
        onBack={() => router.back()}
        onOpenAccountSettings={() => router.push('/account-settings')}
      />

      {/* Premium upgrade banner — shown to free users only */}
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

      <TabBar active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'portfolio' && <PortfolioTab />}
      {activeTab === 'journey'   && <JourneyTab />}
      {activeTab === 'posts'     && <PostsTab />}
      <View className="h-8" />
    </ScrollView>
  );
}
