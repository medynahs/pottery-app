import { useAppStore } from '@/src/store/appStore';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const completed = useAppStore((s) => s.generalOnboardingCompleted);
  const reopenGeneralOnboarding = useAppStore((s) => s.reopenGeneralOnboarding);

  useEffect(() => {
    if (__DEV__) reopenGeneralOnboarding();
  }, [reopenGeneralOnboarding]);

  if (!completed) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/overview" />;
}
