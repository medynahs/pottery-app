import { Text } from '@/src/components/ui/text';
import { apiListFriends } from '@/src/services/friends';
import { apiListMemberStudios, apiListOwnedStudios } from '@/src/services/studios';
import { useAppStore } from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import { ChevronLeft, Edit3, Palette, Settings, Share2, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useProfileLevel } from '../hooks/useProfileLevel';
import { EditProfileModal } from './EditProfileModal';

export function ProfileHeader({
  onBack,
  onOpenAccountSettings,
}: {
  onBack: () => void;
  onOpenAccountSettings: () => void;
}) {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const sessionToken = useAppStore((s) => s.sessionToken);
  const pieceCount = useAppStore((s) => s.pieces.length);
  void pieceCount; // kept in store but no longer shown in stat strip
  const { progress, title, nextTitle, earnedCount, totalBadges, badgesUntilNext } = useProfileLevel();
  const [editVisible, setEditVisible] = useState(false);
  const [xpTooltip, setXpTooltip] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(false);
  const [friendCount, setFriendCount] = useState<number | null>(null);
  const [studioCount, setStudioCount] = useState<number | null>(null);

  const loadStats = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const [friends, owned, member] = await Promise.all([
        apiListFriends(sessionToken),
        apiListOwnedStudios(sessionToken),
        apiListMemberStudios(sessionToken),
      ]);
      setFriendCount((friends ?? []).length);
      setStudioCount((owned ?? []).length + (member ?? []).length);
    } catch { /* silent — stats are non-critical */ }
  }, [sessionToken]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const studioLine = [user.studioName, user.location].filter(Boolean).join(' · ');

  return (
    <>
      {/* Cover Strip */}
      <View className="w-full h-60" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
        {user.coverImageUri ? (
          <Image source={{ uri: user.coverImageUri }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
        ) : (
          <View
            className="absolute bottom-0 right-0 w-36 h-36 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', transform: [{ translateX: 24 }, { translateY: 24 }] }}
          />
        )}
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.75}
          className="absolute top-12 left-4 bg-black/25 rounded-full p-2.5"
        >
          <ChevronLeft size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View className="px-6 mb-5" style={{ marginTop: -44 }}>
        <View className="flex-row items-end justify-between mb-3">
          {/* Avatar with XP ring */}
          <TouchableOpacity
            activeOpacity={user.avatarImageUri ? 0.8 : 1}
            onPress={() => user.avatarImageUri && setAvatarPreview(true)}
            style={{ width: 96, height: 104 }}>
            {/* SVG progress ring */}
            <Svg width={96} height={96} style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Track */}
              <Circle cx={48} cy={48} r={44} stroke="hsl(34 30% 85%)" strokeWidth={4} fill="none" />
              {/* Progress — starts at top (rotate -90°) */}
              <Circle
                cx={48} cy={48} r={44}
                stroke="hsl(38 80% 50%)"
                strokeWidth={4}
                fill="none"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
                strokeLinecap="round"
                rotation="-90"
                origin="48,48"
              />
            </Svg>
            {/* Avatar circle inset inside the ring */}
            <View
              style={{
                position: 'absolute', top: 6, left: 6, width: 84, height: 84,
                borderRadius: 42, overflow: 'hidden',
                backgroundColor: user.avatarImageUri ? 'transparent' : 'hsl(15 50% 50%)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {user.avatarImageUri ? (
                <Image source={{ uri: user.avatarImageUri }} style={{ width: 84, height: 84, borderRadius: 42 }} resizeMode="cover" />
              ) : (
                <Text className="text-white font-serif font-bold" style={{ fontSize: 34 }}>{user.avatarInitial}</Text>
              )}
            </View>
            {/* Title badge — sits on the bottom of the ring */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setXpTooltip(v => !v)}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' }}
            >
              <View style={{
                backgroundColor: 'hsl(38 80% 50%)',
                borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
                borderWidth: 2, borderColor: 'white',
                flexDirection: 'row', alignItems: 'center', gap: 3,
              }}>
                <Zap size={8} color="white" />
                <Text style={{ fontSize: 10, fontWeight: '700', color: 'white' }}>{title}</Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>

          <View className="flex-row gap-2 mb-1">
            <TouchableOpacity
              onPress={() => setEditVisible(true)}
              className="flex-row items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card"
              activeOpacity={0.75}
            >
              <Edit3 size={14} color="hsl(15 50% 50%)" />
              <Text className="text-sm font-medium text-foreground">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/app-customization')}
              className="w-9 h-9 rounded-xl border border-border bg-card items-center justify-center"
              activeOpacity={0.75}
            >
              <Palette size={15} color="hsl(24 20% 40%)" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onOpenAccountSettings}
              className="w-9 h-9 rounded-xl border border-border bg-card items-center justify-center"
              activeOpacity={0.75}
            >
              <Settings size={15} color="hsl(24 20% 40%)" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-9 h-9 rounded-xl border border-border bg-card items-center justify-center"
              activeOpacity={0.75}
            >
              <Share2 size={15} color="hsl(24 20% 40%)" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center gap-2 flex-wrap mb-0.5">
          <Text className="text-2xl font-serif font-bold text-foreground">{user.name}</Text>
        </View>

        {/* XP tooltip — shown on title badge tap */}
        {xpTooltip ? (
          <View
            className="bg-card border border-border rounded-2xl px-4 py-3 mb-3"
            style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center gap-1.5">
                <Zap size={12} color="hsl(38 80% 50%)" />
                <Text className="text-xs font-bold text-foreground">{title}</Text>
              </View>
              <Text className="text-xs text-muted-foreground">{earnedCount} / {totalBadges} badges</Text>
            </View>
            <View className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <View className="h-full rounded-full" style={{ width: `${progress * 100}%`, backgroundColor: 'hsl(38 80% 50%)' }} />
            </View>
            <Text className="text-xs text-muted-foreground mt-1.5">
              {nextTitle
                ? <>{badgesUntilNext} badge{badgesUntilNext !== 1 ? 's' : ''} until <Text className="font-semibold text-foreground">{nextTitle}</Text></>
                : <Text className="font-semibold text-foreground">All badges earned — Studio Legend! 🏺</Text>
              }
            </Text>
          </View>
        ) : null}
        {studioLine ? (
          <Text className="text-sm font-medium text-primary mb-1">{studioLine}</Text>
        ) : null}
        {user.bio ? (
          <Text className="text-sm text-muted-foreground leading-relaxed">{user.bio}</Text>
        ) : null}

        {/* ── Social stat strip ── */}
        <View className="flex-row items-center gap-6 mt-4">
          <TouchableOpacity
            className="items-start"
            activeOpacity={0.7}
            onPress={() => router.push('/friends')}
          >
            <Text className="text-base font-bold text-foreground">
              {friendCount === null ? '—' : friendCount}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">Clay Friends</Text>
          </TouchableOpacity>

          <View className="w-px h-8 bg-border" />

          <TouchableOpacity
            className="items-start"
            activeOpacity={0.7}
            onPress={() => router.push('/studios')}
          >
            <Text className="text-base font-bold text-foreground">
              {studioCount === null ? '—' : studioCount}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">Studios</Text>
          </TouchableOpacity>
        </View>

      </View>

      <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} />

      {/* Avatar full-screen preview */}
      {user.avatarImageUri ? (
        <Modal visible={avatarPreview} animationType="fade" transparent onRequestClose={() => setAvatarPreview(false)}>
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center' }}
            onPress={() => setAvatarPreview(false)}
          >
            <Image
              source={{ uri: user.avatarImageUri }}
              style={{ width: 280, height: 280, borderRadius: 140 }}
              resizeMode="cover"
            />
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}
