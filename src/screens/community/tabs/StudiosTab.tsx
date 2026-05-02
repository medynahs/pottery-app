// src/screens/community/tabs/StudiosTab.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
    apiAcceptJoinRequest,
    apiAcceptStudioInvite,
    apiCreateStudio,
    apiDeleteStudio,
    apiLeaveStudio,
    apiListIncomingJoinRequests,
    apiListIncomingStudioInvites,
    apiListMemberStudios,
    apiListOwnedStudios,
    apiRejectJoinRequest,
    apiRejectStudioInvite,
    type BackendStudio,
    type BackendStudioInvite,
    type BackendStudioJoinRequest
} from '@/src/services/studios';
import { useAppStore } from '@/src/store';
import {
    Check,
    ChevronDown,
    ChevronRight,
    Crown,
    DoorOpen,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function studioInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <View className="rounded-2xl border border-border bg-card p-4 gap-2">
      <View className="flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-xl bg-muted" />
        <View className="flex-1 gap-1.5">
          <View className="h-3.5 w-36 rounded bg-muted" />
          <View className="h-2.5 w-20 rounded bg-muted" />
        </View>
      </View>
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

// ─── Studio avatar ────────────────────────────────────────────────────────────

function StudioAvatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <View
      className="rounded-xl bg-primary/10 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Text className="font-bold text-primary" style={{ fontSize: size * 0.36 }}>
        {studioInitials(name)}
      </Text>
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
        <Users size={16} color="hsl(15 65% 50%)" />
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
        <ChevronRight size={16} color="hsl(15 50% 55%)" />
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

// ─── Collapsible section ──────────────────────────────────────────────────────

function CollapsibleSection({
  label,
  count,
  children,
  defaultOpen = true,
}: {
  label: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View className="gap-2">
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center gap-2"
        activeOpacity={0.7}
      >
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
          {label}
        </Text>
        {count !== undefined && (
          <View className="px-1.5 py-0.5 rounded-full bg-muted">
            <Text className="text-xs font-bold text-muted-foreground">{count}</Text>
          </View>
        )}
        {open
          ? <ChevronDown size={14} color="hsl(0 0% 60%)" />
          : <ChevronRight size={14} color="hsl(0 0% 60%)" />
        }
      </TouchableOpacity>
      {open && children}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StudiosTab() {
  const sessionToken = useAppStore((s) => s.sessionToken)!;

  const [owned, setOwned] = useState<BackendStudio[]>([]);
  const [member, setMember] = useState<BackendStudio[]>([]);
  const [invites, setInvites] = useState<BackendStudioInvite[]>([]);
  const [joinRequests, setJoinRequests] = useState<BackendStudioJoinRequest[]>([]);
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

  if (isLoading) {
    return (
      <>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <Card className="p-5 items-center gap-3">
        <Text className="text-sm text-muted-foreground text-center">{error}</Text>
        <TouchableOpacity
          onPress={load}
          className="px-5 py-2 rounded-xl bg-primary"
          activeOpacity={0.8}
        >
          <Text className="text-sm font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </Card>
    );
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
        <Plus size={16} color="hsl(15 65% 50%)" />
        <Text className="text-sm font-semibold text-primary">Create a new studio</Text>
      </TouchableOpacity>

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
        <Card className="p-6 items-center gap-2">
          <Users size={36} color="hsl(15 30% 70%)" />
          <Text className="text-sm font-semibold text-foreground text-center mt-1">No studios yet</Text>
          <Text className="text-xs text-muted-foreground text-center leading-relaxed">
            Create your own studio or ask a studio owner for an invite link to join one.
          </Text>
        </Card>
      )}
    </>
  );
}
