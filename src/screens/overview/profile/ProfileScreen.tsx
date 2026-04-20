import { SectionLabel } from '@/src/components/SectionLabel';
import { SettingsGroup } from '@/src/components/SettingsGroup';
import { SettingsRow } from '@/src/components/SettingsRow';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { CalendarDays, SlidersHorizontal } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TabBar } from '../../../config/TabBar';
import { ProfileHeader } from './components/ProfileHeader';
import type { Tab } from './mockedData/data';
import { JourneyTab } from './tabs/JourneyTab';
import { PortfolioTab } from './tabs/PortfolioTab';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');
  const rhythm = useAppStore((s) => s.studioRhythm);
  const rhythmConfigured = rhythm.stageDays.some((sd) => sd.days.length > 0) || rhythm.events.length > 0;
  // Fetch /api/me and sync into Zustand store whenever a session is active
  useCurrentUser();

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <ProfileHeader
        onBack={() => router.back()}
        onOpenAccountSettings={() => router.push('/account-settings')}
      />

      <SectionLabel title="Studio Setup" />
      <SettingsGroup>
        <SettingsRow
          icon={CalendarDays}
          iconColor="hsl(38 80% 45%)"
          iconBg="bg-amber-50"
          label="Studio Rhythm"
          value={rhythmConfigured ? 'Configured' : 'Not set up'}
          onPress={() => router.push('/profile/studio-rhythm')}
        />
        <SettingsRow
          icon={SlidersHorizontal}
          iconColor="hsl(213 80% 55%)"
          iconBg="bg-blue-50"
          label="Studio Customization"
          value="Stages, clay bodies, cones"
          onPress={() => router.push('/app-customization')}
          isLast
        />
      </SettingsGroup>

      <SectionLabel title="My Studio" />
      <TabBar active={activeTab} onSelect={setActiveTab} />
      {activeTab === 'portfolio' && <PortfolioTab />}
      {activeTab === 'journey'   && <JourneyTab />}
      <View className="h-8" />
    </ScrollView>
  );
}
