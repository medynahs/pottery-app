import { API_BASE_URL } from './index';
import { ApiError, apiErrorFromResponse } from './api';

export type SubscriptionTier = 'basic' | 'premium';

export interface EntitlementResponse {
  tier: SubscriptionTier;
  expires_at?: string | null;
}

/** GET /users/me/entitlement — active subscription tier from RevenueCat webhook mirror. */
export async function fetchEntitlement(): Promise<EntitlementResponse> {
  const res = await fetch(`${API_BASE_URL}/users/me/entitlement`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await apiErrorFromResponse(res, 'fetchEntitlement failed');
  return res.json() as Promise<EntitlementResponse>;
}

export { ApiError };
