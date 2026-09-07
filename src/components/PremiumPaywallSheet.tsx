import { premiumRouteForFeature, type PremiumFeature } from '@/src/utils/premiumGate';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

export interface PremiumPaywallSheetProps {
  featureName: PremiumFeature;
  featureDescription: string;
  visible: boolean;
  onClose: () => void;
}

export function PremiumPaywallSheet({ visible, onClose, featureName }: PremiumPaywallSheetProps) {
  const router = useRouter();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;
    router.push(premiumRouteForFeature(featureName) as never);
    onCloseRef.current();
  }, [visible, featureName, router]);

  return null;
}

