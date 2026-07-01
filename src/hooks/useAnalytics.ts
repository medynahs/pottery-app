import { AnalyticsEvents } from '@/src/constants/analytics';
import { useAppStore } from '@/src/store';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

type AnalyticsClient = {
  capture: (event: string, props?: AnalyticsProperties) => void;
  screen: (name: string, props?: AnalyticsProperties) => void;
  identify: (distinctId: string, props?: AnalyticsProperties) => void;
  reset: () => void;
  register: (props: AnalyticsProperties) => void;
  optIn: () => void;
  optOut: () => void;
};

let posthogClient: AnalyticsClient | null = null;

/** Register PostHog once the SDK provider mounts. */
export function registerPostHogClient(client: AnalyticsClient | null) {
  posthogClient = client;
}

export function isProductAnalyticsEnabled(): boolean {
  if (process.env.EXPO_PUBLIC_ENABLE_ANALYTICS !== 'true') return false;
  return useAppStore.getState().privacyPrefs.analyticsEnabled;
}

/** Sync PostHog opt-in state with the in-app privacy toggle. */
export function syncAnalyticsConsent(enabled: boolean) {
  if (!posthogClient) return;
  if (enabled) {
    posthogClient.optIn();
  } else {
    posthogClient.optOut();
  }
}

/** Fire-and-forget event capture, gated on privacy prefs + env flag. */
export function captureAnalyticsEvent(event: string, properties?: AnalyticsProperties) {
  if (!isProductAnalyticsEnabled()) return;

  if (__DEV__) {
    console.debug('[analytics]', event, properties ?? {});
  }

  posthogClient?.capture(event, properties);
}

export function useAnalytics() {
  return {
    capture: captureAnalyticsEvent,
    trackSignIn: (method: 'email' | 'google') => {
      captureAnalyticsEvent(AnalyticsEvents.SIGN_IN, { method });
    },
    trackSignUp: (method: 'email' | 'google') => {
      captureAnalyticsEvent(AnalyticsEvents.SIGN_UP, { method });
    },
    trackPaywallViewed: (props: { feature?: string | null; user_type: string }) => {
      captureAnalyticsEvent(AnalyticsEvents.PAYWALL_VIEWED, props);
    },
    trackPremiumPurchaseStarted: (props: { plan: 'annual' | 'monthly' }) => {
      captureAnalyticsEvent(AnalyticsEvents.PREMIUM_PURCHASE_STARTED, props);
    },
    trackPremiumPurchaseCompleted: (props?: { plan?: string | null }) => {
      captureAnalyticsEvent(AnalyticsEvents.PREMIUM_PURCHASE_COMPLETED, props);
    },
    trackPremiumPurchaseFailed: (props?: { cancelled?: boolean }) => {
      captureAnalyticsEvent(AnalyticsEvents.PREMIUM_PURCHASE_FAILED, props);
    },
    trackPremiumRestoreCompleted: () => {
      captureAnalyticsEvent(AnalyticsEvents.PREMIUM_RESTORE_COMPLETED);
    },
    trackAnalyticsPreviewViewed: (props: { user_type: string }) => {
      captureAnalyticsEvent(AnalyticsEvents.ANALYTICS_PREVIEW_VIEWED, props);
    },
    trackPrivacyAnalyticsToggled: (enabled: boolean) => {
      captureAnalyticsEvent(AnalyticsEvents.PRIVACY_ANALYTICS_TOGGLED, { enabled });
    },
    trackGlazeCreated: (props?: { source?: string; hasRecipe?: boolean }) => {
      captureAnalyticsEvent(AnalyticsEvents.GLAZE_CREATED, props);
    },
    trackTestTileLogged: (props?: { glazeId?: string; resultRating?: string }) => {
      captureAnalyticsEvent(AnalyticsEvents.TEST_TILE_LOGGED, props);
    },
    trackGlazeSavedFromCommunity: (props?: {
      postId?: string;
      glazeName?: string;
      sourceStudio?: string;
    }) => {
      captureAnalyticsEvent(AnalyticsEvents.GLAZE_SAVED_FROM_COMMUNITY, props);
    },
    trackCommunityPostCreated: (props?: { hasRecipe?: boolean; hasPhoto?: boolean }) => {
      captureAnalyticsEvent(AnalyticsEvents.COMMUNITY_POST_CREATED, props);
    },
  };
}
