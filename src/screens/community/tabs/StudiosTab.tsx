// src/screens/community/tabs/StudiosTab.tsx
import { EmptyState } from '@/src/components/EmptyState';
import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { CollapsibleSection } from '@/src/components/SectionHeader';
import { SkeletonStudioCard } from '@/src/components/Skeleton';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { BrandColors } from '@/src/constants/theme';
import {
  apiAcceptJoinRequest,
  apiAcceptStudioInvite,
  apiAddStudioMember,
  apiCreateStudio,
  apiDeleteStudio,
  apiInviteToStudio,
  apiLeaveStudio,
  apiListIncomingJoinRequests,
  apiListIncomingStudioInvites,
  apiListMemberStudios,
  apiListOwnedStudios,
  apiListStudioMembers,
  apiRejectJoinRequest,
  apiRejectStudioInvite,
  apiRequestToJoinStudio,
  type BackendStudio,
  type BackendStudioInvite,
  type BackendStudioJoinRequest,
  type BackendUser
} from '@/src/services/studios';
import { useAppStore } from '@/src/store';
import {
  Check,
  ChevronRight,
  Crown,
  DoorOpen,
  Mail,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ─── Studio avatar ────────────────────────────────────────────────────────────

function StudioAvatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <UserAvatar
      name={name}
      size={size}
      shape="rounded"
      backgroundColor="hsl(39 57% 95%)"
      textColor={BrandColors.primary}
    />
  );
}

function MemberPreviewCard({ user }: { user: BackendUser }) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-border bg-background p-2.5">
      <UserAvatar name={user.name} size={36} shape="circle" backgroundColor="hsl(39 57% 95%)" textColor={BrandColors.primary} />
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>{user.name || 'Unnamed user'}</Text>
        <View className="flex-row items-center gap-1">
          <Mail size={11} color="hsl(0 0% 50%)" />
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>{user.email || user.id}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Studio card (owned) ──────────────────────────────────────────────────────

