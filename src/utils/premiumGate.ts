import type { Piece } from '../types/pieces';
import type { OnboardingUserType } from '../types/user';
import { useAppStore } from '../store/appStore';
import {
  canSyncPiecePhotoToCloud,
  countPieceCloudBackedPhotos,
  formatCloudStorageLabel,
  FREE_CLOUD_STORAGE_MB,
  getCloudStorageSnapshot,
} from './cloudStorage';
import { resolvePremiumFromEntitlement } from './forcePremium';

/**
 * Enum of all premium-gated features.
 * Pass as the first argument to `checkPremium()` when deciding whether
 * to allow access or show `PremiumPaywallSheet`.
 */
export enum PremiumFeature {
  Analytics        = 'analytics',
  UnlimitedPhotos  = 'unlimited-photos',
  CloudStorage     = 'cloud-storage',
  CompanionSwap    = 'companion-swap',
  FullPricing      = 'full-pricing',
  KilnAnalytics    = 'kiln-analytics',
  Export           = 'export',
  UnlimitedMissions = 'unlimited-missions',
  StudioRhythmAdvanced = 'studio-rhythm-advanced',
  YearlyWrap        = 'yearly-wrap',
  Backup            = 'backup',
}

export { FREE_CLOUD_STORAGE_MB } from './cloudStorage';

/** Free tier: one cloud-backed photo per piece (more can stay on-device). */
export const FREE_PHOTO_LIMIT = 1;

export type PremiumComparisonRow = {
  label: string;
  free: string;
  premium: string;
};

/** Free vs Premium rows for the upgrade screen comparison table. */
export const PREMIUM_COMPARISON_ROWS: PremiumComparisonRow[] = [
  { label: 'Pieces & kiln logs', free: 'Unlimited', premium: 'Unlimited' },
  { label: 'Glaze library', free: 'Unlimited on device', premium: 'Unlimited on device' },
  { label: 'Text sync across devices', free: 'Included', premium: 'Included' },
  { label: 'Cloud photo storage', free: `${FREE_CLOUD_STORAGE_MB} MB`, premium: 'Unlimited' },
  { label: 'Photos backed up per piece', free: '1', premium: 'Unlimited' },
  { label: 'Studio analytics', free: 'Preview only', premium: 'Full dashboards' },
  { label: 'Data export', free: '—', premium: 'Included' },
  { label: 'Studio Rhythm', free: 'Weekly', premium: 'Sprint & freeform' },
  { label: 'Companions', free: 'Your pick', premium: 'All 4 + swap anytime' },
];

export type PaywallFeatureStatus = 'included' | 'coming-soon';

export type PaywallFeatureItem = {
  key: string;
  label: string;
  status: PaywallFeatureStatus;
};

/** Shipped Premium benefits — shown on the upgrade screen. */
export const PAYWALL_INCLUDED_FEATURES: PaywallFeatureItem[] = [
  { key: 'cloud', label: 'Unlimited cloud photo backup', status: 'included' },
  { key: 'photos', label: 'Unlimited photos per piece in the cloud', status: 'included' },
  { key: 'glazes', label: 'Glaze test & recipe photos in the cloud', status: 'included' },
  { key: 'companions', label: 'All 4 elemental companions + free swap', status: 'included' },
  { key: 'analytics', label: 'Studio & kiln analytics', status: 'included' },
  { key: 'export', label: 'Data export', status: 'included' },
  { key: 'rhythm', label: 'Studio Rhythm sprint & freeform modes', status: 'included' },
];

export const PAYWALL_COMING_SOON_FEATURES: PaywallFeatureItem[] = [
  { key: 'wrap', label: 'Yearly pottery wrap', status: 'coming-soon' },
];

