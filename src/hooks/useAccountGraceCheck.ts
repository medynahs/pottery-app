import { useEffect } from 'react';
import { detectAccountDeletionGrace } from '../services/accountGrace';
import { useAppStore } from '../store/appStore';

/**
 * Proactively detects soft-delete grace whenever a session token appears
 * (login, cold-start restore). Complements useCurrentUser's reactive handling.
 */
export function useAccountGraceCheck() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const setAccountDeletionGrace = useAppStore((s) => s.setAccountDeletionGrace);

  useEffect(() => {
    if (!isSignedIn) {
      setAccountDeletionGrace(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      const inGrace = await detectAccountDeletionGrace();
      if (!cancelled) {
        setAccountDeletionGrace(inGrace);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setAccountDeletionGrace]);
}
