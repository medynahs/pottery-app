// src/screens/community/NotificationsScreen.tsx
import { Text } from '@/src/components/ui/text';
import {
    apiAcceptFriendRequest,
    apiDeclineFriendRequest,
    apiListIncomingFriendRequests,
    type BackendFriendRequest,
} from '@/src/services/friends';
import {
    apiAcceptJoinRequest,
    apiAcceptStudioInvite,
    apiListIncomingJoinRequests,
    apiListIncomingStudioInvites,
    apiRejectJoinRequest,
    apiRejectStudioInvite,
    type BackendStudioInvite,
    type BackendStudioJoinRequest,
} from '@/src/services/studios';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Bell, Check, ChevronLeft, ChevronRight, UserPlus, Users, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Notification row ─────────────────────────────────────────────────────────

function NotifRow({
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
    <View className="flex-row items-center gap-3 py-3.5 border-b border-border/40 last:border-0">
      <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={async () => {
            setBusy('decline');
            try { await onDecline(); } finally { setBusy(null); }
          }}
          disabled={busy !== null}
          className="w-9 h-9 rounded-full bg-muted items-center justify-center"
          activeOpacity={0.7}
        >
          {busy === 'decline'
            ? <ActivityIndicator size="small" color="#8B6A2A" />
            : <X size={16} color="hsl(0 55% 55%)" />
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            setBusy('accept');
            try { await onAccept(); } finally { setBusy(null); }
          }}
          disabled={busy !== null}
          className="w-9 h-9 rounded-full bg-primary items-center justify-center"
          activeOpacity={0.7}
        >
          {busy === 'accept'
            ? <ActivityIndicator size="small" color="white" />
            : <Check size={16} color="white" />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
        {label} · {count}
      </Text>
      <View className="bg-card rounded-2xl border border-border px-4">
        {children}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const sessionToken = useAppStore((s) => s.sessionToken)!;

  const [friendRequests, setFriendRequests] = useState<BackendFriendRequest[]>([]);
  const [studioInvites, setStudioInvites] = useState<BackendStudioInvite[]>([]);
  const [joinRequests, setJoinRequests] = useState<BackendStudioJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
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
    finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [sessionToken]);

  useEffect(() => { load(); }, [load]);

  const isEmpty = !isLoading &&
    friendRequests.length === 0 &&
    studioInvites.length === 0 &&
    joinRequests.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center"
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="hsl(0 0% 30%)" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground flex-1">Notifications</Text>
        {!isLoading && !isEmpty && (
          <View className="rounded-full bg-red-500 px-2 py-0.5">
            <Text className="text-xs font-bold text-white">
              {friendRequests.length + studioInvites.length + joinRequests.length}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        <View className="px-4 pt-5 pb-10">

          {/* Loading */}
          {isLoading && (
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color="hsl(15 65% 50%)" />
            </View>
          )}

          {/* Empty */}
          {isEmpty && (
            <View className="py-16 items-center gap-3">
              <View className="w-16 h-16 rounded-full bg-muted items-center justify-center">
                <Bell size={28} color="hsl(0 0% 60%)" />
              </View>
              <Text className="text-base font-semibold text-foreground mt-1">All caught up</Text>
              <Text className="text-sm text-muted-foreground text-center leading-relaxed px-8">
                No pending requests or invites right now.
              </Text>
            </View>
          )}

          {/* Friend requests */}
          {friendRequests.length > 0 && (
            <Section label="Friend requests" count={friendRequests.length}>
              {friendRequests.map((r) => (
                <NotifRow
                  key={r.id}
                  icon={<UserPlus size={17} color="hsl(15 65% 50%)" />}
                  title="Friend request"
                  subtitle={`From user ${r.requester_id.slice(0, 8)}…`}
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
            </Section>
          )}

          {/* Studio invites */}
          {studioInvites.length > 0 && (
            <Section label="Studio invites" count={studioInvites.length}>
              {studioInvites.map((i) => (
                <NotifRow
                  key={i.id}
                  icon={<Users size={17} color="hsl(213 70% 55%)" />}
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
            </Section>
          )}

          {/* Join requests */}
          {joinRequests.length > 0 && (
            <Section label="Join requests" count={joinRequests.length}>
              {joinRequests.map((r) => (
                <NotifRow
                  key={r.id}
                  icon={<ChevronRight size={17} color="hsl(25 50% 55%)" />}
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
            </Section>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
