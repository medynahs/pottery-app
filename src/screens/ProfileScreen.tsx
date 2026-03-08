// src/screens/ProfileScreen.tsx
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Flame, Gift, Heart, Sparkles, TrendingUp, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

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

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-6 pt-20 pb-6">
        <Text className="text-3xl font-serif font-bold text-foreground">Profile</Text>
        <Text className="text-muted-foreground mt-1 text-sm">Settings & Lightweight community insights</Text>
      </View>

      {/* Wrapped Teaser */}
      <View className="px-6 mb-8">
        <TouchableOpacity activeOpacity={0.88}>
          <View
            className="rounded-3xl p-6 overflow-hidden relative"
            style={{ backgroundColor: 'hsl(260 15% 48%)' }}
          >
            {/* Decorative blob */}
            <View
              className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />
            <View className="absolute top-5 right-5">
              <Sparkles size={22} color="rgba(255,235,130,0.8)" />
            </View>

            <Text className="text-2xl font-serif font-bold text-white mb-2">
              Your 2024 Wrapped is Ready
            </Text>
            <Text className="text-sm mb-6 max-w-[80%]" style={{ color: 'rgba(255,255,255,0.75)' }}>
              142 pieces made. 12 failures honored. Endless learning. Tap to see your journey.
            </Text>

            <Button className="bg-white rounded-xl self-start">
              <Text className="text-sm font-medium" style={{ color: 'hsl(145 20% 22%)' }}>
                Play Story
              </Text>
            </Button>
          </View>
        </TouchableOpacity>
      </View>

      {/* Studio Pulse */}
      <View className="px-6 mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <Users size={18} color="hsl(15 50% 50%)" />
          <Text className="font-serif text-xl font-bold text-foreground">Studio Pulse This Week</Text>
        </View>

        <View className="flex-row gap-4 mb-4">
          {/* Stat: Most fired temp */}
          <Card className="flex-1 p-5 items-center justify-center overflow-hidden">
            <View
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: 'hsl(213 94% 68%)', borderRadius: 0 }}
            />
            <TrendingUp size={24} color="hsl(213 94% 58%)" style={{ marginBottom: 8 }} />
            <Text className="text-2xl font-serif font-bold text-foreground">Cone 6</Text>
            <Text className="text-xs text-muted-foreground mt-1 text-center">Most fired temp</Text>
          </Card>

          {/* Stat: Kilns loaded */}
          <Card className="flex-1 p-5 items-center justify-center overflow-hidden">
            <View
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: 'hsl(25 95% 60%)', borderRadius: 0 }}
            />
            <Flame size={24} color="hsl(25 95% 53%)" style={{ marginBottom: 8 }} />
            <Text className="text-2xl font-serif font-bold text-foreground">18</Text>
            <Text className="text-xs text-muted-foreground mt-1 text-center">Kilns loaded</Text>
          </Card>
        </View>

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
