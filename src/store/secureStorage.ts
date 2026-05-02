/**
 * Secure storage helpers for sensitive auth credentials.
 *
 * sessionToken and oryIdentityId are stored encrypted via expo-secure-store
 * (the OS Keychain / Android Keystore) instead of plain AsyncStorage.
 * All other store state continues to use the Zustand AsyncStorage adapter.
 */
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY    = 'pottery_session_token';
const IDENTITY_KEY = 'pottery_ory_identity_id';

export async function saveSecureAuth(token: string, identityId: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(IDENTITY_KEY, identityId),
  ]);
}

export async function loadSecureAuth(): Promise<{ sessionToken: string; oryIdentityId: string } | null> {
  const [sessionToken, oryIdentityId] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(IDENTITY_KEY),
  ]);
  if (!sessionToken) return null;
  return { sessionToken, oryIdentityId: oryIdentityId ?? '' };
}

export async function clearSecureAuth(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(IDENTITY_KEY),
  ]);
}
