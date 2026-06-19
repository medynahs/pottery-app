import { useAppStore } from '@/src/store';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

let posthogClient: { capture: (event: string, props?: AnalyticsProperties) => void } | null = null;

/** Register PostHog once SDK is installed (ticket #47). */
export function registerPostHogClient(
  client: { capture: (event: string, props?: AnalyticsProperties) => void } | null,
) {
  posthogClient = client;
}

function analyticsEnabled(): boolean {
  if (process.env.EXPO_PUBLIC_ENABLE_ANALYTICS !== 'true') return false;
  return useAppStore.getState().privacyPrefs.analyticsEnabled;
}

/** Fire-and-forget event capture — gated on privacy prefs + env flag. */
export function captureAnalyticsEvent(event: string, properties?: AnalyticsProperties) {
  if (!analyticsEnabled()) return;

  if (__DEV__) {
    console.debug('[analytics]', event, properties ?? {});
  }

  posthogClient?.capture(event, properties);
}

export function useAnalytics() {
  return {
    capture: captureAnalyticsEvent,
    trackGlazeCreated: (props?: { source?: string; hasRecipe?: boolean }) => {
      captureAnalyticsEvent('glaze_created', props);
    },
    trackTestTileLogged: (props?: { glazeId?: string; resultRating?: string }) => {
      captureAnalyticsEvent('test_tile_logged', props);
    },
    trackGlazeSavedFromCommunity: (props?: {
      postId?: string;
      glazeName?: string;
      sourceStudio?: string;
    }) => {
      captureAnalyticsEvent('glaze_saved_from_community', props);
    },
    trackCommunityPostCreated: (props?: { hasRecipe?: boolean; hasPhoto?: boolean }) => {
      captureAnalyticsEvent('community_post_created', props);
    },
  };
}
