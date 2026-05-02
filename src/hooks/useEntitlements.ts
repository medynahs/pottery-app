/**
 * useEntitlements — RevenueCat SDK hook (T56)
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
import { useAppStore } from '../store/appStore';

const IOS_KEY     = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY     ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

let rcConfigured = false;

/** Idempotent — safe to call multiple times; configures RC once per process. */
export function configureRevenueCat(): void {
  if (rcConfigured) return;
  // react-native-purchases requires a native development build — skip in Expo Go / web
  if (Platform.OS === 'web') return;
  const key = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!key) return; // keys not yet set (dev) — skip silently
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey: key });

    // Keep isPremium in sync whenever RC notifies us of a customer info change —
    // this covers purchases from the native paywall, restores, expirations, etc.
    Purchases.addCustomerInfoUpdateListener((info) => {
      useAppStore.getState().setIsPremium(
        !!info.entitlements.active['PotteryNook Pro'],
      );
    });

    rcConfigured = true;
  } catch {
    // Native module not available (e.g. Expo Go) — silently skip
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
        setIsPremium(!!customerInfo.entitlements.active['PotteryNook Pro']);
      } catch {
        // RC identification failure is non-fatal — entitlements stay unchanged
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
        // Suppress — offering stays null; UI shows price strings as fallback
      }
    })();
  }, []);

  /** Re-fetch and sync the latest customer info from RC. */
  const syncCustomerInfo = useCallback(async () => {
    if (!rcConfigured) return;
    try {
      const info = await Purchases.getCustomerInfo();
      setIsPremium(!!info.entitlements.active['PotteryNook Pro']);
    } catch {
      // suppress
    }
  }, [setIsPremium]);

  /** Initiate a purchase for the given package. Returns true on success. */
  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    if (!rcConfigured) return false;
    setIsLoading(true);
    setError(null);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setIsPremium(!!customerInfo.entitlements.active['PotteryNook Pro']);
      return true;
    } catch (e: unknown) {
      const rcError = e as { userCancelled?: boolean };
      if (!rcError?.userCancelled) {
        setError('Purchase failed. Please try again.');
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
    try {
      const customerInfo = await Purchases.restorePurchases();
      setIsPremium(!!customerInfo.entitlements.active['PotteryNook Pro']);
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
      requiredEntitlementIdentifier: 'PotteryNook Pro',
    });
    return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  } catch (e) {
    console.warn('[RC] Error presenting paywall:', e);
    return false;
  }
}

/**
 * Open the RevenueCat Customer Center (subscription management self-service UI).
 * No-ops in Expo Go / web where the native module is unavailable.
 */
export async function presentCustomerCenter(): Promise<void> {
  if (!rcConfigured) return;
  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch (e) {
    console.warn('[RC] Error presenting Customer Center:', e);
  }
}
