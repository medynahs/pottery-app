import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Zustand-compatible AsyncStorage adapter.
 * Passed to the `persist` middleware so all store state is
 * written to the device's local storage automatically.
 */
export const zustandStorage = createJSONStorage(() => AsyncStorage);
