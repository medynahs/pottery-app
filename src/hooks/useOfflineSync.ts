import { useEffect, useRef } from 'react';
import { flushGlazesSync, hasPendingGlazesSync } from '../screens/library/useGlazesSync';
import { flushPiecesSync, hasPendingPiecesSync } from '../screens/pieces/hooks/usePiecesSync';
import { useAppStore } from '../store/appStore';
import { useNetworkConnection } from './useNetworkConnection';

export function useOfflineSync() {
  const { isConnected, isInternetReachable } = useNetworkConnection();
  const isOnline = isConnected && isInternetReachable;

  const pendingSyncOps = useAppStore((s) => s.pendingSyncOps);
  const clearSyncQueue = useAppStore((s) => s.clearSyncQueue);
  const setLastSyncedAt = useAppStore((s) => s.setLastSyncedAt);

  const prevOnline = useRef(isOnline);

  const flushQueue = async () => {
    const hasPieces = hasPendingPiecesSync();
    const hasGlazes = hasPendingGlazesSync();
    const hasLegacyOps = pendingSyncOps.length > 0;
    if (!hasPieces && !hasGlazes && !hasLegacyOps) return;

    if (hasPieces) {
      await flushPiecesSync();
    }
    if (hasGlazes) {
      await flushGlazesSync();
    }
    if (hasLegacyOps && !hasPendingPiecesSync()) {
      clearSyncQueue();
      setLastSyncedAt(new Date().toISOString());
    }
  };

  useEffect(() => {
    const cameOnline = !prevOnline.current && isOnline;
    prevOnline.current = isOnline;

    if (cameOnline && (hasPendingPiecesSync() || hasPendingGlazesSync() || pendingSyncOps.length > 0)) {
      void flushQueue();
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && pendingSyncOps.length > 0) {
      void flushQueue();
    }
  }, [pendingSyncOps.length]);
}
