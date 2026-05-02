// src/screens/community/tabs/FriendsTab.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
    apiAcceptFriendRequest,
    apiCancelFriendRequest,
    apiDeclineFriendRequest,
    apiListFriends,
    apiListIncomingFriendRequests,
    apiListOutgoingFriendRequests,
    apiRemoveFriend,
    type BackendFriendRequest,
    type BackendUser,
} from '@/src/services/friends';
import { useAppStore } from '@/src/store';
import { Check, UserMinus, UserPlus, Users, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, avatarUrl, size = 40 }: { name: string; avatarUrl: string | null; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View
      className="rounded-full bg-muted items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Text className="font-bold text-muted-foreground" style={{ fontSize: size * 0.38 }}>
        {initials}
      </Text>
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <View className="flex-row items-center gap-2 mb-1">
      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Text>
      {count !== undefined && (
        <View className="px-1.5 py-0.5 rounded-full bg-muted">
          <Text className="text-xs font-bold text-muted-foreground">{count}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <View className="flex-row items-center gap-3 py-3 px-4 bg-card rounded-2xl border border-border">
      <View className="w-10 h-10 rounded-full bg-muted" />
      <View className="flex-1 gap-1.5">
        <View className="h-3 w-32 rounded bg-muted" />
        <View className="h-2.5 w-20 rounded bg-muted" />
      </View>
    </View>
  );
}

// ─── Friend row ───────────────────────────────────────────────────────────────

function FriendRow({
  user,
  onRemove,
}: {
  user: BackendUser;
  onRemove: (id: string) => void;
}) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    Alert.alert(
      'Remove friend',
      `Remove ${user.name} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await onRemove(user.id);
            } finally {
              setRemoving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-row items-center gap-3 p-3 bg-card rounded-2xl border border-border">
      <Avatar name={user.name} avatarUrl={user.avatar_url} />
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{user.name}</Text>
        <Text className="text-xs text-muted-foreground">{user.email}</Text>
      </View>
      <TouchableOpacity
        onPress={handleRemove}
        disabled={removing}
        className="w-8 h-8 rounded-full bg-muted items-center justify-center"
        activeOpacity={0.7}
      >
        {removing
          ? <ActivityIndicator size="small" color="#8B6A2A" />
          : <UserMinus size={15} color="hsl(0 60% 55%)" />
        }
      </TouchableOpacity>
    </View>
  );
}

// ─── Incoming request row ─────────────────────────────────────────────────────

function IncomingRequestRow({
  request,
  onAccept,
  onDecline,
}: {
  request: BackendFriendRequest;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null);

  return (
    <View className="flex-row items-center gap-3 p-3 bg-card rounded-2xl border border-border">
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
        <UserPlus size={18} color="hsl(15 65% 50%)" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">Friend request</Text>
        <Text className="text-xs text-muted-foreground font-mono">{request.requester_id.slice(0, 8)}…</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={async () => {
            setBusy('decline');
            try { await onDecline(request.id); } finally { setBusy(null); }
          }}
          disabled={busy !== null}
          className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          activeOpacity={0.7}
        >
          {busy === 'decline'
            ? <ActivityIndicator size="small" color="#8B6A2A" />
            : <X size={15} color="hsl(0 55% 55%)" />
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            setBusy('accept');
            try { await onAccept(request.id); } finally { setBusy(null); }
          }}
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

// ─── Outgoing request row ─────────────────────────────────────────────────────

function OutgoingRequestRow({
  request,
  onCancel,
}: {
  request: BackendFriendRequest;
  onCancel: (id: string) => Promise<void>;
}) {
  const [canceling, setCanceling] = useState(false);

  return (
    <View className="flex-row items-center gap-3 p-3 bg-card rounded-2xl border border-border">
      <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
        <UserPlus size={18} color="hsl(15 50% 60%)" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">Pending request</Text>
        <Text className="text-xs text-muted-foreground font-mono">{request.addressee_id.slice(0, 8)}…</Text>
      </View>
      <TouchableOpacity
        onPress={async () => {
          setCanceling(true);
          try { await onCancel(request.id); } finally { setCanceling(false); }
        }}
        disabled={canceling}
        className="px-3 py-1.5 rounded-xl border border-border bg-muted items-center"
        activeOpacity={0.7}
      >
        {canceling
          ? <ActivityIndicator size="small" color="#8B6A2A" />
          : <Text className="text-xs font-semibold text-muted-foreground">Cancel</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FriendsTab() {
  const sessionToken = useAppStore((s) => s.sessionToken)!;

  const [friends, setFriends] = useState<BackendUser[]>([]);
  const [incoming, setIncoming] = useState<BackendFriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<BackendFriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setIsLoading(true);
      setError(null);
      try {
        const [f, inc, out] = await Promise.all([
          apiListFriends(sessionToken),
          apiListIncomingFriendRequests(sessionToken),
          apiListOutgoingFriendRequests(sessionToken),
        ]);
        setFriends(f ?? []);
        setIncoming(inc ?? []);
        setOutgoing(out ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load friends');
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [sessionToken],
  );

  useEffect(() => { load(); }, [load]);

  const handleRemoveFriend = useCallback(
    async (friendId: string) => {
      await apiRemoveFriend(sessionToken, friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    },
    [sessionToken],
  );

  const handleAccept = useCallback(
    async (requestId: string) => {
      await apiAcceptFriendRequest(sessionToken, requestId);
      setIncoming((prev) => prev.filter((r) => r.id !== requestId));
      // Reload friends list to include the newly confirmed friend
      const updated = await apiListFriends(sessionToken);
      setFriends(updated ?? []);
    },
    [sessionToken],
  );

  const handleDecline = useCallback(
    async (requestId: string) => {
      await apiDeclineFriendRequest(sessionToken, requestId);
      setIncoming((prev) => prev.filter((r) => r.id !== requestId));
    },
    [sessionToken],
  );

  const handleCancel = useCallback(
    async (requestId: string) => {
      await apiCancelFriendRequest(sessionToken, requestId);
      setOutgoing((prev) => prev.filter((r) => r.id !== requestId));
    },
    [sessionToken],
  );

  if (isLoading) {
    return (
      <>
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <Card className="p-5 items-center gap-3">
        <Text className="text-sm text-muted-foreground text-center">{error}</Text>
        <TouchableOpacity
          onPress={() => load()}
          className="px-5 py-2 rounded-xl bg-primary"
          activeOpacity={0.8}
        >
          <Text className="text-sm font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  const isEmpty = friends.length === 0 && incoming.length === 0 && outgoing.length === 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
      }
    >
      <View className="gap-3">
        {/* ── Incoming requests ─── */}
        {incoming.length > 0 && (
          <View className="gap-2">
            <SectionHeader label="Requests" count={incoming.length} />
            {incoming.map((r) => (
              <IncomingRequestRow
                key={r.id}
                request={r}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </View>
        )}

        {/* ── Outgoing requests ─── */}
        {outgoing.length > 0 && (
          <View className="gap-2">
            <SectionHeader label="Sent" count={outgoing.length} />
            {outgoing.map((r) => (
              <OutgoingRequestRow key={r.id} request={r} onCancel={handleCancel} />
            ))}
          </View>
        )}

        {/* ── Friends ─── */}
        {friends.length > 0 && (
          <View className="gap-2">
            <SectionHeader label="Friends" count={friends.length} />
            {friends.map((u) => (
              <FriendRow key={u.id} user={u} onRemove={handleRemoveFriend} />
            ))}
          </View>
        )}

        {/* ── Empty state ─── */}
        {isEmpty && (
          <Card className="p-6 items-center gap-2">
            <Users size={36} color="hsl(15 30% 70%)" />
            <Text className="text-sm font-semibold text-foreground text-center mt-1">No friends yet</Text>
            <Text className="text-xs text-muted-foreground text-center leading-relaxed">
              Find potters in the feed and send them a friend request to start connecting.
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
