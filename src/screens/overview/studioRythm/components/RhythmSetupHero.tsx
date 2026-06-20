import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, Sparkles } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { RHYTHM_BROWN } from '../rhythmTheme';

interface RhythmSetupHeroProps {
  onStart: () => void;
}

const BENEFITS = [
  'Daily missions on your overview',
  'Trim reminders from your drying times',
  'A clear picture of your week',
];

export function RhythmSetupHero({ onStart }: RhythmSetupHeroProps) {
  return (
    <View className="mx-6 mb-5">
      <LinearGradient
        colors={[RHYTHM_BROWN.gradientStart, RHYTHM_BROWN.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          shadowColor: RHYTHM_BROWN.cardShadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.22,
          shadowRadius: 14,
          elevation: 5,
        }}
      >
        <View className="px-5 pt-5 pb-5">
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 1.1,
              color: RHYTHM_BROWN.heroMuted,
              textTransform: 'uppercase',
            }}
          >
            Start here
          </Text>
          <Text
            className="font-serif mt-2"
            style={{ fontSize: 22, lineHeight: 30, color: RHYTHM_BROWN.heroText }}
          >
            Shape your studio week
          </Text>
          <Text className="text-[13px] leading-5 mt-2" style={{ color: RHYTHM_BROWN.heroMuted }}>
            Pick which days you throw, trim, and glaze. The app turns that into a simple daily checklist — nothing fancy required.
          </Text>

          <View className="mt-4 gap-2">
            {BENEFITS.map((benefit) => (
              <View key={benefit} className="flex-row items-center gap-2">
                <Sparkles size={12} color={RHYTHM_BROWN.progressFill} />
                <Text className="text-xs leading-4" style={{ color: RHYTHM_BROWN.heroMuted }}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={onStart}
            activeOpacity={0.88}
            className="mt-5 rounded-2xl flex-row items-center justify-center gap-2 py-3.5"
            style={{ backgroundColor: '#FFF3DF' }}
          >
            <CalendarDays size={16} color={RHYTHM_BROWN.accentDark} />
            <Text className="text-sm font-bold" style={{ color: RHYTHM_BROWN.accentDark }}>
              Set up weekly schedule
            </Text>
          </TouchableOpacity>

          <Text className="text-[11px] text-center mt-3" style={{ color: 'rgba(255, 244, 224, 0.65)' }}>
            Takes about 1 minute · Drying timers already have sensible defaults
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
