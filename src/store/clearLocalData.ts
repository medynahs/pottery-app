import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { useAppStore } from './appStore';
import { clearSecureAuth } from './secureStorage';

/** Wipes AsyncStorage, SecureStore auth, and the Zustand persist snapshot. */
export async function clearAllLocalData(): Promise<void> {
  await Promise.all([AsyncStorage.clear(), clearSecureAuth()]);
  await useAppStore.persist.clearStorage();
}

/** Full local reset for new-user testing — clears storage then reloads the app. */
export async function resetLocalDataForTesting(): Promise<void> {
  await clearAllLocalData();

  if (Platform.OS === 'web') {
    const win = globalThis as typeof globalThis & { location?: { reload: () => void } };
    win.location?.reload();
    return;
  }

  try {
    const Updates = await import('expo-updates');
    await Updates.reloadAsync();
  } catch {
    const { DevSettings } = require('react-native') as typeof import('react-native');
    DevSettings.reload();
  }
}
