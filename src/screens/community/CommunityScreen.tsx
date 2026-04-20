// src/screens/community/CommunityScreen.tsx
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { MainTabHeader } from '../../components/MainTabHeader';
import { FilterBar } from './components/FilterBar';
import { EventsTab } from './tabs/EventsTab';
import { ChallengesTab } from './tabs/FestivalsTab';
import { ForYouFeed } from './tabs/ForYouFeed';
import { HallOfFameTab } from './tabs/HallOfFameTab';
import { MissionsTab } from './tabs/MissionsTab';
import type { FilterTab } from './types';

export default function CommunityScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('For You');

  const renderTab = () => {
    switch (activeFilter) {
      case 'Challenges': return <ChallengesTab />;
      case 'Missions':    return <MissionsTab />;
      case 'Hall of Fame': return <HallOfFameTab />;
      case 'Events':      return <EventsTab />;
      // case 'Drops':       return <DropsTab />;
      default:            return <ForYouFeed />;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <MainTabHeader title="Community" description="Your pottery world, together" />
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 gap-3 pb-6">
          {renderTab()}
        </View>
      </ScrollView>
    </View>
  );
}


