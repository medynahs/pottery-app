import { hydrateAllPieceAssetsFromCloud } from '@/src/utils/pieceAssetSync';
import { useAppStore } from '@/src/store';
import { useEffect, useRef } from 'react';

/** Hydrate piece photos on demand when the Pieces tab is opened — not at app startup. */
export function useLazyPieceAssetsHydration() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || startedRef.current) return;
    startedRef.current = true;
    void hydrateAllPieceAssetsFromCloud();
  }, [isSignedIn]);
}
