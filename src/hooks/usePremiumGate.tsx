import { PremiumPaywallSheet } from '@/src/components/PremiumPaywallSheet';
import {
  checkPremium,
  PREMIUM_FEATURE_DESCRIPTIONS,
  PremiumFeature,
} from '@/src/utils/premiumGate';
import React, { useCallback, useState } from 'react';

type ActiveGate = {
  feature: PremiumFeature;
  description: string;
};

/**
 * Hook for gating premium features. Call `requestAccess` before the action;
 * render `PaywallGate` once near the root of your screen/component tree.
 */
export function usePremiumGate() {
  const [activeGate, setActiveGate] = useState<ActiveGate | null>(null);

  const requestAccess = useCallback(
    (feature: PremiumFeature, description?: string): boolean => {
      if (checkPremium(feature)) return true;
      setActiveGate({
        feature,
        description: description ?? PREMIUM_FEATURE_DESCRIPTIONS[feature],
      });
      return false;
    },
    [],
  );

  const PaywallGate = React.useMemo(
    () =>
      activeGate ? (
        <PremiumPaywallSheet
          featureName={activeGate.feature}
          featureDescription={activeGate.description}
          visible
          onClose={() => setActiveGate(null)}
        />
      ) : null,
    [activeGate],
  );

  return { requestAccess, PaywallGate, activeGate };
}
