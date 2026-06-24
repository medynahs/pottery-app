import { KEYBOARD_FIELD_PADDING } from '@/src/hooks/useKeyboardBottomOffset';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-controller';

/** Approximate sticky footer block (padding + primary button). */
export const MODAL_SHEET_FOOTER_HEIGHT = 88;

/** Caret clearance above the sticky footer when the keyboard is open. */
export const MODAL_FORM_FOOTER_OFFSET = MODAL_SHEET_FOOTER_HEIGHT + KEYBOARD_FIELD_PADDING;

export type ModalFormScrollViewProps = KeyboardAwareScrollViewProps;

/**
 * ScrollView for form content inside ModalShell bottom sheets.
 * Scrolls the focused input into view; pair with ModalSheetFooter (KeyboardStickyView).
 */
export const ModalFormScrollView = React.forwardRef<
  React.ElementRef<typeof KeyboardAwareScrollView>,
  ModalFormScrollViewProps
>(function ModalFormScrollView(
  { style, contentContainerStyle, bottomOffset, extraKeyboardSpace, ...props },
  ref,
) {
  return (
    <KeyboardAwareScrollView
      ref={ref}
      bottomOffset={bottomOffset ?? MODAL_FORM_FOOTER_OFFSET}
      extraKeyboardSpace={extraKeyboardSpace ?? MODAL_SHEET_FOOTER_HEIGHT}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      style={StyleSheet.flatten([styles.flex, style])}
      contentContainerStyle={contentContainerStyle}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1, minHeight: 0 },
});
