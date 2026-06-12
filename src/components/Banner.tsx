import { Text } from '@/src/components/ui/text';
import { CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface BannerProps {
  message: string;
  intent?: 'error' | 'success';
  className?: string;
}

/**
 * Inline feedback banner shown above forms — red for errors, green for
 * success. Replaces the identical bg-red-50 boxes copied across the auth
 * screens and profile modals.
 */
export function Banner({ message, intent = 'error', className = '' }: BannerProps) {
  if (intent === 'success') {
    return (
      <View className={`rounded-2xl bg-green-50 border border-green-200 px-4 py-3 flex-row items-center gap-2 ${className}`}>
        <CheckCircle2 size={16} color="hsl(135 45% 35%)" />
        <Text className="text-sm text-green-700 flex-1">{message}</Text>
      </View>
    );
  }
  return (
    <View className={`rounded-2xl bg-red-50 border border-red-200 px-4 py-3 ${className}`}>
      <Text className="text-sm text-red-600">{message}</Text>
    </View>
  );
}
