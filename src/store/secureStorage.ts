/**
 * Secure storage helpers for sensitive auth credentials.
 *
 * Email is stored encrypted via expo-secure-store (Keychain / Keystore).
 * SuperTokens session tokens are managed by the SDK — not stored here.
 */
import * as SecureStore from 'expo-secure-store';

const EMAIL_KEY = 'pottery_auth_email';

/** Serialize SecureStore writes so login cannot race with clearSession. */
let secureAuthChain: Promise<void> = Promise.resolve();

function enqueueSecureAuthOp<T>(op: () => Promise<T>): Promise<T> {
  const next = secureAuthChain.then(op, op);
  secureAuthChain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export async function saveSecureEmail(email: string): Promise<void> {
  await enqueueSecureAuthOp(() => SecureStore.setItemAsync(EMAIL_KEY, email));
}

export async function loadSecureEmail(): Promise<string | null> {
  return enqueueSecureAuthOp(() => SecureStore.getItemAsync(EMAIL_KEY));
}

export async function clearSecureEmail(): Promise<void> {
  await enqueueSecureAuthOp(() => SecureStore.deleteItemAsync(EMAIL_KEY));
}
