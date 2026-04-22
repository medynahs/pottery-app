import { useAppStore } from '@/src/store/appStore';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const reopenGeneralOnboarding = useAppStore((s) => s.reopenGeneralOnboarding);

  // DEV ONLY: reset onboarding so steps are always visible during development
  useEffect(() => {
    reopenGeneralOnboarding();
  }, []);

  return <Redirect href="/(tabs)/overview" />;
}
