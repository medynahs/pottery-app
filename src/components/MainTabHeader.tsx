import { Text } from '@/src/components/ui/text';
import {
  CEMETERY_ACCENT,
  CEMETERY_PILL_ACTIVE,
  CEMETERY_PILL_ACTIVE_BORDER,
  CEMETERY_TEXT,
  CEMETERY_TEXT_MUTED,
} from '@/src/screens/pieces/cemeteryTheme';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface MainTabHeaderProps {
  title: string;
  description?: string;
  onPress?: () => void;
  pressIcon?: React.ReactNode;
  actionText?: string;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'cemetery';
}

export const MainTabHeader = React.memo(function MainTabHeader({
  title,
  description,
  onPress,
  pressIcon,
  actionText,
  rightElement,
  variant = 'default',
}: MainTabHeaderProps) {
  const isCemetery = variant === 'cemetery';

  return (
    <View className="px-6 pt-16 flex-row items-center justify-between">
      <View className="flex-1 pr-4">
        <Text
          className={`text-3xl font-serif font-bold ${isCemetery ? '' : 'text-foreground'}`}
          style={isCemetery ? { color: CEMETERY_TEXT } : undefined}
        >
          {title}
        </Text>
        {description ? (
          <Text
            className={`text-sm mt-0.5 ${isCemetery ? '' : 'text-muted-foreground'}`}
            style={isCemetery ? { color: CEMETERY_TEXT_MUTED } : undefined}
          >
            {description}
          </Text>
        ) : null}
      </View>

      {rightElement}
      {!rightElement && onPress && actionText && pressIcon ? (
        <TouchableOpacity
          onPress={onPress}
          className={isCemetery ? '' : 'flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary'}
          activeOpacity={0.85}
          style={
            isCemetery
              ? {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 20,
                  paddingHorizontal: 18,
                  paddingVertical: 13,
                  backgroundColor: CEMETERY_PILL_ACTIVE,
                  borderWidth: 1,
                  borderColor: CEMETERY_PILL_ACTIVE_BORDER,
                  shadowColor: '#0A0604',
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 4,
                }
              : {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  shadowColor: '#8B6A2A',
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 4,
                }
          }
        >
          {pressIcon}
          <Text
            className={`text-sm font-semibold ${isCemetery ? '' : 'text-white'}`}
            style={isCemetery ? { color: CEMETERY_ACCENT } : undefined}
          >
            {actionText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
});
