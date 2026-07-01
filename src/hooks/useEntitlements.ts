/**
 * useEntitlements, RevenueCat SDK hook (T56)
 *
 * Initialises the RC SDK once on first call, identifies the user when
 * `backendUserId` becomes available, and exposes purchase / restore helpers.
 * All entitlement state is synced into `appStore.isPremium` so the rest of
 * the app can read it without depending on this hook.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
    LOG_LEVEL,
    type PurchasesOffering,
    type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { AnalyticsEvents } from '@/src/constants/analytics';
import { captureAnalyticsEvent } from '@/src/hooks/useAnalytics';
import { isForcePremiumEnabled, resolvePremiumFromEntitlement } from '../utils/forcePremium';
import { planLabelFromProductId, openPlatformSubscriptionSettings } from '../utils/subscriptionSettings';
import { useAppStore } from '../store/appStore';

const IOS_KEY     = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY     ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const ENTITLEMENT_ID = 'PotteryNook Pro';

let rcConfigured = false;

function applyForcePremium(): void {
  if (!isForcePremiumEnabled()) return;
  useAppStore.getState().setIsPremium(true);
}

export interface SubscriptionDetails {
  planLabel: string | null;
  expirationDate: string | null;
  willRenew: boolean;
  store: string | null;
}

export function isRevenueCatConfigured(): boolean {
  return rcConfigured;
}

export async function getSubscriptionDetails(): Promise<SubscriptionDetails | null> {
  if (!rcConfigured) return null;
  try {
    const info = await Purchases.getCustomerInfo();
    const entitlement = info.entitlements.active[ENTITLEMENT_ID];
    if (!entitlement) return null;

    return {
      planLabel: planLabelFromProductId(entitlement.productIdentifier) ?? entitlement.productIdentifier,
      expirationDate: entitlement.expirationDate ?? null,
      willRenew: entitlement.willRenew,
      store: entitlement.store ?? null,
    };
  } catch {
    return null;
  }
}

/** Idempotent, safe to call multiple times; configures RC once per process. */
export function configureRevenueCat(): void {
  applyForcePremium();
  if (rcConfigured) return;
  // react-native-purchases requires a native development build, skip in Expo Go / web
  if (Platform.OS === 'web') return;
  const key = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!key) return; // keys not yet set (dev), skip silently
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey: key });

    // Keep isPremium in sync whenever RC notifies us of a customer info change -
    // this covers purchases from the native paywall, restores, expirations, etc.
    Purchases.addCustomerInfoUpdateListener((info) => {
      useAppStore.getState().setIsPremium(
        resolvePremiumFromEntitlement(!!info.entitlements.active[ENTITLEMENT_ID]),
      );
    });

    rcConfigured = true;
  } catch {
    // Native module not available (e.g. Expo Go), silently skip
  }
}

export function useEntitlements() {
  const backendUserId  = useAppStore((s) => s.backendUserId);
  const isPremium      = useAppStore((s) => s.isPremium);
  const setIsPremium   = useAppStore((s) => s.setIsPremium);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [offering, setOffering]   = useState<PurchasesOffering | null>(null);

  // Track which userId we've already identified so we don't re-login on every render
  const identifiedRef = useRef<string | null>(null);

  // Ensure SDK is configured on first hook mount
  useEffect(() => {
    configureRevenueCat();
  }, []);

  // Identify user in RevenueCat when backendUserId becomes known
  useEffect(() => {
    if (!backendUserId || !rcConfigured || identifiedRef.current === backendUserId) return;

    void (async () => {
      try {
        const { customerInfo } = await Purchases.logIn(backendUserId);
        identifiedRef.current = backendUserId;
        setIsPremium(resolvePremiumFromEntitlement(!!customerInfo.entitlements.active[ENTITLEMENT_ID]));
      } catch {
        // RC identification failure is non-fatal, entitlements stay unchanged
      }
    })();
  }, [backendUserId, setIsPremium]);

  // Load current offering (monthly + annual packages)
  useEffect(() => {
    if (!rcConfigured) return;

    void (async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current) setOffering(offerings.current);
      } catch {
        // Suppress, offering stays null; UI shows price strings as fallback
      }
    })();
  }, []);

  /** Re-fetch and sync the latest customer info from RC. */
  const syncCustomerInfo = useCallback(async () => {
    if (!rcConfigured) return;
    try {
      const info = await Purchases.getCustomerInfo();
      setIsPremium(resolvePremiumFromEntitlement(!!info.entitlements.active[ENTITLEMENT_ID]));
    } catch {
      // suppress
    }
  }, [setIsPremium]);

  /** Initiate a purchase for the given package. Returns true on success. */
  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    if (!rcConfigured) return false;
    setIsLoading(true);
    setError(null);
    const wasPremium = useAppStore.getState().isPremium;
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const nowPremium = resolvePremiumFromEntitlement(!!customerInfo.entitlements.active[ENTITLEMENT_ID]);
      setIsPremium(nowPremium);
      if (nowPremium && !wasPremium) {
        captureAnalyticsEvent(AnalyticsEvents.PREMIUM_PURCHASE_COMPLETED, {
          plan: pkg.packageType,
          product_id: pkg.product.identifier,
        });
      }
      return nowPremium;
    } catch (e: unknown) {
      const rcError = e as { userCancelled?: boolean };
      if (!rcError?.userCancelled) {
        setError('Purchase failed. Please try again.');
        captureAnalyticsEvent(AnalyticsEvents.PREMIUM_PURCHASE_FAILED, { cancelled: false });
      } else {
        captureAnalyticsEvent(AnalyticsEvents.PREMIUM_PURCHASE_FAILED, { cancelled: true });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setIsPremium]);

  /** Restore previous purchases and re-sync entitlements. */
  const restore = useCallback(async () => {
    if (!rcConfigured) return;
    setIsLoading(true);
    setError(null);
    const wasPremium = useAppStore.getState().isPremium;
    try {
      const customerInfo = await Purchases.restorePurchases();
      const nowPremium = resolvePremiumFromEntitlement(!!customerInfo.entitlements.active[ENTITLEMENT_ID]);
      setIsPremium(nowPremium);
      if (nowPremium && !wasPremium) {
        captureAnalyticsEvent(AnalyticsEvents.PREMIUM_RESTORE_COMPLETED);
      }
    } catch {
      setError('Restore failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setIsPremium]);

  return {
    isPremium,
    offering,
    purchase,
    restore,
    syncCustomerInfo,
    isLoading,
    error,
  };
}

/**
 * Present the RevenueCat native paywall. Returns true if user purchased or
 * restored, false if they cancelled or an error occurred.
 * No-ops in Expo Go / web where the native module is unavailable.
 */
export async function presentPaywall(): Promise<boolean> {
  if (!rcConfigured) return false;
  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    });
    return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  } catch (e) {
    console.warn('[RC] Error presenting paywall:', e);
    return false;
  }
}

/**
 * Open subscription management, RevenueCat Customer Center when available,
 * otherwise the platform subscription settings page.
 */
export async function openSubscriptionManagement(): Promise<boolean> {
  if (isRevenueCatConfigured()) {
    try {
      await RevenueCatUI.presentCustomerCenter();
      return true;
    } catch (e) {
      console.warn('[RC] Error presenting Customer Center:', e);
    }
  }

  return openPlatformSubscriptionSettings();
}

/**
 * Open the RevenueCat Customer Center (subscription management self-service UI).
 * No-ops in Expo Go / web where the native module is unavailable.
 */
export async function presentCustomerCenter(): Promise<void> {
  await openSubscriptionManagement();
}
