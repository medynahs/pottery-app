/**
 * Hydrates `appStore.isPremium` from GET /users/me/entitlement.
 * Merges with RevenueCat — never downgrades an already-premium RC session.
 */

import { ApiError, isAccountDeletedError } from '@/src/services/api';
import { fetchEntitlement } from '@/src/services/entitlement';
import { useAppStore } from '@/src/store';
import { isDevPremiumOverrideActive, isForcePremiumEnabled, resolvePremiumFromEntitlement } from '@/src/utils/forcePremium';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const ENTITLEMENT_QUERY_KEY = ['entitlement'] as const;

export function useEntitlementSync() {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const setIsPremium = useAppStore((s) => s.setIsPremium);

  const query = useQuery({
    queryKey: ENTITLEMENT_QUERY_KEY,
    queryFn: () => fetchEntitlement(),
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 401 || isAccountDeletedError(error))) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (!query.data) return;
    if (isForcePremiumEnabled() || isDevPremiumOverrideActive()) return;

    const backendPremium = query.data.tier === 'premium';
    setIsPremium(resolvePremiumFromEntitlement(backendPremium));
  }, [query.data, setIsPremium]);

  return query;
}

