import { useEffect, useRef } from 'react';
import { flushFiringsSync, hasPendingFiringsSync } from '../screens/kiln/hooks/useFiringsSync';
import { flushKilnsSync, hasPendingKilnsSync } from '../screens/kiln/hooks/useKilnsSync';
import { flushGlazesSync, hasPendingGlazesSync } from '../screens/library/useGlazesSync';
import { flushPiecesSync, hasPendingPiecesSync } from '../screens/pieces/hooks/usePiecesSync';
import { useNetworkConnection } from './useNetworkConnection';

/** Flushes every synced domain's pending records when the device comes back online. */
export function useOfflineSync() {
  const { isConnected, isInternetReachable } = useNetworkConnection();
  const isOnline = isConnected && isInternetReachable;

  const prevOnline = useRef(isOnline);

  useEffect(() => {
    const cameOnline = !prevOnline.current && isOnline;
    prevOnline.current = isOnline;
    if (!cameOnline) return;

    if (hasPendingPiecesSync()) void flushPiecesSync();
    if (hasPendingGlazesSync()) void flushGlazesSync();
    if (hasPendingFiringsSync()) void flushFiringsSync();
    if (hasPendingKilnsSync()) void flushKilnsSync();
  }, [isOnline]);
}
