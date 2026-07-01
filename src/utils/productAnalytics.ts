/**
 * Product analytics helpers — milestones, person properties, monetization signals.
 * No PII: never pass emails, names, post text, or media URLs.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsEvents } from '@/src/constants/analytics';
import { captureAnalyticsEvent } from '@/src/hooks/useAnalytics';
import {
  isStudioRhythmConfigured,
  normalizeStudioRhythm,
} from '@/src/screens/overview/studioRythm/studioRhythm';
import { useAppStore } from '@/src/store';
import { getCloudStorageSnapshot } from './cloudStorage';
import { pieceHasPendingLocalPhotos, scheduleAllPendingPiecePhotoSync } from './pieceAssetSync';

const MILESTONE_STORAGE_KEY = 'product-analytics-milestones';

type MilestoneKey =
  | 'first_piece'
  | 'first_stage_advance'
  | 'first_firing'
  | 'first_glaze'
  | 'studio_rhythm_configured';

async function readMilestones(): Promise<Set<MilestoneKey>> {
  try {
    const raw = await AsyncStorage.getItem(MILESTONE_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as MilestoneKey[]);
  } catch {
    return new Set();
  }
}

async function markMilestone(key: MilestoneKey): Promise<boolean> {
  const existing = await readMilestones();
  if (existing.has(key)) return false;
  existing.add(key);
  await AsyncStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify([...existing]));
  return true;
}

export function countBucket(count: number): string {
  if (count <= 0) return '0';
  if (count <= 5) return '1-5';
  if (count <= 20) return '6-20';
  return '20+';
}

export function buildAnalyticsPersonProperties(): Record<string, string | number | boolean | null> {
  const state = useAppStore.getState();
  const pieces = state.pieces.filter((p) => !p.deleted);
  const firings = state.firings.filter((f) => f.state === 'completed');
  const snapshot = getCloudStorageSnapshot();
  const rhythm = normalizeStudioRhythm(state.studioRhythm);
  const usedMb = Math.round(snapshot.usedBytes / (1024 * 1024));

  return {
    user_type: state.onboardingProfile.userType,
    is_premium: state.isPremium,
    companion_element: state.kilnkinCompanion?.element ?? null,
    onboarding_completed: state.generalOnboardingCompleted,
    piece_count_bucket: countBucket(pieces.length),
    glaze_count_bucket: countBucket(state.glazes.length),
    firing_count_bucket: countBucket(firings.length),
    cloud_storage_mb_bucket: snapshot.isPremium ? 'unlimited' : countBucket(usedMb),
    studio_rhythm_configured: isStudioRhythmConfigured(rhythm),
    has_created_post: state.hasCreatedPost,
    challenge_entries_submitted: state.challengeEntriesSubmitted,
  };
}

export function trackOnboardingCompleted(props: {
  user_type: string;
  companion_element?: string | null;
}) {
  captureAnalyticsEvent(AnalyticsEvents.ONBOARDING_COMPLETED, props);
}

export function trackSetupQuestCompleted(questId: string) {
  captureAnalyticsEvent(AnalyticsEvents.SETUP_QUEST_COMPLETED, { quest_id: questId });
}

export function trackPiecesAdded(
  newPieces: Array<{ formingMethod?: string }>,
  previousActiveCount: number,
) {
  if (newPieces.length === 0) return;

  void markMilestone('first_piece').then((fresh) => {
    if (fresh || previousActiveCount === 0) {
      captureAnalyticsEvent(AnalyticsEvents.FIRST_PIECE_CREATED, {
        forming_method: newPieces[0]?.formingMethod ?? null,
        batch_size: newPieces.length,
      });
    }
  });
}

export function trackPieceStageAdvanced(props: {
  from_stage: string;
  to_stage: string;
  piece_count: number;
  has_photo?: boolean;
}) {
  captureAnalyticsEvent(AnalyticsEvents.PIECE_STAGE_ADVANCED, props);

  void markMilestone('first_stage_advance').then((fresh) => {
    if (fresh) {
      captureAnalyticsEvent(AnalyticsEvents.FIRST_STAGE_ADVANCED, {
        from_stage: props.from_stage,
        to_stage: props.to_stage,
        has_photo: props.has_photo ?? false,
      });
    }
  });
}

export function trackFiringCompleted(props: {
  firing_type: string;
  piece_count: number;
  result?: string | null;
}) {
  captureAnalyticsEvent(AnalyticsEvents.FIRING_COMPLETED, props);

  void markMilestone('first_firing').then((fresh) => {
    if (fresh) {
      captureAnalyticsEvent(AnalyticsEvents.FIRST_FIRING_LOGGED, {
        firing_type: props.firing_type,
        piece_count: props.piece_count,
      });
    }
  });
}

export function trackFirstGlazeAdded(props?: { has_recipe?: boolean; source?: string }) {
  void markMilestone('first_glaze').then((fresh) => {
    if (fresh) {
      captureAnalyticsEvent(AnalyticsEvents.FIRST_GLAZE_ADDED, props);
    }
  });
}

export function trackStudioRhythmConfiguredIfNeeded() {
  const rhythm = normalizeStudioRhythm(useAppStore.getState().studioRhythm);
  if (!isStudioRhythmConfigured(rhythm)) return;

  void markMilestone('studio_rhythm_configured').then((fresh) => {
    if (fresh) {
      captureAnalyticsEvent(AnalyticsEvents.STUDIO_RHYTHM_CONFIGURED, { mode: rhythm.type });
    }
  });
}

export function trackDailyMissionCompleted(props: { mission_type: string; date_key: string }) {
  captureAnalyticsEvent(AnalyticsEvents.DAILY_MISSION_COMPLETED, props);
}

export function trackAnalyticsOpened(props: { user_type: string; is_premium: boolean }) {
  captureAnalyticsEvent(AnalyticsEvents.ANALYTICS_OPENED, props);
}

export function trackChallengeJoined(props: {
  challenge_id: string;
  track_id?: string | null;
  is_mock?: boolean;
}) {
  captureAnalyticsEvent(AnalyticsEvents.CHALLENGE_JOINED, props);
}

export function trackChallengeEntrySubmitted(props: {
  challenge_id: string;
  has_photo: boolean;
  is_mock?: boolean;
}) {
  captureAnalyticsEvent(AnalyticsEvents.CHALLENGE_ENTRY_SUBMITTED, props);
}

export function trackChallengeVoteCast(props: {
  challenge_id: string;
  track_id: string;
  is_mock?: boolean;
}) {
  captureAnalyticsEvent(AnalyticsEvents.CHALLENGE_VOTE_CAST, props);
}

export function trackProfileShared(props: { source: 'profile' | 'public_profile' }) {
  captureAnalyticsEvent(AnalyticsEvents.PROFILE_SHARED, props);
}

export function trackPublicProfileViewed(props: { viewer_is_owner: boolean }) {
  captureAnalyticsEvent(AnalyticsEvents.PUBLIC_PROFILE_VIEWED, props);
}

export function trackCloudBackupLimitHit(props: {
  limit_type: 'per_piece' | 'storage_mb';
  screen?: string;
}) {
  captureAnalyticsEvent(AnalyticsEvents.CLOUD_BACKUP_LIMIT_HIT, props);
}

export function trackCloudPhotoSavedLocalOnly(props?: { is_replacing?: boolean }) {
  captureAnalyticsEvent(AnalyticsEvents.CLOUD_PHOTO_SAVED_LOCAL_ONLY, props);
}

export function trackExportAttempted(props: { source: 'analytics' | 'privacy_settings' }) {
  captureAnalyticsEvent(AnalyticsEvents.EXPORT_ATTEMPTED, props);
}

export function trackPaywallDismissed(props: { feature?: string | null; user_type: string }) {
  captureAnalyticsEvent(AnalyticsEvents.PAYWALL_DISMISSED, props);
}

export function triggerPremiumPhotoBackfill() {
  const pieces = useAppStore.getState().pieces.filter(
    (p) => !p.deleted && pieceHasPendingLocalPhotos(p),
  );
  captureAnalyticsEvent(AnalyticsEvents.PREMIUM_PHOTO_BACKFILL_STARTED, {
    pending_piece_count: pieces.length,
  });
  scheduleAllPendingPiecePhotoSync();
}
