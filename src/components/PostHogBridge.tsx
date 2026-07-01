/**
 * Registers the PostHog client with useAnalytics, tracks screens, and syncs
 * identity + privacy consent with the app store.
 */
import { AnalyticsEvents, getPostHogApiKey, getPostHogHost } from '@/src/constants/analytics';
import {
  captureAnalyticsEvent,
  registerPostHogClient,
  syncAnalyticsConsent,
} from '@/src/hooks/useAnalytics';
import { useAppStore } from '@/src/store';
import { buildAnalyticsPersonProperties } from '@/src/utils/productAnalytics';
import { usePathname } from 'expo-router';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

type PostHogProps = Record<string, string | number | boolean | null>;

function toPostHogProperties(
  properties?: Record<string, string | number | boolean | null | undefined>,
): PostHogProps | undefined {
  if (!properties) return undefined;
  const cleaned: PostHogProps = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) cleaned[key] = value;
  }
  return cleaned;
}

export function PostHogAppProvider({ children }: { children: React.ReactNode }) {
  const apiKey = getPostHogApiKey();
  const host = getPostHogHost();
  if (__DEV__ && apiKey) {
    console.log(
      `[PostHog] configured → dashboard: https://eu.posthog.com · ingest: ${host} · key: ${apiKey.slice(0, 8)}…`,
    );
  }
  if (!apiKey) return <>{children}</>;

  return (
    <PostHogProvider
      apiKey={apiKey}
      options={{
        host,
        captureAppLifecycleEvents: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
      }}
      autocapture={{
        captureScreens: false,
        captureTouches: false,
      }}
      debug={__DEV__}
    >
      <PostHogBridge />
      {children}
    </PostHogProvider>
  );
}

export function PostHogBridge() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const lastScreenRef = useRef<string | null>(null);

  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const backendUserId = useAppStore((s) => s.backendUserId);
  const userType = useAppStore((s) => s.onboardingProfile.userType);
  const isPremium = useAppStore((s) => s.isPremium);
  const analyticsEnabled = useAppStore((s) => s.privacyPrefs.analyticsEnabled);
  const pieceCount = useAppStore((s) => s.pieces.filter((p) => !p.deleted).length);
  const glazeCount = useAppStore((s) => s.glazes.length);
  const firingCount = useAppStore((s) => s.firings.filter((f) => f.state === 'completed').length);

  useEffect(() => {
    if (!posthog) {
      registerPostHogClient(null);
      return;
    }

    registerPostHogClient({
      capture: (event, properties) => {
        posthog.capture(event, toPostHogProperties(properties));
      },
      screen: (name, properties) => {
        posthog.screen(name, toPostHogProperties(properties));
      },
      identify: (distinctId, properties) => {
        posthog.identify(distinctId, toPostHogProperties(properties));
      },
      reset: () => {
        posthog.reset();
      },
      register: (properties) => {
        void posthog.register(toPostHogProperties(properties) ?? {});
      },
      optIn: () => {
        void posthog.optIn();
      },
      optOut: () => {
        void posthog.optOut();
      },
    });

    void posthog.register({
      app_env: process.env.EXPO_PUBLIC_APP_ENV ?? 'unknown',
      platform: Platform.OS,
    });

    return () => {
      registerPostHogClient(null);
    };
  }, [posthog]);

  useEffect(() => {
    syncAnalyticsConsent(analyticsEnabled);
  }, [analyticsEnabled, posthog]);

  useEffect(() => {
    if (!posthog) return;
    if (!isSignedIn || !backendUserId) {
      posthog.reset();
      syncAnalyticsConsent(analyticsEnabled);
      return;
    }

    if (!analyticsEnabled) return;

    posthog.identify(backendUserId, buildAnalyticsPersonProperties());
  }, [posthog, isSignedIn, backendUserId, userType, isPremium, analyticsEnabled, pieceCount, glazeCount, firingCount]);

  useEffect(() => {
    if (!pathname || pathname === lastScreenRef.current) return;
    lastScreenRef.current = pathname;
    captureAnalyticsEvent(AnalyticsEvents.SCREEN_VIEW, { screen: pathname });
  }, [pathname]);

  return null;
}
