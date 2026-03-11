import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import { ChevronLeft, Edit3, Share2, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { EditProfileModal } from './EditProfileModal';

const XP = 2340;
const XP_MAX = 3000;
const xpPct = XP / XP_MAX;
const LEVEL = 12;
const TITLE = 'Craft Artisan';
const NEXT_TITLE = 'Master Potter';

export function ProfileHeader({ onBack }: { onBack: () => void }) {
  const user = useAppStore((s) => s.user);
  const [editVisible, setEditVisible] = useState(false);
  const [xpTooltip, setXpTooltip] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(false);


  const studioLine = [user.studioName, user.location].filter(Boolean).join(' · ');

  return (
    <>
      {/* Cover Strip */}
      <View className="w-full h-40" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
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
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - xpPct)}`}
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
                <Text style={{ fontSize: 10, fontWeight: '700', color: 'white' }}>{TITLE}</Text>
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
                <Text className="text-xs font-bold text-foreground">{TITLE} · Lv. {LEVEL}</Text>
              </View>
              <Text className="text-xs text-muted-foreground">{XP.toLocaleString()} / {XP_MAX.toLocaleString()} XP</Text>
            </View>
            <View className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <View className="h-full rounded-full" style={{ width: `${xpPct * 100}%`, backgroundColor: 'hsl(38 80% 50%)' }} />
            </View>
            <Text className="text-xs text-muted-foreground mt-1.5">
              {(XP_MAX - XP).toLocaleString()} XP until <Text className="font-semibold text-foreground">{NEXT_TITLE}</Text>
            </Text>
          </View>
        ) : null}
        {studioLine ? (
          <Text className="text-sm font-medium text-primary mb-1">{studioLine}</Text>
        ) : null}
        {user.bio ? (
          <Text className="text-sm text-muted-foreground leading-relaxed mb-0">{user.bio}</Text>
        ) : (
          <View className="mb-0" />
        )}

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
