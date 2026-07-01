import { useAppStore } from '@/src/store';
import { triggerPremiumPhotoBackfill } from '@/src/utils/productAnalytics';
import { useEffect, useRef } from 'react';

/** Fires premium photo backfill when entitlement flips to premium. */
export function usePremiumAnalyticsEffects() {
  const isPremium = useAppStore((s) => s.isPremium);
  const prevPremiumRef = useRef(isPremium);

  useEffect(() => {
    if (!prevPremiumRef.current && isPremium) {
      triggerPremiumPhotoBackfill();
    }
    prevPremiumRef.current = isPremium;
  }, [isPremium]);
}
