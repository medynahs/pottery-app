import { Linking, Platform } from 'react-native';

const ANDROID_PACKAGE = 'com.ariane.potterylife';

/** Open the platform subscription management page (App Store / Google Play). */
export async function openPlatformSubscriptionSettings(): Promise<boolean> {
  const url =
    Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : `https://play.google.com/store/account/subscriptions?package=${ANDROID_PACKAGE}`;

  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export function formatSubscriptionDate(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Map a store product id to a human-readable plan label. */
export function planLabelFromProductId(productId: string | undefined): string | null {
  if (!productId) return null;
  const id = productId.toLowerCase();
  if (id.includes('annual') || id.includes('yearly') || id.includes('year')) return 'Yearly';
  if (id.includes('month')) return 'Monthly';
  return null;
}
