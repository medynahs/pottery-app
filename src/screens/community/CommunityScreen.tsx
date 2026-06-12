// src/screens/community/CommunityScreen.tsx
import { UnauthenticatedGate } from '@/src/components/UnauthenticatedGate';
import { Text } from '@/src/components/ui/text';
import { apiCreatePost } from '@/src/services/community';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Bell, Pencil, Users, X } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { MainTabHeader } from '../../components/MainTabHeader';
import { FilterBar } from './components/FilterBar';
import { EventsTab } from './tabs/EventsTab';
import { ChallengesTab } from './tabs/FestivalsTab';
import { ForYouFeed } from './tabs/ForYouFeed';
import { HallOfFameTab } from './tabs/HallOfFameTab';
import type { FilterTab } from './types';

// ─── Create post sheet ───────────────────────────────────────────────────────

function CreatePostSheet({
  visible,
  onClose,
  sessionToken,
  onPosted,
}: {
  visible: boolean;
  onClose: () => void;
  sessionToken: string;
  onPosted: () => void;
}) {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const showToast = useAppStore((s) => s.showToast);
  const markPostCreated = useAppStore((s) => s.markPostCreated);

  const submit = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      await apiCreatePost(sessionToken, { content: content.trim() });
      setContent('');
      markPostCreated();
      onClose();
      onPosted();
      showToast('Post shared!', 'success');
    } catch (e) {
      console.error('[CreatePost] error:', e);
      showToast('Failed to post — please try again', 'error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View className="bg-background rounded-t-3xl px-6 pt-4 pb-10">
            <View className="items-center mb-4">
              <View className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </View>
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-foreground">New post</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <X size={20} color="hsl(0 0% 55%)" />
              </TouchableOpacity>
            </View>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Share an update, finished piece, or discovery…"
              placeholderTextColor="hsl(24 10% 65%)"
              multiline
              maxLength={500}
              autoFocus
              style={{
                minHeight: 120,
                maxHeight: 200,
                fontSize: 15,
                lineHeight: 22,
                color: 'hsl(24 25% 15%)',
                textAlignVertical: 'top',
              }}
            />
            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-border">
              <Text className="text-xs text-muted-foreground">{content.length}/500</Text>
              <TouchableOpacity
                onPress={submit}
                disabled={!content.trim() || posting}
                className={`px-5 py-2.5 rounded-xl items-center justify-center ${
                  content.trim() && !posting ? 'bg-primary' : 'bg-muted'
                }`}
                activeOpacity={0.8}
                style={{ minWidth: 70 }}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className={`text-sm font-bold ${
                    content.trim() ? 'text-white' : 'text-muted-foreground'
                  }`}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Unauthenticated gate ─────────────────────────────────────────────────────

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
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('For You');
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [feedRefreshing, setFeedRefreshing] = useState(false);
  const [createPostVisible, setCreatePostVisible] = useState(false);

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
      case 'Events':       return <EventsTab />;
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
        onClose={() => setCreatePostVisible(false)}
        sessionToken={sessionToken}
        onPosted={() => {
          setActiveFilter('For You');
          handleRefresh();
        }}
      />
    </View>
  );
}




