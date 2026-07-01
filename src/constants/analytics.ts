/** PostHog project host — EU by default; override via EXPO_PUBLIC_POSTHOG_HOST. */
export const POSTHOG_DEFAULT_HOST = 'https://eu.i.posthog.com';

export function getPostHogApiKey(): string | undefined {
  const key = process.env.EXPO_PUBLIC_POSTHOG_API_KEY?.trim();
  return key || undefined;
}

export function getPostHogHost(): string {
  return process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || POSTHOG_DEFAULT_HOST;
}

export function isAnalyticsSdkConfigured(): boolean {
  return getPostHogApiKey() != null;
}

/** Product analytics event names — keep in sync with PostHog project taxonomy. */
export const AnalyticsEvents = {
  SCREEN_VIEW: 'screen_view',
  SIGN_IN: 'sign_in',
  SIGN_UP: 'sign_up',
  PAYWALL_VIEWED: 'paywall_viewed',
  PREMIUM_PURCHASE_STARTED: 'premium_purchase_started',
  PREMIUM_PURCHASE_COMPLETED: 'premium_purchase_completed',
  PREMIUM_PURCHASE_FAILED: 'premium_purchase_failed',
  PREMIUM_RESTORE_COMPLETED: 'premium_restore_completed',
  ANALYTICS_PREVIEW_VIEWED: 'analytics_preview_viewed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  SETUP_QUEST_COMPLETED: 'setup_quest_completed',
  FIRST_PIECE_CREATED: 'first_piece_created',
  FIRST_STAGE_ADVANCED: 'first_stage_advanced',
  PIECE_STAGE_ADVANCED: 'piece_stage_advanced',
  FIRST_FIRING_LOGGED: 'first_firing_logged',
  FIRING_COMPLETED: 'firing_completed',
  FIRST_GLAZE_ADDED: 'first_glaze_added',
  STUDIO_RHYTHM_CONFIGURED: 'studio_rhythm_configured',
  DAILY_MISSION_COMPLETED: 'daily_mission_completed',
  ANALYTICS_OPENED: 'analytics_opened',
  CHALLENGE_JOINED: 'challenge_joined',
  CHALLENGE_ENTRY_SUBMITTED: 'challenge_entry_submitted',
  CHALLENGE_VOTE_CAST: 'challenge_vote_cast',
  PROFILE_SHARED: 'profile_shared',
  PUBLIC_PROFILE_VIEWED: 'public_profile_viewed',
  CLOUD_BACKUP_LIMIT_HIT: 'cloud_backup_limit_hit',
  CLOUD_PHOTO_SAVED_LOCAL_ONLY: 'cloud_photo_saved_local_only',
  EXPORT_ATTEMPTED: 'export_attempted',
  PAYWALL_DISMISSED: 'paywall_dismissed',
  PREMIUM_PHOTO_BACKFILL_STARTED: 'premium_photo_backfill_started',
  GLAZE_CREATED: 'glaze_created',
  TEST_TILE_LOGGED: 'test_tile_logged',
  GLAZE_SAVED_FROM_COMMUNITY: 'glaze_saved_from_community',
  COMMUNITY_POST_CREATED: 'community_post_created',
  PRIVACY_ANALYTICS_TOGGLED: 'privacy_analytics_toggled',
} as const;
