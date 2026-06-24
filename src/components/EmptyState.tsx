import { Text } from '@/src/components/ui/text';
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
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaIcon: CtaIcon,
  onCtaPress,
}: EmptyStateProps) {
  const content = (
    <>
      {Icon ? (
        <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-1">
          <Icon size={26} color="hsl(39 57% 51%)" />
        </View>
      ) : null}
      <Text className="text-base font-serif font-bold text-foreground text-center">{title}</Text>
      {description ? (
        <Text className="text-sm text-muted-foreground text-center leading-relaxed">{description}</Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <TouchableOpacity
          onPress={onCtaPress}
          className="flex-row items-center gap-2 px-5 py-3 mt-3 rounded-2xl bg-primary"
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
        >
          {CtaIcon ? <CtaIcon size={16} color="white" /> : null}
          <Text className="text-sm font-bold text-white">{ctaLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );
 
  return <View className="items-center py-16 px-8 gap-2">{content}</View>;
}
