import { Text } from '@/src/components/ui/text';
import { Camera, ChevronLeft, Edit3, Share2, Zap } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

const XP = 2340;
const XP_MAX = 3000;
const xpPct = XP / XP_MAX;

export function ProfileHeader({ onBack }: { onBack: () => void }) {
  return (
    <>
      {/* Cover Strip */}
      <View className="w-full h-36" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
        <View
          className="absolute bottom-0 right-0 w-36 h-36 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', transform: [{ translateX: 24 }, { translateY: 24 }] }}
        />
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.75}
          className="absolute top-12 left-4 bg-black/25 rounded-full p-2.5"
        >
          <ChevronLeft size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} className="absolute top-12 right-4 bg-black/25 rounded-full p-2.5">
          <Camera size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View className="px-6 mb-5" style={{ marginTop: -44 }}>
        <View className="flex-row items-end justify-between mb-3">
          <View className="relative">
            <View
              className="rounded-full items-center justify-center border-4 border-background"
              style={{ width: 88, height: 88, backgroundColor: 'hsl(15 50% 50%)' }}
            >
              <Text className="text-white font-serif font-bold" style={{ fontSize: 36 }}>S</Text>
            </View>
            <View className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-background" />
          </View>
          <View className="flex-row gap-2 mb-1">
            <TouchableOpacity
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
          <Text className="text-2xl font-serif font-bold text-foreground">Susan Mallory</Text>
          <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
            <Text className="text-xs font-semibold text-white">✦ Lv. 12</Text>
          </View>
        </View>
        <Text className="text-sm font-medium text-primary mb-1">Mallory Clay Studio · Portland, OR</Text>
        <Text className="text-sm text-muted-foreground leading-relaxed mb-4">
          Wheel-thrown stoneware with a love for imperfect forms. Teaching beginners on weekends.
        </Text>

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
    </>
  );
}
