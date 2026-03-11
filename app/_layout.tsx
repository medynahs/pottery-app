import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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
SplashScreen.preventAutoHideAsync();

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
function AppShell() {
  useOfflineSync();
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="stage-customization" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="clay-bodies" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="forming-methods" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="piece-forms" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="bisque-cone" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="glaze-cone" options={{ headerShown: false, presentation: 'modal' }} />
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

  useEffect(() => {
    if (loaded && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, hydrated]);

  if (!loaded || !hydrated) {
    return <View style={{ flex: 1, backgroundColor: '#D7682D' }} />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#D7682D' }}>
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
