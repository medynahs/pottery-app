// src/screens/community/components/Reactions.tsx
import { Text } from '@/src/components/ui/text';
import { Bookmark, Gift, Heart, MessageCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

type Props = {
  likes: number;
  comments: number;
  saveable?: boolean;
};

export function Reactions({ likes, comments, saveable }: Props) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-border">
      <TouchableOpacity
        className="flex-row items-center gap-1.5"
        activeOpacity={0.7}
        onPress={() => setLiked(l => !l)}
      >
        <Heart
          size={14}
          color={liked ? 'hsl(340 75% 50%)' : 'hsl(24 20% 55%)'}
          fill={liked ? 'hsl(340 75% 50%)' : 'none'}
        />
        <Text className="text-xs text-muted-foreground">{liked ? likes + 1 : likes}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
        <MessageCircle size={14} color="hsl(24 20% 55%)" />
        <Text className="text-xs text-muted-foreground">{comments}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center gap-1.5 ml-auto" activeOpacity={0.7}>
        <Gift size={13} color="#8B6A2A" />
        <Text className="text-xs text-primary font-medium">Celebrate</Text>
      </TouchableOpacity>

      {saveable && (
        <TouchableOpacity
          className="flex-row items-center gap-1"
          activeOpacity={0.7}
          onPress={() => setSaved(s => !s)}
        >
          <Bookmark
            size={14}
            color={saved ? 'hsl(213 80% 55%)' : 'hsl(24 20% 55%)'}
            fill={saved ? 'hsl(213 80% 55%)' : 'none'}
          />
          <Text
            className="text-xs"
            style={{ color: saved ? 'hsl(213 80% 55%)' : 'hsl(24 20% 55%)' }}
          >
            {saved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