/** Explains the local vs cloud split on upgrade screens. */
export const PAYWALL_LOCAL_CLOUD_EXPLAINER =
  `Free: unlimited pieces, kiln logs, and glazes on your device. Journal and recipe text sync across devices. Cloud photo backup is limited (${FREE_CLOUD_STORAGE_MB} MB total, 1 cloud-backed photo per piece) — glaze test photos count toward the cap. Premium unlocks unlimited cloud backup for your full studio archive.`;

const PREMIUM_CONTEXTUAL_TITLES: Record<PremiumFeature, string> = {
  [PremiumFeature.Analytics]: 'Unlock studio analytics',
  [PremiumFeature.UnlimitedPhotos]: 'Back up every stage photo',
  [PremiumFeature.CloudStorage]: 'Unlock unlimited cloud backup',
  [PremiumFeature.CompanionSwap]: 'Switch companions anytime',
  [PremiumFeature.FullPricing]: 'Unlock pricing insights',
  [PremiumFeature.KilnAnalytics]: 'See kiln utilisation analytics',
  [PremiumFeature.Export]: 'Export your studio data',
  [PremiumFeature.UnlimitedMissions]: 'Unlock unlimited missions',
  [PremiumFeature.StudioRhythmAdvanced]: 'Unlock advanced Studio Rhythm',
  [PremiumFeature.YearlyWrap]: 'See your year in clay',
  [PremiumFeature.Backup]: 'Back up your full studio archive',
};

const PREMIUM_LIMIT_LINES: Partial<Record<PremiumFeature, string>> = {
  [PremiumFeature.UnlimitedPhotos]: `Free: ${FREE_PHOTO_LIMIT} cloud-backed photo per piece · Premium: unlimited`,
  [PremiumFeature.CloudStorage]: `Free: ${FREE_CLOUD_STORAGE_MB} MB cloud media · Premium: unlimited`,
  [PremiumFeature.Backup]: `Free: ${FREE_CLOUD_STORAGE_MB} MB cloud media · Premium: unlimited`,
  [PremiumFeature.Analytics]: 'Free: preview teaser · Premium: full cost, firing, and margin dashboards',
  [PremiumFeature.Export]: 'Free: view in app · Premium: export pieces, firings, and glazes',
  [PremiumFeature.CompanionSwap]: 'Free: your onboarding companion · Premium: all 4 elements + swap anytime',
  [PremiumFeature.StudioRhythmAdvanced]: 'Free: weekly rhythm · Premium: sprint mode & freeform scheduling',
  [PremiumFeature.KilnAnalytics]: 'Included with Premium analytics — kiln load, fees, and firing trends',
};

const STUDIO_OWNER_PAYWALL_FOOTNOTE =
  'Studio member queue & schedule stay free. Studio billing, statements, and member admin will live on the web owner portal.';

export function getStudioOwnerPaywallFootnote(userType: OnboardingUserType): string | null {
  return userType === 'studio-owner-technician' ? STUDIO_OWNER_PAYWALL_FOOTNOTE : null;
}

export function getPremiumContextualTitle(feature: PremiumFeature): string {
  return PREMIUM_CONTEXTUAL_TITLES[feature] ?? 'Unlock Premium';
}

export function getPremiumLimitLine(feature: PremiumFeature): string | null {
  return PREMIUM_LIMIT_LINES[feature] ?? null;
}

export function parsePremiumFeatureParam(
  raw: string | string[] | undefined,
): PremiumFeature | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  if (value === 'full-glaze-atlas' || value === 'community-photos') {
    return PremiumFeature.CloudStorage;
  }
  return Object.values(PremiumFeature).includes(value as PremiumFeature)
    ? (value as PremiumFeature)
    : null;
}

export function premiumRouteForFeature(feature: PremiumFeature): string {
  return `/premium?feature=${feature}`;
}

