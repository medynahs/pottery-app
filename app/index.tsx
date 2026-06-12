import { useAppStore } from '@/src/store/appStore';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const reopenGeneralOnboarding = useAppStore((s) => s.reopenGeneralOnboarding);

  useEffect(() => {
    if (__DEV__) reopenGeneralOnboarding();
  }, []);

  return <Redirect href="/(tabs)/overview" />;
}
