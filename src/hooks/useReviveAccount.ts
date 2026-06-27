import { ME_QUERY_KEY } from '@/src/hooks/useCurrentUser';
import { GLAZES_QUERY_KEY } from '@/src/screens/library/useGlazesSync';
import { FIRINGS_QUERY_KEY } from '@/src/screens/kiln/hooks/useFiringsSync';
import { KILNS_QUERY_KEY } from '@/src/screens/kiln/hooks/useKilnsSync';
import { PIECES_QUERY_KEY } from '@/src/screens/pieces/hooks/usePiecesSync';
import { reviveAccount } from '@/src/services/api';
import { useAppStore } from '@/src/store/appStore';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

async function invalidateStudioQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: PIECES_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: GLAZES_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: KILNS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: FIRINGS_QUERY_KEY }),
  ]);
}

export function useReviveAccount() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const clearAccountDeletionSchedule = useAppStore((s) => s.clearAccountDeletionSchedule);
  const showToast = useAppStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const revive = useCallback(async () => {
    if (!isSignedIn || busy) return false;
    setBusy(true);
    try {
      await reviveAccount();
      clearAccountDeletionSchedule();
      await invalidateStudioQueries(queryClient);
      showToast('Welcome back — your studio has been restored.', 'success');
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('[useReviveAccount] revive failed', error);
      }
      showToast('Could not restore your account. Try again or contact support.', 'error');
      return false;
    } finally {
      setBusy(false);
    }
  }, [busy, queryClient, isSignedIn, clearAccountDeletionSchedule, showToast]);

  return { revive, busy };
}