const FEATURE_TO_PAYWALL_KEY: Partial<Record<PremiumFeature, string>> = {
  [PremiumFeature.UnlimitedPhotos]: 'photos',
  [PremiumFeature.CloudStorage]: 'cloud',
  [PremiumFeature.CompanionSwap]: 'companions',
  [PremiumFeature.Analytics]: 'analytics',
  [PremiumFeature.KilnAnalytics]: 'analytics',
  [PremiumFeature.Export]: 'export',
  [PremiumFeature.StudioRhythmAdvanced]: 'rhythm',
  [PremiumFeature.YearlyWrap]: 'wrap',
  [PremiumFeature.Backup]: 'cloud',
};

/** Paywall list item that best matches a gated feature trigger. */
export function paywallItemForFeature(feature: PremiumFeature): PaywallFeatureItem | null {
  const key = FEATURE_TO_PAYWALL_KEY[feature];
  if (!key) return null;
  return (
    [...PAYWALL_INCLUDED_FEATURES, ...PAYWALL_COMING_SOON_FEATURES].find((item) => item.key === key) ??
    null
  );
}

export type PiecePhotoLimitStatus = {
  count: number;
  limit: number;
  atLimit: boolean;
  isPremium: boolean;
};

export function piecePhotoLimitStatus(piece: Piece): PiecePhotoLimitStatus {
  const count = countPieceCloudBackedPhotos(piece);
  const isPremium = checkPremium(PremiumFeature.UnlimitedPhotos);
  return {
    count,
    limit: FREE_PHOTO_LIMIT,
    atLimit: !isPremium && count >= FREE_PHOTO_LIMIT,
    isPremium,
  };
}

/** Short chip label for cloud backup limits on a piece. */
export function piecePhotoLimitLabel(piece: Piece): string | null {
  const status = piecePhotoLimitStatus(piece);
  if (status.isPremium) return null;
  if (status.atLimit) {
    return `Cloud backup full (${status.limit}/${status.limit})`;
  }
  return `Cloud backup: ${status.count}/${status.limit}`;
}

/** Account-wide cloud media meter for profile / paywall surfaces. */
export function cloudStorageLimitLabel(): string | null {
  const snapshot = getCloudStorageSnapshot();
  if (snapshot.isPremium) return null;
  return formatCloudStorageLabel(snapshot);
}

export function profilePremiumTeaser(userType: OnboardingUserType = 'not-sure'): string {
  switch (userType) {
    case 'studio-owner-technician':
      return 'Unlimited cloud backup, kiln analytics & export — from €4.99/mo';
    case 'business-owner':
      return 'Unlimited cloud backup, margin analytics & export — from €4.99/mo';
    case 'studio-potter':
      return 'Unlimited cloud backup, export & analytics — from €4.99/mo';
    default:
      return 'Unlimited cloud backup, photos & analytics — from €4.99/mo';
  }
}

/** One-line copy shown on contextual paywalls. */
export const PREMIUM_FEATURE_DESCRIPTIONS: Record<PremiumFeature, string> = {
  [PremiumFeature.Analytics]: 'Unlock studio analytics: costs, materials, firing trends, and more.',
  [PremiumFeature.UnlimitedPhotos]: 'Back up unlimited photos per piece to the cloud.',
  [PremiumFeature.CloudStorage]: 'Back up all your studio photos and media to the cloud — pieces, glazes, and profile.',
  [PremiumFeature.CompanionSwap]: 'Switch between your elemental companions anytime.',
  [PremiumFeature.FullPricing]: 'Access full pricing presets and revenue tools.',
  [PremiumFeature.KilnAnalytics]: 'See detailed kiln utilisation and firing analytics.',
  [PremiumFeature.Export]: 'Export your studio data anytime.',
  [PremiumFeature.UnlimitedMissions]: 'Complete unlimited studio missions every week.',
  [PremiumFeature.StudioRhythmAdvanced]: 'Unlock sprint mode, recurring events, and calendar overlays.',
  [PremiumFeature.YearlyWrap]: 'See your year in clay with a personalised wrap.',
  [PremiumFeature.Backup]: 'Unlimited cloud backup for your full studio archive.',
};

