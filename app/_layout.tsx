import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { AnimatedSplashScreen } from '@/src/components/AnimatedSplashScreen';
import { ErrorBoundary } from '@/src/components/error-boundary';
import { PhotoPickerProvider } from '@/src/components/PhotoPickerProvider';
import { ThemeProvider as UIThemeProvider } from '@/src/components/ui';
import { OfflineBanner } from '@/src/components/ui/OfflineBanner';
import { ToastOverlay } from '@/src/components/ui/toast-overlay';
import { configureRevenueCat } from '@/src/hooks/useEntitlements';
import { useNotificationTriggers } from '@/src/hooks/useNotificationTriggers';
import { useOfflineSync } from '@/src/hooks/useOfflineSync';
import { useGlazesSync } from '@/src/screens/library/useGlazesSync';
import { usePiecesSync } from '@/src/screens/pieces/hooks/usePiecesSync';
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

// Required on iOS: tells ASWebAuthenticationSession that the OAuth redirect was
// received, so the session is cleanly closed. Without this call, a second
// openAuthSessionAsync after sign-out throws "no resumable session found".
WebBrowser.maybeCompleteAuthSession();

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

/**
 * Restores the session token from SecureStore after Zustand AsyncStorage
 * hydration completes. Runs once per cold start, resolves in < 100ms.
 */
function useAuthInitialization(hydrated: boolean) {
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    if (!hydrated) return;
    void useAppStore.getState().initializeAuth().finally(() => setAuthReady(true));
  }, [hydrated]);
  return authReady;
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
  usePiecesSync();
  useGlazesSync();
  useNotificationTriggers();
  const backendUsersStatus = useAppStore((state) => state.backendUsersStatus);
  const loadBackendUsers = useAppStore((state) => state.loadBackendUsers);

  // Initialise RevenueCat SDK early so offerings are prefetched
  useEffect(() => {
    configureRevenueCat();
  }, []);

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
        <Stack.Screen name="premium" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="manage-subscription" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="stage-customization" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="clay-bodies" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="forming-methods" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="piece-forms" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="bisque-cone" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="glaze-cone" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="glaze-library" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="glaze/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="glaze-collection/[slug]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="discover-recipe" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="discover-inspiration" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="library-glazes" options={{ headerShown: false }} />
        <Stack.Screen name="pricing-rules" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="pricing-onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="app-customization" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="account-settings" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="privacy-settings" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="profile/studio-rhythm" options={{ headerShown: false }} />
        <Stack.Screen name="profile/badges" options={{ headerShown: false }} />
        <Stack.Screen name="overview-alerts" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="kilnkin" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="analytics" options={{ headerShown: false }} />
        <Stack.Screen name="kiln-history" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="register" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="change-password" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="friends" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="studios" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'card' }} />
      </Stack>
      <OfflineBanner />
      <ToastOverlay />
      <StatusBar style="auto" />
    </>
  );
}

const queryClient = new QueryClient();

export default function RootLayout() {
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const [loaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const hydrated = useStoreHydration();
  const authReady = useAuthInitialization(hydrated);
  const isAppReady = loaded && hydrated && authReady;
  const handleAnimatedSplashFinish = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (!isAppReady) return;

    void SplashScreen.hideAsync()
      .catch(() => {
        // Ignore cases where the splash screen has already been dismissed.
      })
      .finally(() => setNativeSplashHidden(true));
  }, [isAppReady]);

  if (!isAppReady) {
    return <View style={{ flex: 1, backgroundColor: '#C4A052' }} />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#C4A052' }} onLayout={onLayoutRootView}>
        <QueryClientProvider client={queryClient}>
          <UIThemeProvider>
            <ThemeProvider value={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#C4A052' } }}>
              <StageConfigProvider>
                <PhotoPickerProvider>
                  <View style={{ flex: 1, backgroundColor: '#FBF0E0' }}>
                    <AppShell />
                    {nativeSplashHidden && showAnimatedSplash ? (
                      <AnimatedSplashScreen onFinish={handleAnimatedSplashFinish} />
                    ) : null}
                  </View>
                </PhotoPickerProvider>
              </StageConfigProvider>
            </ThemeProvider>
          </UIThemeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
