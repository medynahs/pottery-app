// src/screens/ProfileScreen.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { Tab } from './profile/data';
import { JourneyTab } from './profile/JourneyTab';
import { PortfolioTab } from './profile/PortfolioTab';
import { ProfileHeader } from './profile/ProfileHeader';
import { type NotifState, SettingsTab } from './profile/SettingsTab';
import { TabBar } from './profile/TabBar';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');
  const [notifs, setNotifs] = useState<NotifState>({
    kilnFinished:  true,
    pieceDrying:   true,
    bisqueReady:   true,
    achievement:   true,
    weeklySummary: false,
  });
  const toggle = (key: keyof NotifState) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <ProfileHeader onBack={() => router.back()} />
      <TabBar active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'portfolio' && <PortfolioTab />}
      {activeTab === 'journey'   && <JourneyTab />}
      {activeTab === 'settings'  && <SettingsTab notifs={notifs} toggle={toggle} />}
      <View className="h-8" />
    </ScrollView>
  );
}
