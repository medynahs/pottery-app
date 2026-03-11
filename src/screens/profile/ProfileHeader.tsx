import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronLeft, Edit3, Share2, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { EditProfileModal } from './EditProfileModal';

const XP = 2340;
const XP_MAX = 3000;
const xpPct = XP / XP_MAX;

export function ProfileHeader({ onBack }: { onBack: () => void }) {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [editVisible, setEditVisible] = useState(false);

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setUser({ coverImageUri: result.assets[0].uri });
    }
  };

  const pickAvatarImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setUser({ avatarImageUri: result.assets[0].uri });
    }
  };

  const studioLine = [user.studioName, user.location].filter(Boolean).join(' · ');

  return (
    <>
      {/* Cover Strip */}
      <View className="w-full h-36" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
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
        <TouchableOpacity
          onPress={pickCoverImage}
          activeOpacity={0.75}
          className="absolute top-12 right-4 bg-black/25 rounded-full p-2.5"
        >
          <Camera size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View className="px-6 mb-5" style={{ marginTop: -44 }}>
        <View className="flex-row items-end justify-between mb-3">
          {/* Avatar */}
          <TouchableOpacity activeOpacity={0.8} onPress={pickAvatarImage} className="relative">
            <View
              className="rounded-full items-center justify-center border-4 border-background"
              style={{ width: 88, height: 88, backgroundColor: user.avatarImageUri ? 'transparent' : 'hsl(15 50% 50%)' }}
            >
              {user.avatarImageUri ? (
                <Image
                  source={{ uri: user.avatarImageUri }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-white font-serif font-bold" style={{ fontSize: 36 }}>
                  {user.avatarInitial}
                </Text>
              )}
            </View>
            {/* Camera badge */}
            <View className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/50 items-center justify-center border-2 border-background">
              <Camera size={11} color="white" />
            </View>
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
          <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
            <Text className="text-xs font-semibold text-white">✦ Lv. 12</Text>
          </View>
        </View>
        {studioLine ? (
          <Text className="text-sm font-medium text-primary mb-1">{studioLine}</Text>
        ) : null}
        {user.bio ? (
          <Text className="text-sm text-muted-foreground leading-relaxed mb-4">{user.bio}</Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* XP Bar */}
        <View className="bg-card border border-border rounded-2xl px-4 pt-3 pb-3">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center gap-1.5">
              <Zap size={13} color="hsl(38 80% 50%)" />
              <Text className="text-xs font-semibold text-foreground">Craft Artisan · Lv. 12</Text>
            </View>
            <Text className="text-xs text-muted-foreground">
              {XP.toLocaleString()} / {XP_MAX.toLocaleString()} XP
            </Text>
          </View>
          <View className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${xpPct * 100}%`, backgroundColor: 'hsl(38 80% 50%)' }}
            />
          </View>
          <Text className="text-xs text-muted-foreground mt-1.5">
            {(XP_MAX - XP).toLocaleString()} XP until{' '}
            <Text className="font-semibold text-foreground">Master Potter</Text>
          </Text>
        </View>
      </View>

      <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} />
    </>
  );
}
