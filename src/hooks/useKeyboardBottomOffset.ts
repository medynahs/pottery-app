import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 49;

export const KEYBOARD_FIELD_PADDING = 16;

export function useKeyboardBottomOffset(options?: { includeTabBar?: boolean; extra?: number }) {
  const insets = useSafeAreaInsets();
  const includeTabBar = options?.includeTabBar ?? false;
  const extra = options?.extra ?? KEYBOARD_FIELD_PADDING;
  return (includeTabBar ? TAB_BAR_HEIGHT : 0) + insets.bottom + extra;
}
