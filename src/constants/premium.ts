import type { PurchasesPackage } from 'react-native-purchases';

/** V1 list prices (EUR), see TICKETS.md monetization section. */
export const PREMIUM_MONTHLY_PRICE_EUR = '€4.99';
export const PREMIUM_ANNUAL_PRICE_EUR = '€34.99';

/** vs 12 × monthly: (59.88 − 34.99) / 59.88 ≈ 42% */
export const PREMIUM_ANNUAL_SAVINGS_LABEL = 'Save 42%';

/** Prefer RevenueCat price only when the store product is in EUR; otherwise show list price. */
export function premiumDisplayPrice(
  pkg: PurchasesPackage | undefined,
  fallbackEur: string,
): string {
  if (!pkg?.product.priceString) return fallbackEur;
  if (pkg.product.currencyCode === 'EUR') return pkg.product.priceString;
  return fallbackEur;
}
