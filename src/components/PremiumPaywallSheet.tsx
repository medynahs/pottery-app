import { premiumRouteForFeature, type PremiumFeature } from '@/src/utils/premiumGate';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export interface PremiumPaywallSheetProps {
  featureName: PremiumFeature;
  featureDescription: string;
  visible: boolean;
  onClose: () => void;
}

export function PremiumPaywallSheet({ visible, onClose, featureName }: PremiumPaywallSheetProps) {
  const router = useRouter();

  useEffect(() => {
    if (!visible) return;
    router.push(premiumRouteForFeature(featureName) as never);
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, featureName]);

  return null;
}

