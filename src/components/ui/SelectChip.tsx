import { BrandColors } from '@/src/constants/theme';
import { Text } from '@/src/components/ui/text';
import type { ComponentType } from 'react';

type ChipIcon = ComponentType<{ size: number; color: string }>;
import React from 'react';
import { Pressable, View } from 'react-native';

type SelectChipVariant = 'accent' | 'inverted';

interface SelectChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: ChipIcon;
  variant?: SelectChipVariant;
  allowDeselect?: boolean;
  className?: string;
}

export function SelectChip({
  label,
  selected,
  onPress,
  icon: Icon,
  variant = 'accent',
  allowDeselect = false,
  className = '',
}: SelectChipProps) {
  const handlePress = () => {
    if (selected && !allowDeselect) return;
    onPress();
  };

  const shellClass =
    variant === 'accent'
      ? selected
        ? 'bg-card border-primary'
        : 'bg-background border-border'
      : selected
        ? 'bg-foreground border-foreground'
        : 'bg-card border-border';

  const textClass =
    variant === 'accent'
      ? selected
        ? 'text-primary'
        : 'text-muted-foreground'
      : selected
        ? 'text-background'
        : 'text-muted-foreground';

  const iconColor =
    variant === 'accent'
      ? selected
        ? BrandColors.primaryHex
        : 'hsl(24 20% 40%)'
      : selected
        ? BrandColors.primarySoft
        : 'hsl(24 20% 40%)';

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${shellClass} ${className}`}
    >
      {Icon ? <Icon size={13} color={iconColor} /> : null}
      <Text className={`text-xs font-medium ${textClass}`}>{label}</Text>
    </Pressable>
  );
}

interface SelectChipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectChipGroup({ children, className = '' }: SelectChipGroupProps) {
  return <View className={`flex-row flex-wrap gap-2 ${className}`}>{children}</View>;
}
