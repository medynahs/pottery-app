// src/screens/community/CommunityScreen.tsx
import { UnauthenticatedGate } from '@/src/components/UnauthenticatedGate';
import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { StudioTabScreen } from '@/src/components/StudioTabScreen';
import {
  TAB_FLOATING_ACTION_BOTTOM,
  TAB_SCROLL_BOTTOM_PADDING_WITH_FAB,
} from '@/src/constants/tabScreenLayout';
import { useCommunityComposer } from '@/src/hooks/useCommunityComposer';
import { buildPieceSharePreset } from '@/src/screens/pieces/utils/sharePieceToCommunity';
import { useAppStore, useVisiblePieces } from '@/src/store';
import { useRouter } from 'expo-router';
import { Bell, Pencil, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { MainTabHeader } from '../../components/MainTabHeader';
import { ACTIVE_CHALLENGE } from './data';
import { CreatePostSheet } from './components/CreatePostSheet';
import { FilterBar } from './components/FilterBar';
import { ChallengesTab } from './tabs/FestivalsTab';
import { HallOfFameTab } from './tabs/HallOfFameTab';
import { ForYouFeed } from './tabs/ForYouFeed';
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

export default function CommunityScreen() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const composerPreset = useAppStore((s) => s.communityPostComposerPreset);
  const clearComposerPreset = useAppStore((s) => s.clearCommunityPostComposerPreset);
  const hasCreatedPost = useAppStore((s) => s.hasCreatedPost);
  const hasOpenedCommunityTab = useAppStore((s) => s.hasOpenedCommunityTab);
  const markCommunityTabOpened = useAppStore((s) => s.markCommunityTabOpened);
  const pieces = useVisiblePieces();
  const openComposer = useCommunityComposer();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('For You');
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [feedRefreshing, setFeedRefreshing] = useState(false);
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [entryCeremony, setEntryCeremony] = useState<{ emoji: string; challengeName: string } | null>(null);

  useEffect(() => {
    if (composerPreset) {
      setCreatePostVisible(true);
    }
  }, [composerPreset]);

  useEffect(() => {
    if (!isSignedIn || hasOpenedCommunityTab) return;
    if (!hasCreatedPost) {
      setActiveFilter('Challenges');
    }
    markCommunityTabOpened();
  }, [hasOpenedCommunityTab, hasCreatedPost, markCommunityTabOpened]);

  const handleRefresh = useCallback(() => {
    setFeedRefreshKey((k) => k + 1);
  }, []);

  const handleShareFirstPiece = useCallback(() => {
    const piece = pieces[0];
    if (piece) {
      openComposer(buildPieceSharePreset(piece));
      return;
    }
    setCreatePostVisible(true);
  }, [openComposer, pieces]);

  const handleAskCommunity = useCallback(() => {
    openComposer({ kind: 'ask_community', askTopic: 'glaze' });
    setCreatePostVisible(true);
  }, [openComposer]);

  const handleBrowseDiscover = useCallback(() => {
    router.push('/(tabs)/library?tab=discover' as never);
  }, [router]);

  const handleShareChallengePost = useCallback(() => {
    openComposer({
      kind: 'update',
      includeChallengeTag: true,
      challengeTitle: ACTIVE_CHALLENGE.title,
    });
    setCreatePostVisible(true);
  }, [openComposer]);

  if (!isSignedIn) return <CommunityUnauthenticatedGate />;

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
      case 'Challenges':
        return (
          <ChallengesTab
            onBrowseHallOfFame={() => setActiveFilter('Hall of Fame')}
            onEntrySubmitted={setEntryCeremony}
            onShareChallengePost={handleShareChallengePost}
          />
        );
      case 'Hall of Fame':
        return <HallOfFameTab />;
      default:
        return (
          <ForYouFeed
            refreshKey={feedRefreshKey}
            onRefreshingChange={setFeedRefreshing}
            onJoinChallenge={() => setActiveFilter('Challenges')}
            onSharePiece={handleShareFirstPiece}
            onAskCommunity={handleAskCommunity}
            onBrowseDiscover={handleBrowseDiscover}
            onCreatePost={() => setCreatePostVisible(true)}
          />
        );
    }
  };

  return (
    <StudioTabScreen>
      <MainTabHeader
        title="Community"
        description="Your pottery world, together"
        rightElement={BellButton}
      />
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_SCROLL_BOTTOM_PADDING_WITH_FAB }}
        refreshControl={
          activeFilter === 'For You'
            ? <RefreshControl refreshing={feedRefreshing} onRefresh={handleRefresh} />
            : undefined
        }
      >
        <View className="px-4 gap-3">
          {renderTab()}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => setCreatePostVisible(true)}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: TAB_FLOATING_ACTION_BOTTOM,
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

      {(createPostVisible || composerPreset) ? (
        <CreatePostSheet
          visible={createPostVisible}
          preset={composerPreset}
          onClose={() => {
            clearComposerPreset();
            setCreatePostVisible(false);
          }}
          onPosted={() => {
            setActiveFilter('For You');
            handleRefresh();
          }}
        />
      ) : null}

      <CeremonyOverlay
        visible={entryCeremony !== null}
        emoji={entryCeremony?.emoji ?? '🏆'}
        title="Piece submitted!"
        subtitle={
          entryCeremony
            ? `Your entry for ${entryCeremony.challengeName} is in.`
            : undefined
        }
        footnote="The community votes once submissions close. Good luck!"
        tint="rgba(42, 107, 124, 1)"
        durationMs={3000}
        onDismiss={() => setEntryCeremony(null)}
      />
    </StudioTabScreen>
  );
}
