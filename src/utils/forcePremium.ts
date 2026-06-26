/** Dev/preview builds: unlock Premium without RevenueCat (Expo Go, internal demos). */
export function isForcePremiumEnabled(): boolean {
  return process.env.EXPO_PUBLIC_FORCE_PREMIUM === 'true';
}

export function resolvePremiumFromEntitlement(hasEntitlement: boolean): boolean {
  return isForcePremiumEnabled() || hasEntitlement;
}