const PREMIUM_HEADLINES: Record<OnboardingUserType, string> = {
  'home-potter': 'Unlimited cloud backup, photos, and firing analytics for your home studio.',
  'studio-potter': 'Full cloud backup and export — your personal toolkit at the shared studio.',
  'studio-owner-technician': 'Unlimited cloud backup, kiln analytics, and deeper ops insight.',
  'business-owner': 'Unlimited cloud backup, margin analytics, and production insights.',
  'not-sure': 'Unlimited cloud backup and the full Pottery Nook toolkit.',
};

const PREMIUM_FEATURE_BY_ARCHETYPE: Partial<
  Record<OnboardingUserType, Partial<Record<PremiumFeature, string>>>
> = {
  'home-potter': {
    [PremiumFeature.Analytics]: 'See firing costs, materials, and trends for your home kiln.',
    [PremiumFeature.UnlimitedPhotos]: 'Back up every stage of your home practice to the cloud.',
    [PremiumFeature.CloudStorage]: 'Keep your full photo archive safe across devices.',
  },
  'studio-potter': {
    [PremiumFeature.CloudStorage]: 'Back up glaze tests, pieces, and journal photos to the cloud.',
    [PremiumFeature.UnlimitedPhotos]: 'Portfolio-ready cloud photos for every piece you make.',
    [PremiumFeature.Export]: 'Export your work history anytime.',
  },
  'studio-owner-technician': {
    [PremiumFeature.KilnAnalytics]: 'Detailed kiln utilisation and firing load analytics.',
    [PremiumFeature.Analytics]: 'Track fees collected and studio firing performance.',
    [PremiumFeature.Export]: 'Export firing logs and studio records.',
  },
  'business-owner': {
    [PremiumFeature.Analytics]: 'Margin, sold revenue, and production analytics.',
    [PremiumFeature.FullPricing]: 'Full pricing presets for markets and commissions.',
    [PremiumFeature.Export]: 'Export records for taxes and wholesale.',
  },
};

export function getPremiumUpgradeHeadline(userType: OnboardingUserType = 'not-sure'): string {
  return PREMIUM_HEADLINES[userType] ?? PREMIUM_HEADLINES['not-sure'];
}

export function getPremiumFeatureDescription(
  feature: PremiumFeature,
  userType?: OnboardingUserType,
): string {
  const resolvedType = userType ?? useAppStore.getState().onboardingProfile.userType;
  return (
    PREMIUM_FEATURE_BY_ARCHETYPE[resolvedType]?.[feature]
    ?? PREMIUM_FEATURE_DESCRIPTIONS[feature]
  );
}

/**
 * Synchronous gate check. Reads from the Zustand store snapshot, safe to
 * call outside of React components (e.g. in event handlers, utility functions).
 * Returns `true` if the user has an active premium entitlement.
 */
export function checkPremium(_feature: PremiumFeature): boolean {
  return resolvePremiumFromEntitlement(useAppStore.getState().isPremium);
}

/** Count all photos stored on a piece (cover + journal entries). */
export function countPiecePhotos(piece: Piece): number {
  let count = piece.photo || piece.imgUrl ? 1 : 0;
  for (const entry of piece.timeline) {
    if (entry.photos?.length) {
      count += entry.photos.filter(Boolean).length;
    }
  }
  return count;
}

/**
 * Local photos are always allowed. Cloud backup is gated separately via
 * {@link canSyncPiecePhotoToCloud}.
 */
export function canAddPiecePhoto(_piece: Piece, _isReplacing = false): boolean {
  return true;
}

/** Whether a new or replaced photo can be uploaded to cloud storage. */
export function canBackupPiecePhotoToCloud(
  piece: Piece,
  isReplacing: boolean,
): boolean {
  return canSyncPiecePhotoToCloud(piece, isReplacing);
}
