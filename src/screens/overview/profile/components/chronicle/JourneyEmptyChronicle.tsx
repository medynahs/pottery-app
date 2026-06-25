import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { Box, Sparkles } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { JOURNEY_PAGE } from '../../journeyTheme';

export function JourneyEmptyChronicle() {
  return (
    <View className="mx-6 mb-6 rounded-[28px] overflow-hidden border" style={{ borderColor: JOURNEY_PAGE.parchmentBorder }}>
      <LinearGradient colors={['#E8D4A8', '#FFFBF2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View className="px-6 py-10 items-center">
          <View
            className="w-16 h-16 rounded-[22px] items-center justify-center mb-4 border"
            style={{ backgroundColor: 'rgba(255,255,255,0.55)', borderColor: JOURNEY_PAGE.parchmentBorder }}
          >
            <Box size={30} color="hsl(39 57% 51%)" />
          </View>
          <View className="flex-row items-center gap-1.5 mb-2">
            <Sparkles size={12} color="hsl(35 65% 32%)" />
            <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'hsl(35 65% 32%)' }}>
              Blank page
            </Text>
          </View>
          <Text
            className="font-serif text-2xl text-center leading-8 mb-2"
            style={{ color: 'hsl(24 55% 22%)', fontFamily: 'Fraunces_700Bold' }}
          >
            Your chronicle awaits
          </Text>
          <Text className="text-sm text-center leading-6" style={{ color: 'hsl(32 28% 44%)' }}>
            Add your first piece and the studio will start writing your story — stats, milestones, and achievements.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
