import * as React from "react";
import { Pressable as RNPressable, type PressableProps as RNPressableProps } from "react-native";
import { cn } from "./utils/cn";

export interface PressableProps extends RNPressableProps {
  className?: string;
}

const DEFAULT_HITSLOP = { top: 12, bottom: 12, left: 24, right: 24 };

const Pressable = React.forwardRef<React.ElementRef<typeof RNPressable>, PressableProps>(
  ({ className, style, hitSlop, ...props }, ref) => {
    return (
      <RNPressable
        ref={ref}
        className={cn(className)}
        style={style}
        hitSlop={hitSlop ?? DEFAULT_HITSLOP}
        {...props}
      />
    );
  }
);

Pressable.displayName = "Pressable";

export { Pressable };

