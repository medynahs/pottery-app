import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { ErrorBoundary } from '@/src/components/error-boundary';
import { ThemeProvider as UIThemeProvider } from '@/src/components/ui';
import { OfflineBanner } from '@/src/components/ui/OfflineBanner';
import { useOfflineSync } from '@/src/hooks/useOfflineSync';
import { StageConfigProvider } from '@/src/hooks/useStageConfig';
import { useAppStore } from '@/src/store/appStore';
import {
    DMSans_400Regular,
    DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import {
    Fraunces_600SemiBold,
    Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';

// Prevent the splash screen from auto-hiding
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore cases where no native splash screen is currently registered.
});

/** Waits for the Zustand persist store to finish hydrating from AsyncStorage. */
function useStoreHydration() {
  const [hydrated, setHydrated] = useState(
    () => useAppStore.persist.hasHydrated()
  );
  useEffect(() => {
    if (hydrated) return;
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    // Guard: may have hydrated between the useState init and this effect
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}

/** Inner component so hooks run inside providers. */
function AppOnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const generalOnboardingCompleted = useAppStore((state) => state.generalOnboardingCompleted);

  useEffect(() => {
    if (!generalOnboardingCompleted && pathname !== '/onboarding') {
      router.replace('/onboarding');
      return;
    }

    if (generalOnboardingCompleted && pathname === '/onboarding') {
      router.replace('/overview' as never);
    }
  }, [pathname, generalOnboardingCompleted, router]);

  return null;
}

function AppShell() {
  useOfflineSync();
  const backendUsersStatus = useAppStore((state) => state.backendUsersStatus);
  const loadBackendUsers = useAppStore((state) => state.loadBackendUsers);

  useEffect(() => {
    if (backendUsersStatus !== 'idle') {
      return;
    }

    void loadBackendUsers();
  }, [backendUsersStatus, loadBackendUsers]);

  return (
    <>
      <AppOnboardingGuard />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="stage-customization" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="clay-bodies" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="forming-methods" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="piece-forms" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="bisque-cone" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="glaze-cone" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="glaze-library" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="library-roadmaps" options={{ headerShown: false }} />
        <Stack.Screen name="library-glazes" options={{ headerShown: false }} />
        <Stack.Screen name="library-tools" options={{ headerShown: false }} />
        <Stack.Screen name="library-templates" options={{ headerShown: false }} />
        <Stack.Screen name="pricing-rules" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="pricing-onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="app-customization" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="account-settings" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="profile/studio-rhythm" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="overview-missions" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="overview-alerts" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="overview-analytics" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="kilnkin" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
      <OfflineBanner />
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const hydrated = useStoreHydration();
  const isAppReady = loaded && hydrated;

  const onLayoutRootView = useCallback(() => {
    if (!isAppReady) return;

    void SplashScreen.hideAsync().catch(() => {
      // Ignore cases where the splash screen has already been dismissed.
    });
  }, [isAppReady]);

  if (!isAppReady) {
    return <View style={{ flex: 1, backgroundColor: '#D7682D' }} />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#D7682D' }} onLayout={onLayoutRootView}>
        <UIThemeProvider>
          <ThemeProvider value={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#D7682D' } }}>
            <StageConfigProvider>
              <AppShell />
            </StageConfigProvider>
          </ThemeProvider>
        </UIThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
