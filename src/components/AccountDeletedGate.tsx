import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import { useAccountDeletionGrace } from '@/src/hooks/useAccountDeletionGrace';
import { useReviveAccount } from '@/src/hooks/useReviveAccount';
import { ACCOUNT_DELETION_GRACE_DAYS } from '@/src/services/accountGrace';
import { useAppStore } from '@/src/store/appStore';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

export function AccountDeletedGate() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const clearSession = useAppStore((s) => s.clearSession);
  const { inGrace, subtitle } = useAccountDeletionGrace();
  const { revive, busy: reviveBusy } = useReviveAccount();
  const [signingOut, setSigningOut] = useState(false);

  const visible = inGrace && isSignedIn;

  const handleSignOut = async () => {
    if (!isSignedIn) return;
    setSigningOut(true);
    try {
      await clearSession();
    } catch {
      // Local cleanup is enough if the session is already gone.
    }
    setSigningOut(false);
  };

  const busy = reviveBusy || signingOut;

  return (
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View className="mx-6 max-w-md rounded-3xl border border-border bg-card px-6 py-7">
          <Text className="text-2xl font-serif font-bold text-foreground text-center">
            Account scheduled for deletion
          </Text>
          <Text className="text-sm text-muted-foreground leading-relaxed mt-3 text-center">
            {subtitle}
          </Text>
          <Text className="text-xs text-muted-foreground leading-relaxed mt-2 text-center">
            Studio data is paused during the {ACCOUNT_DELETION_GRACE_DAYS}-day grace period.
            Tap restore to bring back your profile, pieces, and photos.
          </Text>

          <View className="mt-6 gap-3">
            <PrimaryButton
              label={reviveBusy ? 'Restoring…' : 'Restore my account'}
              onPress={() => void revive()}
              disabled={busy}
            />
            <PrimaryButton
              label={signingOut ? 'Signing out…' : 'Sign out'}
              variant="outline"
              onPress={() => void handleSignOut()}
              disabled={busy}
            />
          </View>

          {busy ? <ActivityIndicator className="mt-4" /> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(251, 240, 224, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