function OwnedStudioCard({
  studio,
  onDelete,
}: {
  studio: BackendStudio;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete studio',
      `Delete "${studio.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await onDelete(studio.id);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-3">
        <StudioAvatar name={studio.name} />
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-sm font-bold text-foreground">{studio.name}</Text>
            <Crown size={12} color="hsl(38 80% 60%)" />
          </View>
          <Text className="text-xs text-muted-foreground">Owner</Text>
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleting}
          className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          activeOpacity={0.7}
        >
          {deleting
            ? <ActivityIndicator size="small" color="#8B6A2A" />
            : <Trash2 size={14} color="hsl(0 60% 55%)" />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Studio card (member) ─────────────────────────────────────────────────────

function MemberStudioCard({
  studio,
  onLeave,
}: {
  studio: BackendStudio;
  onLeave: (id: string) => void;
}) {
  const [leaving, setLeaving] = useState(false);

  const handleLeave = () => {
    Alert.alert(
      'Leave studio',
      `Leave "${studio.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setLeaving(true);
            try {
              await onLeave(studio.id);
            } finally {
              setLeaving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-3">
        <StudioAvatar name={studio.name} />
        <View className="flex-1">
          <Text className="text-sm font-bold text-foreground">{studio.name}</Text>
          <Text className="text-xs text-muted-foreground">Member</Text>
        </View>
        <TouchableOpacity
          onPress={handleLeave}
          disabled={leaving}
          className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          activeOpacity={0.7}
        >
          {leaving
            ? <ActivityIndicator size="small" color="#8B6A2A" />
            : <DoorOpen size={14} color="hsl(25 70% 55%)" />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Invite row ───────────────────────────────────────────────────────────────

function InviteRow({
  invite,
  onAccept,
  onReject,
}: {
  invite: BackendStudioInvite;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);

  return (
    <View className="rounded-2xl border border-border bg-card p-3 flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
        <Users size={16} color="hsl(39 57% 51%)" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">Studio invite</Text>
        <Text className="text-xs text-muted-foreground font-mono">{invite.studio_id.slice(0, 8)}…</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={async () => {
            setBusy('reject');
            try { await onReject(invite.id); } finally { setBusy(null); }
          }}
          disabled={busy !== null}
          className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          activeOpacity={0.7}
        >
          {busy === 'reject'
            ? <ActivityIndicator size="small" color="#8B6A2A" />
            : <X size={15} color="hsl(0 55% 55%)" />
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            setBusy('accept');
            try { await onAccept(invite.id); } finally { setBusy(null); }
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

// ─── Join-request row (incoming, for owners) ──────────────────────────────────

function JoinRequestRow({
  request,
  onAccept,
  onReject,
}: {
  request: BackendStudioJoinRequest;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);

  return (
    <View className="rounded-2xl border border-border bg-card p-3 flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
        <ChevronRight size={16} color="hsl(39 57% 55%)" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">Join request</Text>
        <Text className="text-xs text-muted-foreground font-mono">
          Studio {request.studio_id.slice(0, 8)}… · {request.requester_id.slice(0, 8)}…
        </Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={async () => {
            setBusy('reject');
            try { await onReject(request.id); } finally { setBusy(null); }
          }}
          disabled={busy !== null}
          className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          activeOpacity={0.7}
        >
          {busy === 'reject'
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

// ─── Create studio modal ──────────────────────────────────────────────────────

function CreateStudioModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Studio name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      await onCreate(trimmed);
      setName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create studio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-background rounded-t-3xl px-6 pt-5 pb-10 gap-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-foreground">New studio</Text>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center" activeOpacity={0.7}>
              <X size={20} color="hsl(0 0% 55%)" />
            </TouchableOpacity>
          </View>

          <View className="gap-1">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Studio name</Text>
            <TextInput
              value={name}
              onChangeText={(t) => { setName(t); setError(null); }}
              placeholder="e.g. Clay & Co."
              className="border border-border rounded-xl px-4 py-3 text-sm text-foreground bg-card"
              autoFocus
              maxLength={64}
            />
            {error && <Text className="text-xs text-red-500">{error}</Text>}
          </View>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={saving || !name.trim()}
            className="w-full py-3.5 rounded-2xl bg-primary items-center"
            activeOpacity={0.85}
            style={{ opacity: saving || !name.trim() ? 0.6 : 1 }}
          >
            {saving
              ? <ActivityIndicator size="small" color="white" />
              : <Text className="text-base font-bold text-white">Create studio</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StudiosTab() {
  const sessionToken = useAppStore((s) => s.sessionToken)!;
  const showToast = useAppStore((s) => s.showToast);

  const [owned, setOwned] = useState<BackendStudio[]>([]);
  const [member, setMember] = useState<BackendStudio[]>([]);
  const [invites, setInvites] = useState<BackendStudioInvite[]>([]);
  const [joinRequests, setJoinRequests] = useState<BackendStudioJoinRequest[]>([]);
  const [selectedOwnedStudioId, setSelectedOwnedStudioId] = useState('');
  const [studioToJoinId, setStudioToJoinId] = useState('');
  const [joiningStudio, setJoiningStudio] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [memberUserId, setMemberUserId] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [members, setMembers] = useState<BackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [o, m, inv, jr] = await Promise.all([
        apiListOwnedStudios(sessionToken),
        apiListMemberStudios(sessionToken),
        apiListIncomingStudioInvites(sessionToken),
        apiListIncomingJoinRequests(sessionToken),
      ]);
      setOwned(o ?? []);
      setMember(m ?? []);
      setInvites(inv ?? []);
      setJoinRequests(jr ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load studios');
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedOwnedStudioId && owned.length > 0) {
      setSelectedOwnedStudioId(owned[0].id);
    }
    if (selectedOwnedStudioId && !owned.some((s) => s.id === selectedOwnedStudioId)) {
      setSelectedOwnedStudioId(owned[0]?.id ?? '');
    }
  }, [owned, selectedOwnedStudioId]);

  const handleCreate = useCallback(
    async (name: string) => {
      const studio = await apiCreateStudio(sessionToken, { name });
      setOwned((prev) => [studio, ...prev]);
    },
    [sessionToken],
  );

  const handleDeleteOwned = useCallback(
    async (studioId: string) => {
      await apiDeleteStudio(sessionToken, studioId);
      setOwned((prev) => prev.filter((s) => s.id !== studioId));
    },
    [sessionToken],
  );

  const handleLeave = useCallback(
    async (studioId: string) => {
      await apiLeaveStudio(sessionToken, studioId);
      setMember((prev) => prev.filter((s) => s.id !== studioId));
    },
    [sessionToken],
  );

  const handleAcceptInvite = useCallback(
    async (inviteId: string) => {
      await apiAcceptStudioInvite(sessionToken, inviteId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      const updated = await apiListMemberStudios(sessionToken);
      setMember(updated ?? []);
    },
    [sessionToken],
  );

  const handleRejectInvite = useCallback(
    async (inviteId: string) => {
      await apiRejectStudioInvite(sessionToken, inviteId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    },
    [sessionToken],
  );

  const handleAcceptJoinRequest = useCallback(
    async (requestId: string) => {
      await apiAcceptJoinRequest(sessionToken, requestId);
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    },
    [sessionToken],
  );

  const handleRejectJoinRequest = useCallback(
    async (requestId: string) => {
      await apiRejectJoinRequest(sessionToken, requestId);
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
    },
    [sessionToken],
  );

  const handleRequestToJoin = useCallback(async () => {
    const studioId = studioToJoinId.trim();
    if (!studioId || joiningStudio) return;
    setJoiningStudio(true);
    try {
      await apiRequestToJoinStudio(sessionToken, studioId);
      setStudioToJoinId('');
      showToast('Join request sent', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request join';
      showToast(message, 'error');
    } finally {
      setJoiningStudio(false);
    }
  }, [joiningStudio, sessionToken, showToast, studioToJoinId]);

  const handleInviteToStudio = useCallback(async () => {
    const studioId = selectedOwnedStudioId.trim();
    const userId = inviteUserId.trim();
    if (!studioId || !userId || inviting) return;
    setInviting(true);
    try {
      await apiInviteToStudio(sessionToken, studioId, userId);
      setInviteUserId('');
      showToast('Invite sent', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send invite';
      showToast(message, 'error');
    } finally {
      setInviting(false);
    }
  }, [inviteUserId, inviting, selectedOwnedStudioId, sessionToken, showToast]);

  const handleAddMember = useCallback(async () => {
    const studioId = selectedOwnedStudioId.trim();
    const userId = memberUserId.trim();
    if (!studioId || !userId || addingMember) return;
    setAddingMember(true);
    try {
      await apiAddStudioMember(sessionToken, studioId, userId);
      setMemberUserId('');
      showToast('Member added', 'success');
      const updatedMembers = await apiListStudioMembers(sessionToken, studioId);
      setMembers(updatedMembers ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add member';
      showToast(message, 'error');
    } finally {
      setAddingMember(false);
    }
  }, [addingMember, memberUserId, selectedOwnedStudioId, sessionToken, showToast]);

  const handleRefreshMembers = useCallback(async () => {
    const studioId = selectedOwnedStudioId.trim();
    if (!studioId || membersLoading) return;
    setMembersLoading(true);
    try {
      const updatedMembers = await apiListStudioMembers(sessionToken, studioId);
      setMembers(updatedMembers ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load members';
      showToast(message, 'error');
    } finally {
      setMembersLoading(false);
    }
  }, [membersLoading, selectedOwnedStudioId, sessionToken, showToast]);

  if (isLoading) {
    return (
      <>
        <SkeletonStudioCard />
        <SkeletonStudioCard />
        <SkeletonStudioCard />
      </>
    );
  }

  if (error) {
    return <InlineErrorCard message={error} onRetry={load} />;
  }

  const noStudios = owned.length === 0 && member.length === 0;
  const noActivity = invites.length === 0 && joinRequests.length === 0;

  return (
    <>
      <CreateStudioModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

      {/* ── Create button ─── */}
      <TouchableOpacity
        onPress={() => setShowCreate(true)}
        className="flex-row items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5"
        activeOpacity={0.8}
      >
        <Plus size={16} color="hsl(39 57% 51%)" />
        <Text className="text-sm font-semibold text-primary">Create a new studio</Text>
      </TouchableOpacity>

      {/* ── Join studio by ID ─── */}
      <Card className="p-4 gap-2">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Join a studio</Text>
        <TextInput
          value={studioToJoinId}
          onChangeText={setStudioToJoinId}
          placeholder="Studio ID"
          className="border border-border rounded-xl px-4 py-3 text-sm text-foreground bg-background"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={handleRequestToJoin}
          disabled={joiningStudio || !studioToJoinId.trim()}
          className="rounded-xl items-center py-2.5 bg-primary"
          activeOpacity={0.8}
          style={{ opacity: joiningStudio || !studioToJoinId.trim() ? 0.6 : 1 }}
        >
          {joiningStudio
            ? <ActivityIndicator size="small" color="white" />
            : <Text className="text-sm font-semibold text-white">Request to join</Text>
          }
        </TouchableOpacity>
      </Card>

      {/* ── Owner tools ─── */}
      {owned.length > 0 && (
        <Card className="p-4 gap-2">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner tools</Text>
          <View className="flex-row flex-wrap gap-2">
            {owned.map((studio) => {
              const selected = selectedOwnedStudioId === studio.id;
              return (
                <TouchableOpacity
                  key={studio.id}
                  onPress={() => setSelectedOwnedStudioId(studio.id)}
                  activeOpacity={0.8}
                  className="px-3 py-2 rounded-xl border"
                  style={{
                    borderColor: selected ? 'hsl(39 57% 51%)' : 'hsl(0 0% 85%)',
                    backgroundColor: selected ? 'hsl(39 57% 95%)' : 'white',
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: selected ? 'hsl(39 57% 45%)' : 'hsl(0 0% 35%)' }}
                  >
                    {studio.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedOwnedStudioId ? (
            <Text className="text-[11px] text-muted-foreground">
              Selected studio ID: {selectedOwnedStudioId}
            </Text>
          ) : null}
          <TextInput
            value={inviteUserId}
            onChangeText={setInviteUserId}
            placeholder="User ID to invite"
            className="border border-border rounded-xl px-4 py-3 text-sm text-foreground bg-background"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={handleInviteToStudio}
            disabled={inviting || !selectedOwnedStudioId.trim() || !inviteUserId.trim()}
            className="rounded-xl items-center py-2.5 bg-muted"
            activeOpacity={0.8}
            style={{ opacity: inviting || !selectedOwnedStudioId.trim() || !inviteUserId.trim() ? 0.6 : 1 }}
          >
            {inviting
              ? <ActivityIndicator size="small" color="#8B6A2A" />
              : <Text className="text-sm font-semibold text-foreground">Invite user</Text>
            }
          </TouchableOpacity>

          <TextInput
            value={memberUserId}
            onChangeText={setMemberUserId}
            placeholder="User ID to add directly"
            className="border border-border rounded-xl px-4 py-3 text-sm text-foreground bg-background"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={handleAddMember}
            disabled={addingMember || !selectedOwnedStudioId.trim() || !memberUserId.trim()}
            className="rounded-xl items-center py-2.5 bg-muted"
            activeOpacity={0.8}
            style={{ opacity: addingMember || !selectedOwnedStudioId.trim() || !memberUserId.trim() ? 0.6 : 1 }}
          >
            {addingMember
              ? <ActivityIndicator size="small" color="#8B6A2A" />
              : <Text className="text-sm font-semibold text-foreground">Add member directly</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRefreshMembers}
            disabled={membersLoading || !selectedOwnedStudioId.trim()}
            className="rounded-xl items-center py-2.5 border border-border"
            activeOpacity={0.8}
            style={{ opacity: membersLoading || !selectedOwnedStudioId.trim() ? 0.6 : 1 }}
          >
            {membersLoading
              ? <ActivityIndicator size="small" color="#8B6A2A" />
              : <Text className="text-sm font-semibold text-muted-foreground">Refresh members</Text>
            }
          </TouchableOpacity>

          {members.length > 0 && (
            <View className="gap-2 pt-1">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Members ({members.length})
              </Text>
              {members.slice(0, 4).map((u) => (
                <MemberPreviewCard key={u.id} user={u} />
              ))}
              {members.length > 4 && (
                <Text className="text-xs text-muted-foreground">+{members.length - 4} more members</Text>
              )}
            </View>
          )}
        </Card>
      )}

      {/* ── Invites ─── */}
      {invites.length > 0 && (
        <CollapsibleSection label="Invites" count={invites.length}>
          {invites.map((inv) => (
            <InviteRow
              key={inv.id}
              invite={inv}
              onAccept={handleAcceptInvite}
              onReject={handleRejectInvite}
            />
          ))}
        </CollapsibleSection>
      )}

      {/* ── Join requests (owner inbox) ─── */}
      {joinRequests.length > 0 && (
        <CollapsibleSection label="Join requests" count={joinRequests.length}>
          {joinRequests.map((jr) => (
            <JoinRequestRow
              key={jr.id}
              request={jr}
              onAccept={handleAcceptJoinRequest}
              onReject={handleRejectJoinRequest}
            />
          ))}
        </CollapsibleSection>
      )}

      {/* ── Owned studios ─── */}
      {owned.length > 0 && (
        <CollapsibleSection label="Your studios" count={owned.length}>
          {owned.map((s) => (
            <OwnedStudioCard key={s.id} studio={s} onDelete={handleDeleteOwned} />
          ))}
        </CollapsibleSection>
      )}

      {/* ── Member studios ─── */}
      {member.length > 0 && (
        <CollapsibleSection label="Member of" count={member.length}>
          {member.map((s) => (
            <MemberStudioCard key={s.id} studio={s} onLeave={handleLeave} />
          ))}
        </CollapsibleSection>
      )}

      {/* ── Empty state ─── */}
      {noStudios && noActivity && (
        <EmptyState
          icon={Users}
          title="No studios yet"
          description="Create your own studio or ask a studio owner for an invite link to join one."
        />
      )}
    </>
  );
}
