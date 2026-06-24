import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import type { CommunitySeedTip } from '@/src/screens/community/data/communitySeedContent';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

type CommunitySeedTipCardProps = {
  tip: CommunitySeedTip;
};

export function CommunitySeedTipCard({ tip }: CommunitySeedTipCardProps) {
  return (
    <Card className="p-4 border-dashed">
      <View className="flex-row items-center gap-2 mb-2">
        <Sparkles size={14} color="hsl(39 57% 51%)" />
        <Text className="text-[10px] font-bold uppercase tracking-wider text-primary">
          Pottery Nook
        </Text>
      </View>
      <Text className="text-sm font-bold text-foreground">{tip.title}</Text>
      <Text className="text-sm text-muted-foreground mt-1.5 leading-5">{tip.body}</Text>
    </Card>
  );
}
