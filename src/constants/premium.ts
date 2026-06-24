import type { PurchasesPackage } from 'react-native-purchases';

export const PREMIUM_MONTHLY_PRICE_EUR = '€4.99';
export const PREMIUM_ANNUAL_PRICE_EUR = '€34.99';

export const PREMIUM_ANNUAL_SAVINGS_LABEL = 'Save 42%';

export function premiumDisplayPrice(
  pkg: PurchasesPackage | undefined,
  fallbackEur: string,
): string {
  if (!pkg?.product?.priceString) return fallbackEur;
  if (pkg.product?.currencyCode === 'EUR') return pkg.product.priceString;
  return fallbackEur;
}
