import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { useNetworkConnection } from './useNetworkConnection';

/**
 * Watches network state and flushes the offline sync queue whenever
 * the device comes back online.
 *
 * Mount this once at the root of the app (in _layout.tsx).
 *
 * When a real backend is available, replace the `flushQueue` body with
 * actual API calls, processing `ops` one-by-one or in batch.
 */
export function useOfflineSync() {
  const { isConnected, isInternetReachable } = useNetworkConnection();
  const isOnline = isConnected && isInternetReachable;

  const pendingSyncOps = useAppStore((s) => s.pendingSyncOps);
  const clearSyncQueue = useAppStore((s) => s.clearSyncQueue);
  const setIsSyncing = useAppStore((s) => s.setIsSyncing);
  const setLastSyncedAt = useAppStore((s) => s.setLastSyncedAt);

  const prevOnline = useRef(isOnline);

  const flushQueue = async (ops: typeof pendingSyncOps) => {
    if (ops.length === 0) return;
    setIsSyncing(true);
    try {
      // ── TODO: replace with real API calls ─────────────────────
      // for (const op of ops) { await api.sync(op); }
      // ──────────────────────────────────────────────────────────
      // Simulate network round-trip while no backend exists yet
      await new Promise<void>((resolve) => setTimeout(resolve, 1200));
      clearSyncQueue();
      setLastSyncedAt(new Date().toISOString());
    } catch {
      // Leave the queue intact so it can be retried next time
    } finally {
      setIsSyncing(false);
    }
  };

  // Flush when connectivity is restored
  useEffect(() => {
    const cameOnline = !prevOnline.current && isOnline;
    prevOnline.current = isOnline;

    if (cameOnline && pendingSyncOps.length > 0) {
      flushQueue(pendingSyncOps);
    }
  }, [isOnline]);

  // Also flush on mount if we're already online with a non-empty queue
  // (covers the case where the app was closed offline and reopened online)
  const hasFlushedOnMount = useRef(false);
  useEffect(() => {
    if (!hasFlushedOnMount.current && isOnline && pendingSyncOps.length > 0) {
      hasFlushedOnMount.current = true;
      flushQueue(pendingSyncOps);
    }
  }, []);
}
