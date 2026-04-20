// src/screens/community/tabs/EventsTab.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export function EventsTab() {
  return (
    <>
      <View
        className="rounded-3xl border border-pink-200 p-5 overflow-hidden"
        style={{ backgroundColor: 'hsl(340 30% 97%)' }}
      >
        <View className="px-2.5 py-0.5 rounded-full bg-pink-100 self-start mb-2">
          <Text className="text-xs font-bold" style={{ color: 'hsl(340 75% 50%)' }}>Live Event</Text>
        </View>
        <Text className="text-xl font-serif font-bold text-foreground">Secret Santa Pottery 🎁</Text>
        <Text className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Exchange a handmade piece anonymously. Sign-ups close this week.
        </Text>
        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity
            className="flex-1 py-2.5 rounded-xl items-center"
            style={{ backgroundColor: 'hsl(340 75% 50%)' }}
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-bold">Sign me up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-5 py-2.5 rounded-xl items-center bg-card border border-border"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-medium text-foreground">Learn more</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Card className="p-4">
        <View className="flex-row items-center gap-2 mb-3">
          <MapPin size={13} color="hsl(15 50% 50%)" />
          <Text className="text-xs font-bold text-primary">Near You</Text>
        </View>
        <Text className="text-sm text-muted-foreground">Studio social and kiln-share meetups this weekend.</Text>
      </Card>
    </>
  );
}
