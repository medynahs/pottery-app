/**
 * PremiumPaywallSheet — contextual upgrade prompt (T59)
 *
 * When `visible` flips to true, navigates to /premium and resets the gate
 * so it can be triggered again on the next attempt.
 */
import { PremiumFeature } from '@/src/utils/premiumGate';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export interface PremiumPaywallSheetProps {
  /** The feature that triggered this gate. */
  featureName: PremiumFeature;
  /** One-line description of why this feature needs premium. */
  featureDescription: string;
  visible: boolean;
  onClose: () => void;
}

export function PremiumPaywallSheet({ visible, onClose }: PremiumPaywallSheetProps) {
  const router = useRouter();

  useEffect(() => {
    if (!visible) return;
    router.push('/premium');
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return null;
}

