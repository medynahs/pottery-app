import { Text } from '@/src/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { RHYTHM_BROWN } from '../rhythmTheme';

interface RhythmSectionCardProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  hint: string;
  value?: string;
  onPress: () => void;
  isLast?: boolean;
  recommended?: boolean;
}

export function RhythmSectionCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  hint,
  value,
  onPress,
  isLast = false,
  recommended = false,
}: RhythmSectionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`flex-row items-center gap-3 py-4 ${!isLast ? 'border-b' : ''}`}
      style={{ borderBottomColor: 'hsl(34 30% 90%)' }}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center border"
        style={{ backgroundColor: iconBg, borderColor: RHYTHM_BROWN.surfaceBorder }}
      >
        <Icon size={18} color={iconColor} />
      </View>
      <View className="flex-1 pr-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-bold" style={{ color: RHYTHM_BROWN.ink }}>
            {label}
          </Text>
          {recommended ? (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: RHYTHM_BROWN.accentDark }}>
              <Text className="text-[9px] font-bold uppercase" style={{ color: '#FFF3DF' }}>
                Start
              </Text>
            </View>
          ) : null}
        </View>
        <Text className="text-xs leading-4 mt-0.5" style={{ color: RHYTHM_BROWN.inkMuted }}>
          {hint}
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        {value ? (
          <Text className="text-xs font-semibold mr-1" style={{ color: RHYTHM_BROWN.inkSoft }}>
            {value}
          </Text>
        ) : null}
        <ChevronRight size={15} color={RHYTHM_BROWN.inkMuted} />
      </View>
    </TouchableOpacity>
  );
}
