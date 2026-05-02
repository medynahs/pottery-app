// src/screens/community/CommunityScreen.tsx
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Bell, Users } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { MainTabHeader } from '../../components/MainTabHeader';
import { FilterBar } from './components/FilterBar';
import { EventsTab } from './tabs/EventsTab';
import { ChallengesTab } from './tabs/FestivalsTab';
import { ForYouFeed } from './tabs/ForYouFeed';
import { HallOfFameTab } from './tabs/HallOfFameTab';
import { MissionsTab } from './tabs/MissionsTab';
import type { FilterTab } from './types';

// ─── Tray row ─────────────────────────────────────────────────────────────────

function TrayRow({
  icon,
  title,
  subtitle,
  onAccept,
  onDecline,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null);
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-border/40">
      <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={async () => { setBusy('decline'); try { await onDecline(); } finally { setBusy(null); } }}
          disabled={busy !== null}
          className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          activeOpacity={0.7}
        >
          {busy === 'decline'
            ? <ActivityIndicator size="small" color="hsl(15 50% 50%)" />
            : <X size={15} color="hsl(0 55% 55%)" />
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => { setBusy('accept'); try { await onAccept(); } finally { setBusy(null); } }}
          disabled={busy !== null}
          className="w-8 h-8 rounded-full bg-primary items-center justify-center"
          activeOpacity={0.7}
        >
          {busy === 'accept'
            ? <ActivityIndicator size="small" color="white" />
            : <Check size={15} color="white" />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Notification tray ────────────────────────────────────────────────────────

function NotificationTray({
  sessionToken,
  visible,
  onClose,
  onCountChange,
}: {
  sessionToken: string;
  visible: boolean;
  onClose: () => void;
  onCountChange: (n: number) => void;
}) {
  const [friendRequests, setFriendRequests] = useState<BackendFriendRequest[]>([]);
  const [studioInvites, setStudioInvites] = useState<BackendStudioInvite[]>([]);
  const [joinRequests, setJoinRequests] = useState<BackendStudioJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Keep badge count in sync with list state
  useEffect(() => {
    onCountChange(friendRequests.length + studioInvites.length + joinRequests.length);
  }, [friendRequests, studioInvites, joinRequests, onCountChange]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fr, si, jr] = await Promise.all([
        apiListIncomingFriendRequests(sessionToken),
        apiListIncomingStudioInvites(sessionToken),
        apiListIncomingJoinRequests(sessionToken),
      ]);
      setFriendRequests(fr ?? []);
      setStudioInvites(si ?? []);
      setJoinRequests(jr ?? []);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, [sessionToken]);

  // Initial load for badge
  useEffect(() => { load(); }, [load]);
  // Reload whenever tray is opened
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (visible) load(); }, [visible]);

  const isEmpty = !isLoading &&
    friendRequests.length === 0 &&
    studioInvites.length === 0 &&
    joinRequests.length === 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View className="bg-background rounded-t-3xl pt-4 pb-10" style={{ maxHeight: '70%' }}>
          <View className="items-center mb-3">
            <View className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </View>
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-lg font-bold text-foreground">Notifications</Text>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center" activeOpacity={0.7}>
              <X size={20} color="hsl(0 0% 55%)" />
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
          >
            {isLoading && (
              <View className="py-10 items-center">
                <ActivityIndicator color="hsl(15 65% 50%)" />
              </View>
            )}
            {isEmpty && (
              <View className="py-10 items-center gap-2">
                <Bell size={32} color="hsl(0 0% 70%)" />
                <Text className="text-sm font-semibold text-foreground mt-1">All caught up</Text>
                <Text className="text-xs text-muted-foreground text-center leading-relaxed">
                  No pending requests or invites.
                </Text>
              </View>
            )}
            {friendRequests.length > 0 && (
              <View className="mb-4">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Friend requests · {friendRequests.length}
                </Text>
                <View className="bg-card rounded-2xl border border-border px-4">
                  {friendRequests.map((r) => (
                    <TrayRow
                      key={r.id}
                      icon={<UserPlus size={16} color="hsl(15 65% 50%)" />}
                      title="Friend request"
                      subtitle={`From ${r.requester_id.slice(0, 8)}…`}
                      onAccept={async () => {
                        await apiAcceptFriendRequest(sessionToken, r.id);
                        setFriendRequests((prev) => prev.filter((x) => x.id !== r.id));
                      }}
                      onDecline={async () => {
                        await apiDeclineFriendRequest(sessionToken, r.id);
                        setFriendRequests((prev) => prev.filter((x) => x.id !== r.id));
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
            {studioInvites.length > 0 && (
              <View className="mb-4">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Studio invites · {studioInvites.length}
                </Text>
                <View className="bg-card rounded-2xl border border-border px-4">
                  {studioInvites.map((i) => (
                    <TrayRow
                      key={i.id}
                      icon={<Users size={16} color="hsl(213 70% 55%)" />}
                      title="Studio invite"
                      subtitle={`Studio ${i.studio_id.slice(0, 8)}…`}
                      onAccept={async () => {
                        await apiAcceptStudioInvite(sessionToken, i.id);
                        setStudioInvites((prev) => prev.filter((x) => x.id !== i.id));
                      }}
                      onDecline={async () => {
                        await apiRejectStudioInvite(sessionToken, i.id);
                        setStudioInvites((prev) => prev.filter((x) => x.id !== i.id));
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
            {joinRequests.length > 0 && (
              <View className="mb-4">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Join requests · {joinRequests.length}
                </Text>
                <View className="bg-card rounded-2xl border border-border px-4">
                  {joinRequests.map((r) => (
                    <TrayRow
                      key={r.id}
                      icon={<ChevronRight size={16} color="hsl(25 50% 55%)" />}
                      title="Join request"
                      subtitle={`Studio ${r.studio_id.slice(0, 8)}… · User ${r.requester_id.slice(0, 8)}…`}
                      onAccept={async () => {
                        await apiAcceptJoinRequest(sessionToken, r.id);
                        setJoinRequests((prev) => prev.filter((x) => x.id !== r.id));
                      }}
                      onDecline={async () => {
                        await apiRejectJoinRequest(sessionToken, r.id);
                        setJoinRequests((prev) => prev.filter((x) => x.id !== r.id));
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Unauthenticated gate ─────────────────────────────────────────────────────

function UnauthenticatedGate() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-background">
      <MainTabHeader title="Community" description="Your pottery world, together" />
      <View className="flex-1 items-center justify-center px-8 gap-6">
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
          <Users size={36} color="hsl(15 65% 50%)" />
        </View>
        <View className="items-center gap-2">
          <Text className="text-xl font-serif font-bold text-foreground text-center">
            Join the potter community
          </Text>
          <Text className="text-sm text-muted-foreground text-center leading-relaxed">
            Connect with potters around the world, share your work, join seasonal challenges, and grow together.
          </Text>
        </View>
        <View className="w-full gap-3">
          <TouchableOpacity
            onPress={() => router.push('/register')}
            className="w-full py-3.5 rounded-2xl bg-primary items-center"
            activeOpacity={0.85}
          >
            <Text className="text-base font-bold text-white">Create a free account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            className="w-full py-3.5 rounded-2xl border border-border bg-card items-center"
            activeOpacity={0.8}
          >
            <Text className="text-base font-semibold text-foreground">Sign in</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {['Share your pieces', 'Monthly challenges', 'Friend connections', 'Studio groups'].map((f) => (
            <Text key={f} className="text-xs text-muted-foreground">✦ {f}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('For You');
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [feedRefreshing, setFeedRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setFeedRefreshKey((k) => k + 1);
  }, []);

  if (!sessionToken) return <UnauthenticatedGate />;

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
      case 'Missions':     return <MissionsTab />;
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
    </View>
  );
}




