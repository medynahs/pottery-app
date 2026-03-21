// src/screens/ProfileScreen.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { Tab } from './profile/data';
import { JourneyTab } from './profile/JourneyTab';
import { PortfolioTab } from './profile/PortfolioTab';
import { ProfileHeader } from './profile/ProfileHeader';
import { TabBar } from './profile/TabBar';

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
