import * as React from 'react';
import {
  KeyboardAvoidingView as ControllerKeyboardAvoidingView,
  type KeyboardAvoidingViewProps as ControllerKeyboardAvoidingViewProps,
} from 'react-native-keyboard-controller';
import { cn } from './utils/cn';

interface KeyboardAvoidingViewProps extends ControllerKeyboardAvoidingViewProps {}

const KeyboardAvoidingView = React.forwardRef<
  React.ElementRef<typeof ControllerKeyboardAvoidingView>,
  KeyboardAvoidingViewProps
>(({ className, behavior = 'padding', ...props }, ref) => {
  return (
    <ControllerKeyboardAvoidingView
      ref={ref}
      behavior={behavior}
      className={cn('flex-1', className)}
      {...props}
    />
  );
});
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export { KeyboardAvoidingView };
export type { KeyboardAvoidingViewProps };
