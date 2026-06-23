import PremiumUpgradeScreen from '@/src/screens/premium/PremiumUpgradeScreen';
import { parsePremiumFeatureParam } from '@/src/utils/premiumGate';
import { useLocalSearchParams } from 'expo-router';

export default function PremiumRoute() {
  const { feature: featureParam } = useLocalSearchParams<{ feature?: string | string[] }>();
  const triggerFeature = parsePremiumFeatureParam(featureParam);

  return <PremiumUpgradeScreen triggerFeature={triggerFeature} />;
}
