import GeneralOnboardingScreen from '@/src/screens/onboarding/GeneralOnboardingScreen';
import { useAppStore } from '@/src/store/appStore';
import { Redirect } from 'expo-router';

export default function OnboardingRoute() {
  const completed = useAppStore((s) => s.generalOnboardingCompleted);

  if (completed) {
    return <Redirect href="/(tabs)/overview" />;
  }

  return <GeneralOnboardingScreen />;
}
