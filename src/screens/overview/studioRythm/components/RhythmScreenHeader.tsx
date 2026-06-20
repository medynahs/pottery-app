import { Text } from '@/src/components/ui/text';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { RHYTHM_BROWN } from '../rhythmTheme';

interface RhythmScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function RhythmScreenHeader({ title, subtitle, onBack }: RhythmScreenHeaderProps) {
  const router = useRouter();

  return (
    <View
      className="px-4 pt-14 pb-4 border-b"
      style={{ backgroundColor: RHYTHM_BROWN.surface, borderBottomColor: RHYTHM_BROWN.surfaceBorder }}
    >
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onBack ?? (() => router.back())}
          className="w-10 h-10 items-center justify-center rounded-full mr-3 border"
          style={{ backgroundColor: RHYTHM_BROWN.iconBg, borderColor: RHYTHM_BROWN.surfaceBorder }}
        >
          <ChevronDown size={20} color={RHYTHM_BROWN.iconColor} style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold font-serif" style={{ color: RHYTHM_BROWN.ink }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs mt-0.5 leading-4" style={{ color: RHYTHM_BROWN.inkMuted }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
