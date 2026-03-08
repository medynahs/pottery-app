// src/screens/ProfileScreen.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Gift, Heart } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';

const MOMENTS = [
  {
    Icon: Heart,
    iconBg: 'bg-pink-100',
    iconColor: 'hsl(340 82% 52%)',
    text: 'Susan is incredibly proud of her first matching mug set.',
    highlight: 'Susan',
  },
  {
    Icon: Gift,
    iconBg: 'bg-accent/20',
    iconColor: 'hsl(38 55% 45%)',
    text: 'Mike shared a new roadmap template for centering large amounts of clay.',
    highlight: 'Mike',
  },
];

export default function CommunityScreen() {
  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-6 pt-20 pb-6">
        <Text className="text-3xl font-serif font-bold text-foreground">Community</Text>
        <Text className="text-muted-foreground mt-1 text-sm">Settings & Lightweight community insights</Text>
      </View>

      <View className="px-6 mb-6">
        {/* Moments of Joy */}
        <Card className="p-5">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Moments of Joy
          </Text>
          <View className="gap-4">
            {MOMENTS.map(({ Icon, iconBg, iconColor, text, highlight }, i) => (
              <View key={i}>
                {i > 0 && <View className="h-px bg-border mb-4" />}
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center flex-shrink-0`}>
                    <Icon size={18} color={iconColor} />
                  </View>
                  <Text className="text-sm text-foreground flex-1 leading-relaxed">
                    <Text className="font-semibold text-foreground">{highlight} </Text>
                    {text.replace(highlight + ' ', '')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
