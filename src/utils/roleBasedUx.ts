import type { OnboardingUserType } from '@/src/store/appStore';
import type { AnalyticsTabId } from '@/src/screens/analytics/components/AnalyticsTabBar';
import type { PricingUserType } from '@/src/types/pricing';

export type KilnSectionMode = 'kilns' | 'sessions' | 'queue';

export type AnalyticsLens = 'studio-ops' | 'member-fees' | 'seller' | 'personal';

export function getDefaultKilnSection(userType: OnboardingUserType): KilnSectionMode {
  if (userType === 'studio-owner-technician') return 'sessions';
  if (userType === 'studio-potter') return 'queue';
  return 'queue';
}

export function getAnalyticsLens(userType: OnboardingUserType): AnalyticsLens {
  switch (userType) {
    case 'studio-owner-technician':
      return 'studio-ops';
    case 'studio-potter':
      return 'member-fees';
    case 'business-owner':
      return 'seller';
    default:
      return 'personal';
  }
}

export function getDefaultAnalyticsTab(userType: OnboardingUserType): AnalyticsTabId {
  switch (userType) {
    case 'studio-owner-technician':
      return 'firings';
    case 'business-owner':
      return 'pieces';
    case 'studio-potter':
      return 'costs';
    default:
      return 'overview';
  }
}

export function getPricingCopy(userType: OnboardingUserType) {
  switch (userType) {
    case 'studio-owner-technician':
      return {
        screenSubtitle: 'Set firing fees you charge members and track kiln revenue.',
        firingFeeLabel: 'Firing fees collected',
        revenueLabel: 'Kiln revenue',
      };
    case 'studio-potter':
      return {
        screenSubtitle: 'Track what you pay the studio for bisque and glaze firings.',
        firingFeeLabel: 'Firing fees paid',
        revenueLabel: 'Studio firing costs',
      };
    case 'business-owner':
      return {
        screenSubtitle: 'Price work for markets, commissions, and wholesale.',
        firingFeeLabel: 'Firing fee',
        revenueLabel: 'Sold revenue',
      };
    case 'home-potter':
      return {
        screenSubtitle: 'Cover clay, glaze, and firing costs for your home studio.',
        firingFeeLabel: 'Firing fee',
        revenueLabel: 'Sales revenue',
      };
    default:
      return {
        screenSubtitle: 'Tune defaults for how you price and track studio costs.',
        firingFeeLabel: 'Firing fee',
        revenueLabel: 'Revenue',
      };
  }
}

export function pricingUserTypeForArchetype(userType: OnboardingUserType): PricingUserType {
  switch (userType) {
    case 'home-potter':
      return 'hobby';
    case 'business-owner':
    case 'studio-owner-technician':
      return 'full-time';
    default:
      return 'side-business';
  }
}
