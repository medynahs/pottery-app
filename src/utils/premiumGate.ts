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

/**
 * Synchronous gate check. Reads from the Zustand store snapshot — safe to
 * call outside of React components (e.g. in event handlers, utility functions).
 * Returns `true` if the user has an active premium entitlement.
 */
export function checkPremium(_feature: PremiumFeature): boolean {
  return useAppStore.getState().isPremium;
}
