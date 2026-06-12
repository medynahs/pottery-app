import { Text } from '@/src/components/ui/text';
import React from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Optional leading element (lucide icon, Google "G" badge, …). Hidden while loading. */
  icon?: React.ReactNode;
  variant?: 'primary' | 'outline';
}

/**
 * The app's main CTA button: 56pt tall, rounded-2xl, primary gold fill
 * (or bordered card for the outline variant) with a built-in loading spinner.
 * Replaces the inline TouchableOpacity copies that lived in every auth screen.
 */
export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isBlocked = loading || disabled;
  const base = 'h-14 rounded-2xl flex-row items-center justify-center gap-3';
  const fill = variant === 'primary'
    ? `bg-primary ${isBlocked ? 'opacity-60' : ''}`
    : `border border-border bg-card ${isBlocked ? 'opacity-60' : ''}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isBlocked}
      activeOpacity={0.82}
      className={`${base} ${fill}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : 'hsl(24 30% 40%)'} />
      ) : (
        <>
          {icon}
          <Text
            className={
              variant === 'primary'
                ? 'text-base font-semibold text-white'
                : 'text-sm font-semibold text-foreground'
            }
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
