/** Dev/preview builds: unlock Premium without RevenueCat (Expo Go, internal demos). */
export function isForcePremiumEnabled(): boolean {
  return process.env.EXPO_PUBLIC_FORCE_PREMIUM === 'true';
}

let devPremiumOverride: boolean | null = null;

/** When set, local dev tier wins over RevenueCat / backend until cleared. */
export function getDevPremiumOverride(): boolean | null {
  return __DEV__ ? devPremiumOverride : null;
}

export function setDevPremiumOverride(value: boolean | null): void {
  if (!__DEV__) return;
  devPremiumOverride = value;
}

export function isDevPremiumOverrideActive(): boolean {
  return __DEV__ && devPremiumOverride !== null;
}

export function resolvePremiumFromEntitlement(hasEntitlement: boolean): boolean {
  if (__DEV__ && devPremiumOverride !== null) return devPremiumOverride;
  if (isForcePremiumEnabled()) return true;
  return hasEntitlement;
}
