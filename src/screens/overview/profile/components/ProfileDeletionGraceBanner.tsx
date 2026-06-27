import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import { useAccountDeletionGrace } from '@/src/hooks/useAccountDeletionGrace';
import { useReviveAccount } from '@/src/hooks/useReviveAccount';
import { AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

export function ProfileDeletionGraceBanner() {
  const { inGrace, subtitle } = useAccountDeletionGrace();
  const { revive, busy } = useReviveAccount();

  if (!inGrace) return null;

  return (
    <View className="mx-4 mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
      <View className="flex-row items-start gap-3">
        <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-xl bg-red-100">
          <AlertTriangle size={18} color="hsl(0 55% 45%)" />
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-semibold text-foreground">Account scheduled for deletion</Text>
          <Text className="text-xs text-muted-foreground mt-1 leading-4">{subtitle}</Text>
          <View className="mt-3">
            <PrimaryButton
              label={busy ? 'Restoring…' : 'Restore my account'}
              onPress={() => void revive()}
              disabled={busy}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
