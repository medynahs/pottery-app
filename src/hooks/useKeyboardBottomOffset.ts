import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Standard bottom tab bar height in React Navigation. */
export const TAB_BAR_HEIGHT = 49;

/** Extra breathing room above the keyboard for focused fields. */
export const KEYBOARD_FIELD_PADDING = 16;

/**
 * Offset passed to keyboard-aware scroll views so focused inputs stay visible
 * above the keyboard, tab bar, and home indicator.
 */
export function useKeyboardBottomOffset(options?: { includeTabBar?: boolean; extra?: number }) {
  const insets = useSafeAreaInsets();
  const includeTabBar = options?.includeTabBar ?? false;
  const extra = options?.extra ?? KEYBOARD_FIELD_PADDING;
  return (includeTabBar ? TAB_BAR_HEIGHT : 0) + insets.bottom + extra;
}
