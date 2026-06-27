import * as SecureStore from 'expo-secure-store';

const EMAIL_KEY = 'pottery_ory_email';

export async function saveSecureEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(EMAIL_KEY, email);
}

export async function loadSecureEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(EMAIL_KEY);
}

export async function clearSecureEmail(): Promise<void> {
  await SecureStore.deleteItemAsync(EMAIL_KEY);
}
