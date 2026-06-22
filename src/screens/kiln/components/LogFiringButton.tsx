import { Text } from '@/src/components/ui/text';
import { BrandColors, Colors } from '@/src/constants/theme';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, type ViewStyle } from 'react-native';

type LogFiringButtonProps = {
  onPress: () => void;
  variant?: 'outline' | 'primary' | 'cta';
  className?: string;
  style?: ViewStyle;
};

const VARIANT_CLASS: Record<NonNullable<LogFiringButtonProps['variant']>, string> = {
  outline:
    'flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-card',
  primary: 'flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-primary',
  cta: 'mt-4 px-4 py-2.5 rounded-xl bg-primary flex-row items-center justify-center gap-1.5',
};

const TEXT_CLASS: Record<NonNullable<LogFiringButtonProps['variant']>, string> = {
  outline: 'text-sm font-semibold text-primary',
  primary: 'text-xs font-semibold text-primary-foreground',
  cta: 'text-sm font-semibold text-primary-foreground',
};

export function LogFiringButton({
  onPress,
  variant = 'primary',
  className,
  style,
}: LogFiringButtonProps) {
  const iconColor =
    variant === 'outline' ? BrandColors.primary : Colors.light.primaryForeground;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Record past firing"
      className={className ?? VARIANT_CLASS[variant]}
      style={style}
    >
      <Plus size={variant === 'outline' ? 14 : 15} color={iconColor} />
      <Text className={TEXT_CLASS[variant]}>Record past</Text>
    </TouchableOpacity>
  );
}
