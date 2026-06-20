import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { JOURNEY_ACCENTS, PROFILE_THEME } from '../profileTheme';

type AccentKey = keyof typeof JOURNEY_ACCENTS;

export function ProfileSectionCard({
  title,
  hint,
  children,
  accent = 'stats',
  icon,
  trailing,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  accent?: AccentKey;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  const palette = JOURNEY_ACCENTS[accent];

  return (
    <View
      className="rounded-[24px] mb-4 overflow-hidden"
      style={{
        backgroundColor: PROFILE_THEME.cardBg,
        borderWidth: 1,
        borderColor: palette.border,
        shadowColor: PROFILE_THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View
        className="px-4 py-3.5 flex-row items-center gap-3"
        style={{ backgroundColor: palette.bg, borderBottomWidth: 1, borderBottomColor: palette.border }}
      >
        {icon ? (
          <View
            className="w-10 h-10 rounded-2xl items-center justify-center"
            style={{ backgroundColor: PROFILE_THEME.cardBg, borderWidth: 1, borderColor: palette.border }}
          >
            {icon}
          </View>
        ) : null}
        <View className="flex-1">
          <Text className="text-[15px] font-serif font-bold" style={{ color: palette.color }}>
            {title}
          </Text>
          {hint ? (
            <Text className="text-[11px] mt-0.5 leading-4" style={{ color: PROFILE_THEME.inkMuted }}>
              {hint}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
      <View className="p-4">{children}</View>
    </View>
  );
}
