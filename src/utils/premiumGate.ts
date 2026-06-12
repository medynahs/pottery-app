import type { Piece } from '../types/pieces';
import { useAppStore } from '../store/appStore';

/**
 * Enum of all premium-gated features.
 * Pass as the first argument to `checkPremium()` when deciding whether
 * to allow access or show `PremiumPaywallSheet`.
 */
export enum PremiumFeature {
  Analytics        = 'analytics',
  UnlimitedPhotos  = 'unlimited-photos',
  FullGlazeAtlas   = 'full-glaze-atlas',
  CompanionSwap    = 'companion-swap',
  FullPricing      = 'full-pricing',
  KilnAnalytics    = 'kiln-analytics',
  Export           = 'export',
  UnlimitedMissions = 'unlimited-missions',
  YearlyWrap        = 'yearly-wrap',
  Backup            = 'backup',
}

/** Free-tier glaze library cap (ticket #65). */
export const FREE_GLAZE_LIMIT = 15;

/** One-line copy shown on contextual paywalls. */
export const PREMIUM_FEATURE_DESCRIPTIONS: Record<PremiumFeature, string> = {
  [PremiumFeature.Analytics]: 'Unlock studio analytics — costs, materials, firing trends, and more.',
  [PremiumFeature.UnlimitedPhotos]: 'Document every stage of your process.',
  [PremiumFeature.FullGlazeAtlas]: 'Build your complete glaze library without limits.',
  [PremiumFeature.CompanionSwap]: 'Switch between your elemental companions anytime.',
  [PremiumFeature.FullPricing]: 'Access full pricing presets and revenue tools.',
  [PremiumFeature.KilnAnalytics]: 'See detailed kiln utilisation and firing analytics.',
  [PremiumFeature.Export]: 'Export your studio data anytime.',
  [PremiumFeature.UnlimitedMissions]: 'Complete unlimited studio missions every week.',
  [PremiumFeature.YearlyWrap]: 'See your year in clay with a personalised wrap.',
  [PremiumFeature.Backup]: 'Back up and restore your full studio archive.',
};

/**
 * Synchronous gate check. Reads from the Zustand store snapshot — safe to
 * call outside of React components (e.g. in event handlers, utility functions).
 * Returns `true` if the user has an active premium entitlement.
 */
export function checkPremium(_feature: PremiumFeature): boolean {
  return useAppStore.getState().isPremium;
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
 * Free tier: one photo per piece (cover counts). Replacing an existing photo
 * is always allowed; adding a new slot requires premium once the limit is hit.
 */
export function canAddPiecePhoto(piece: Piece, isReplacing: boolean): boolean {
  if (isReplacing) return true;
  if (checkPremium(PremiumFeature.UnlimitedPhotos)) return true;
  return countPiecePhotos(piece) < 1;
}

/** Free tier: up to {@link FREE_GLAZE_LIMIT} glazes in the atlas. */
export function canAddGlaze(currentCount: number): boolean {
  if (checkPremium(PremiumFeature.FullGlazeAtlas)) return true;
  return currentCount < FREE_GLAZE_LIMIT;
}
