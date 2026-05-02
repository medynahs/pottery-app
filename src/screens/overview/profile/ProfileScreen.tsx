import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
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

      <TabBar active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'portfolio' && <PortfolioTab />}
      {activeTab === 'journey'   && <JourneyTab />}
      {activeTab === 'posts'     && <PostsTab />}
      <View className="h-8" />
    </ScrollView>
  );
}
