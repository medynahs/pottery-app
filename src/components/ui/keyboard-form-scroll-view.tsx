import { useKeyboardBottomOffset } from '@/src/hooks/useKeyboardBottomOffset';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-controller';

export type KeyboardFormScrollViewProps = KeyboardAwareScrollViewProps & {
  /** Account for the main tab bar when the screen sits inside (tabs). */
  includeTabBar?: boolean;
};

const KeyboardFormScrollView = React.forwardRef<
  React.ElementRef<typeof KeyboardAwareScrollView>,
  KeyboardFormScrollViewProps
>(({ style, contentContainerStyle, includeTabBar, bottomOffset, ...props }, ref) => {
  const computedBottomOffset = useKeyboardBottomOffset({ includeTabBar });

  return (
    <KeyboardAwareScrollView
      ref={ref}
      bottomOffset={bottomOffset ?? computedBottomOffset}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={StyleSheet.flatten([styles.flex, style])}
      contentContainerStyle={contentContainerStyle}
      {...props}
    />
  );
});

KeyboardFormScrollView.displayName = 'KeyboardFormScrollView';

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export { KeyboardFormScrollView };
