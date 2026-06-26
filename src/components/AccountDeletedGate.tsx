import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import { ME_QUERY_KEY } from '@/src/hooks/useCurrentUser';
import { GLAZES_QUERY_KEY } from '@/src/screens/library/useGlazesSync';
import { FIRINGS_QUERY_KEY } from '@/src/screens/kiln/hooks/useFiringsSync';
import { KILNS_QUERY_KEY } from '@/src/screens/kiln/hooks/useKilnsSync';
import { PIECES_QUERY_KEY } from '@/src/screens/pieces/hooks/usePiecesSync';
import { reviveAccount } from '@/src/services/api';
import { oryLogout } from '@/src/services/auth';
import { useAppStore } from '@/src/store/appStore';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

async function invalidateStudioQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: PIECES_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: GLAZES_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: KILNS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: FIRINGS_QUERY_KEY }),
  ]);
}

export function AccountDeletedGate() {
  const sessionToken = useAppStore((s) => s.sessionToken);
  const accountDeletionGrace = useAppStore((s) => s.accountDeletionGrace);
  const clearSession = useAppStore((s) => s.clearSession);
  const setAccountDeletionGrace = useAppStore((s) => s.setAccountDeletionGrace);
  const showToast = useAppStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<'revive' | 'signout' | null>(null);

  const visible = accountDeletionGrace && !!sessionToken;

  const handleRevive = async () => {
    if (!sessionToken) return;
    setBusy('revive');
    try {
      await reviveAccount(sessionToken);
      setAccountDeletionGrace(false);
      await invalidateStudioQueries(queryClient);
      showToast('Welcome back — your studio has been restored.', 'success');
    } catch (error) {
      if (__DEV__) {
        console.error('[AccountDeletedGate] revive failed', error);
      }
      showToast('Could not restore your account. Try again or contact support.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleSignOut = async () => {
    if (!sessionToken) return;
    setBusy('signout');
    try {
      await oryLogout(sessionToken);
    } catch {
      // Local cleanup is enough if the Ory session is already gone.
    }
    clearSession();
    queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
    setBusy(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View className="mx-6 max-w-md rounded-3xl border border-border bg-card px-6 py-7">
          <Text className="text-2xl font-serif font-bold text-foreground text-center">
            Account scheduled for deletion
          </Text>
          <Text className="text-sm text-muted-foreground leading-relaxed mt-3 text-center">
            Your studio is paused during a one-week grace period — profile, pieces, and photos
            are hidden until you restore or deletion finishes.
          </Text>

          <View className="mt-6 gap-3">
            <PrimaryButton
              label={busy === 'revive' ? 'Restoring…' : 'Restore my account'}
              onPress={() => void handleRevive()}
              disabled={busy !== null}
            />
            <PrimaryButton
              label={busy === 'signout' ? 'Signing out…' : 'Sign out'}
              variant="outline"
              onPress={() => void handleSignOut()}
              disabled={busy !== null}
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
