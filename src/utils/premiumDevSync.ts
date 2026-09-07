import { refreshPremiumEntitlementFromSdk } from '@/src/hooks/useEntitlements';
import { setDevPremiumOverride } from '@/src/utils/forcePremium';

/** Clear dev override and re-read RevenueCat (or fall back to free). */
export async function syncPremiumEntitlementFromSdk(): Promise<void> {
  if (!__DEV__) return;

  setDevPremiumOverride(null);
  await refreshPremiumEntitlementFromSdk();
}
