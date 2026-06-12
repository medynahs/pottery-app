import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import React from 'react';
import { View } from 'react-native';

type Props = {
  avatar: string;
  name: string;
  avatarColor: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
  time: string;
};

export function PostHeader({ avatar, name, avatarColor, tag, tagBg, tagColor, time }: Props) {
  return (
    <View className="flex-row items-center gap-2.5 mb-3">
      <UserAvatar initial={avatar} size={36} backgroundColor={avatarColor} />
      <View className="flex-1 flex-row items-center gap-2 flex-wrap">
        <Text className="text-sm font-bold text-foreground">{name}</Text>
        {tag ? (
          <View className={`px-2 py-0.5 rounded-full ${tagBg}`}>
            <Text className="text-xs font-semibold" style={{ color: tagColor }}>{tag}</Text>
          </View>
        ) : null}
      </View>
      <Text className="text-xs text-muted-foreground">{time}</Text>
    </View>
  );
}
