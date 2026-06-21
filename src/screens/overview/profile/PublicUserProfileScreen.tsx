import { ImageLightbox } from '@/src/components/ImageLightbox';
import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { DetailScreenShell } from '@/src/components/DetailScreenShell';
import { PickSheet } from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { apiSendFriendRequest } from '@/src/services/friends';
import {
  apiGetPublicProfile,
  PublicProfileApiError,
  type PublicProfile,
} from '@/src/services/publicProfile';
import { useAppStore } from '@/src/store/appStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check, Share2, UserPlus, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useClayFriendStatus } from './hooks/useClayFriendStatus';
import { useProfileShareMenu } from './hooks/useProfileShareMenu';

const GRID_GAP = 1;
const GRID_COLUMNS = 3;

function ClayFriendButton({
  status,
  loading,
  disabled,
  onPress,
}: {
  status: ReturnType<typeof useClayFriendStatus>['status'];
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  if (status === 'self') return null;

  const isFriend = status === 'friend';
  const isPending = status === 'pending_outgoing';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading || isFriend || isPending}
      activeOpacity={0.82}
      className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl border ${
        isFriend
          ? 'border-green-500/40 bg-green-50'
          : isPending
            ? 'border-border bg-muted'
            : 'border-primary/35 bg-primary/10'
      }`}
    >
      {isFriend ? (
        <Check size={14} color="hsl(145 50% 38%)" />
      ) : (
        <UserPlus size={14} color={isPending ? 'hsl(24 20% 45%)' : 'hsl(39 57% 51%)'} />
      )}
      <Text
        className={`text-xs font-semibold ${
          isFriend ? 'text-green-700' : isPending ? 'text-muted-foreground' : 'text-primary'
        }`}
      >
        {loading
          ? 'Loading…'
          : isFriend
            ? 'Clay Friends'
            : isPending
              ? 'Requested'
              : 'Add Clay Friend'}
      </Text>
    </TouchableOpacity>
  );
}

type PublicUserProfileScreenProps = {
  userId: string;
};

export default function PublicUserProfileScreen({ userId }: PublicUserProfileScreenProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const sessionToken = useAppStore((s) => s.sessionToken);
  const viewerUserId = useAppStore((s) => s.backendUserId);
  const showToast = useAppStore((s) => s.showToast);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestSending, setRequestSending] = useState(false);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  const { status: friendStatus, loading: friendLoading, reload: reloadFriendStatus } =
    useClayFriendStatus(userId, viewerUserId, sessionToken);

  const {
    shareMenuVisible,
    shareMenuOptions,
    openShareMenu,
    closeShareMenu,
  } = useProfileShareMenu({
    userId,
    name: profile?.name ?? 'Potter profile',
  });

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiGetPublicProfile(userId, sessionToken);
      setProfile(data);
    } catch (e) {
      const message =
        e instanceof PublicProfileApiError && e.status === 404
          ? 'This profile is private or unavailable.'
          : 'Could not load this profile.';
      setError(message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [sessionToken, userId]);

  useEffect(() => {
    if (friendStatus === 'self') {
      router.replace('/(tabs)/profile' as never);
      return;
    }
    void load();
  }, [friendStatus, load, router]);

  const photoPosts = useMemo(
    () => (profile?.posts ?? []).filter((post) => post.image_url),
    [profile?.posts],
  );

  const tileSize = useMemo(() => {
    const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
    return Math.floor((width - totalGap) / GRID_COLUMNS);
  }, [width]);

  const handleAddFriend = async () => {
    if (!sessionToken) {
      showToast('Sign in to add Clay Friends', 'error');
      router.push('/login' as never);
      return;
    }
    if (friendStatus !== 'none' || requestSending) return;

    setRequestSending(true);
    try {
      await apiSendFriendRequest(sessionToken, userId);
      showToast('Friend request sent', 'success');
      await reloadFriendStatus();
    } catch {
      showToast('Unable to send request', 'error');
    } finally {
      setRequestSending(false);
    }
  };

  return (
    <DetailScreenShell
      title={profile?.name ?? 'Potter profile'}
      subtitle={
        profile
          ? `${profile.post_count} post${profile.post_count === 1 ? '' : 's'}`
          : 'Shared profile'
      }
      onBack={() => router.back()}
      headerRight={
        profile && friendStatus !== 'self' ? (
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={openShareMenu}
              activeOpacity={0.75}
              className="w-9 h-9 rounded-xl border border-border bg-card items-center justify-center"
              accessibilityLabel="Share profile"
            >
              <Share2 size={15} color="hsl(24 20% 40%)" />
            </TouchableOpacity>
            <ClayFriendButton
              status={friendStatus}
              loading={friendLoading || requestSending}
              onPress={handleAddFriend}
            />
          </View>
        ) : null
      }
    >
      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color="hsl(39 57% 51%)" />
        </View>
      ) : error ? (
        <View className="px-6 py-8">
          <InlineErrorCard message={error} onRetry={load} />
        </View>
      ) : profile ? (
        <View className="pb-8">
          <View className="h-44 bg-muted">
            {profile.cover_url ? (
              <Image
                source={{ uri: profile.cover_url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : null}
          </View>

          <View className="px-6" style={{ marginTop: -36 }}>
            <View className="flex-row items-end justify-between mb-3">
              <UserAvatar
                name={profile.name}
                imageUri={profile.avatar_url}
                size={72}
                serif
              />
              <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border mb-1">
                <Users size={12} color="hsl(39 57% 51%)" />
                <Text className="text-[10px] font-semibold text-muted-foreground">
                  {profile.post_count} posts
                </Text>
              </View>
            </View>

            <Text className="text-2xl font-serif font-bold text-foreground">{profile.name}</Text>
            {profile.studio_name ? (
              <Text className="text-sm font-medium text-primary mt-1">{profile.studio_name}</Text>
            ) : null}
            {profile.bio ? (
              <Text className="text-sm text-muted-foreground mt-1 leading-5">{profile.bio}</Text>
            ) : null}

            {!sessionToken ? (
              <TouchableOpacity
                onPress={() => router.push('/login' as never)}
                activeOpacity={0.85}
                className="mt-4 self-start px-4 py-2.5 rounded-xl bg-primary"
              >
                <Text className="text-xs font-bold text-white">Sign in to add Clay Friends</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {photoPosts.length === 0 ? (
            <View className="px-6 py-10">
              <Text className="text-sm text-muted-foreground text-center leading-5">
                No public photos yet. Check back after they share work with photos.
              </Text>
            </View>
          ) : (
            <View className="mt-4 flex-row flex-wrap" style={{ gap: GRID_GAP }}>
              {photoPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  activeOpacity={0.88}
                  onPress={() => post.image_url && setLightboxUri(post.image_url)}
                  style={{ width: tileSize, height: tileSize }}
                >
                  <Image
                    source={{ uri: post.image_url! }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ImageLightbox
            visible={lightboxUri != null}
            uri={lightboxUri ?? undefined}
            onClose={() => setLightboxUri(null)}
          />
        </View>
      ) : null}

      <PickSheet
        visible={shareMenuVisible}
        title="Share profile"
        options={shareMenuOptions}
        onCancel={closeShareMenu}
        layout="list"
      />
    </DetailScreenShell>
  );
}
