// src/screens/ProfileScreen.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TabBar } from '../config/TabBar';
import { ProfileHeader } from './overview/profile/components/ProfileHeader';
import type { Tab } from './overview/profile/mockedData/data';
import { JourneyTab } from './overview/profile/tabs/JourneyTab';
import { PortfolioTab } from './overview/profile/tabs/PortfolioTab';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <ProfileHeader
        onBack={() => router.back()}
        onOpenAccountSettings={() => router.push('/account-settings')}
      />
      <TabBar active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'portfolio' && <PortfolioTab />}
      {activeTab === 'journey'   && <JourneyTab />}
      <View className="h-8" />
    </ScrollView>
  );
}
