import * as React from 'react';
import {
  KeyboardAvoidingView as ControllerKeyboardAvoidingView,
} from 'react-native-keyboard-controller';
import { cn } from './utils/cn';

export type KeyboardAvoidingViewProps = React.ComponentPropsWithoutRef<
  typeof ControllerKeyboardAvoidingView
> & {
  className?: string;
};

const KeyboardAvoidingView = React.forwardRef<
  React.ElementRef<typeof ControllerKeyboardAvoidingView>,
  KeyboardAvoidingViewProps
>(({ className, ...props }, ref) => {
  return (
    <ControllerKeyboardAvoidingView
      ref={ref}
      className={cn('flex-1', className)}
      {...props}
    />
  );
});
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export { KeyboardAvoidingView };
