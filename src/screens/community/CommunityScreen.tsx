// src/screens/community/CommunityScreen.tsx
import { UnauthenticatedGate } from '@/src/components/UnauthenticatedGate';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Bell, Pencil, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { MainTabHeader } from '../../components/MainTabHeader';
import { CreatePostSheet } from './components/CreatePostSheet';
import { FilterBar } from './components/FilterBar';
import { ChallengesTab } from './tabs/FestivalsTab';
import { ForYouFeed } from './tabs/ForYouFeed';
import { HallOfFameTab } from './tabs/HallOfFameTab';
import type { FilterTab } from './types';

function CommunityUnauthenticatedGate() {
  return (
    <UnauthenticatedGate
      tabTitle="Community"
      tabDescription="Your pottery world, together"
      icon={Users}
      title="Join the potter community"
      description="Connect with potters around the world, share your work, join seasonal challenges, and grow together."
      features={['Share your pieces', 'Monthly challenges', 'Friend connections', 'Studio groups']}
    />
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const composerPreset = useAppStore((s) => s.communityPostComposerPreset);
  const clearComposerPreset = useAppStore((s) => s.clearCommunityPostComposerPreset);
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('For You');
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [feedRefreshing, setFeedRefreshing] = useState(false);
  const [createPostVisible, setCreatePostVisible] = useState(false);

  useEffect(() => {
    if (composerPreset) {
      setCreatePostVisible(true);
    }
  }, [composerPreset]);

  const handleRefresh = useCallback(() => {
    setFeedRefreshKey((k) => k + 1);
  }, []);

  if (!sessionToken) return <CommunityUnauthenticatedGate />;

  const BellButton = (
    <TouchableOpacity
      onPress={() => router.push('/notifications')}
      className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center"
      activeOpacity={0.75}
    >
      <Bell size={18} color="hsl(0 0% 40%)" />
    </TouchableOpacity>
  );

  const renderTab = () => {
    switch (activeFilter) {
      case 'Challenges':   return <ChallengesTab />;
      case 'Hall of Fame': return <HallOfFameTab />;
      default:
        return (
          <ForYouFeed
            refreshKey={feedRefreshKey}
            onRefreshingChange={setFeedRefreshing}
          />
        );
    }
  };

  return (
    <View className="flex-1 bg-background">
      <MainTabHeader
        title="Community"
        description="Your pottery world, together"
        rightElement={BellButton}
      />
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeFilter === 'For You'
            ? <RefreshControl refreshing={feedRefreshing} onRefresh={handleRefresh} />
            : undefined
        }
      >
        <View className="px-4 gap-3 pb-6">
          {renderTab()}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setCreatePostVisible(true)}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: 'hsl(39 57% 51%)',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Pencil size={20} color="white" />
      </TouchableOpacity>

      <CreatePostSheet
        visible={createPostVisible}
        preset={composerPreset}
        onClose={() => {
          clearComposerPreset();
          setCreatePostVisible(false);
        }}
        sessionToken={sessionToken}
        onPosted={() => {
          setActiveFilter('For You');
          handleRefresh();
        }}
      />
    </View>
  );
}




