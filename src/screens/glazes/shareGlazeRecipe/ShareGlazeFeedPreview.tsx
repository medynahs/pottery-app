import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { useAppStore } from '@/src/store';
import { Image } from 'expo-image';
import { MessageCircle } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

type ShareGlazeFeedPreviewProps = {
  caption: string;
  photoUri?: string;
};

export function ShareGlazeFeedPreview({ caption, photoUri }: ShareGlazeFeedPreviewProps) {
  const user = useAppStore((s) => s.user);
  const displayName = user.studioName?.trim() || user.name?.trim() || 'Your studio';

  return (
    <Card className="p-4">
      <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Feed preview
      </Text>
      <View className="flex-row items-center gap-3 mb-3">
        <UserAvatar initial={displayName.slice(0, 1).toUpperCase()} size={36} />
        <View className="flex-1">
          <Text className="text-xs font-bold text-foreground">{displayName}</Text>
          <Text className="text-xs text-muted-foreground">just now · you</Text>
        </View>
      </View>

      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ height: 180, borderRadius: 12, marginBottom: 10 }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : null}

      {caption ? (
        <Text className="text-sm text-foreground leading-relaxed mb-3">{caption}</Text>
      ) : null}

      <View className="flex-row items-center gap-4">
        <Text className="text-lg">🔥 ✨ 🎯 💫</Text>
        <View style={{ flex: 1 }} />
        <View className="flex-row items-center gap-1.5">
          <MessageCircle size={14} color="hsl(24 20% 55%)" />
          <Text className="text-xs text-muted-foreground">0</Text>
        </View>
      </View>
    </Card>
  );
}
