import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface InlineErrorCardProps {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}

export function InlineErrorCard({ message, onRetry, retryLabel = 'Retry' }: InlineErrorCardProps) {
  return (
    <Card className="p-5 items-center gap-3">
      <Text className="text-sm text-muted-foreground text-center">{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        className="px-5 py-2 rounded-xl bg-primary"
        activeOpacity={0.8}
      >
        <Text className="text-sm font-semibold text-white">{retryLabel}</Text>
      </TouchableOpacity>
    </Card>
  );
}
