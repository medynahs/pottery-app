import { Text } from '@/src/components/ui/text';
import {
  CEMETERY_ACCENT,
  CEMETERY_PILL_ACTIVE,
  CEMETERY_PILL_ACTIVE_BORDER,
  CEMETERY_TEXT,
  CEMETERY_TEXT_MUTED,
} from '@/src/screens/pieces/cemeteryTheme';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaIcon?: LucideIcon;
  onCtaPress?: () => void;
  variant?: 'default' | 'cemetery';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaIcon: CtaIcon,
  onCtaPress,
  variant = 'default',
}: EmptyStateProps) {
  const isCemetery = variant === 'cemetery';

  const content = (
    <>
      {Icon ? (
        <View
          className={isCemetery ? 'w-14 h-14 rounded-full items-center justify-center mb-1' : 'w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-1'}
          style={isCemetery ? { backgroundColor: 'rgba(74, 50, 36, 0.55)' } : undefined}
        >
          <Icon size={26} color={isCemetery ? CEMETERY_ACCENT : 'hsl(39 57% 51%)'} />
        </View>
      ) : null}
      <Text
        className={`text-base font-serif font-bold text-center ${isCemetery ? '' : 'text-foreground'}`}
        style={isCemetery ? { color: CEMETERY_TEXT } : undefined}
      >
        {title}
      </Text>
      {description ? (
        <Text
          className={`text-sm text-center leading-relaxed ${isCemetery ? '' : 'text-muted-foreground'}`}
          style={isCemetery ? { color: CEMETERY_TEXT_MUTED } : undefined}
        >
          {description}
        </Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <TouchableOpacity
          onPress={onCtaPress}
          className={isCemetery ? 'flex-row items-center gap-2 px-5 py-3 mt-3 rounded-2xl' : 'flex-row items-center gap-2 px-5 py-3 mt-3 rounded-2xl bg-primary'}
          style={
            isCemetery
              ? {
                  backgroundColor: CEMETERY_PILL_ACTIVE,
                  borderWidth: 1,
                  borderColor: CEMETERY_PILL_ACTIVE_BORDER,
                }
              : undefined
          }
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
        >
          {CtaIcon ? (
            <CtaIcon size={16} color={isCemetery ? CEMETERY_ACCENT : 'white'} />
          ) : null}
          <Text
            className={`text-sm font-bold ${isCemetery ? '' : 'text-white'}`}
            style={isCemetery ? { color: CEMETERY_ACCENT } : undefined}
          >
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </>
  );
 
  return <View className="items-center py-16 px-8 gap-2">{content}</View>;
}
