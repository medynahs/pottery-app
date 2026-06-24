import { scaleFont } from "@/src/constants/typography";
import { useTextScaleContext } from "@/src/hooks/useTextScale";
import { extractFontSizeFromClassName } from "@/src/utils/textScaleStyle";
import * as React from "react";
import { TextInput, type TextInputProps, Platform, StyleSheet } from "react-native";
import { cn } from "./utils/cn";

interface InputProps extends TextInputProps {}

const SINGLE_LINE_CLASS =
  "native:h-12 h-10 w-full rounded-md border-2 border-input bg-background px-3 text-base text-foreground placeholder:text-muted-foreground";

const MULTILINE_CLASS =
  "w-full rounded-md border-2 border-input bg-background px-3 py-3 text-base text-foreground placeholder:text-muted-foreground";

const Input = React.forwardRef<
  React.ElementRef<typeof TextInput>,
  InputProps
>(({ className, placeholderClassName, style, multiline, ...props }, ref) => {
  const textScale = useTextScaleContext();
  const flat = StyleSheet.flatten(style);
  const baseFromClass = extractFontSizeFromClassName(
    cn(multiline ? MULTILINE_CLASS : SINGLE_LINE_CLASS, className),
  );
  const baseSize = typeof flat?.fontSize === 'number' ? flat.fontSize : baseFromClass ?? 16;
  const scaledFontSize = scaleFont(baseSize, textScale);
  const { fontSize: _fs, ...restStyle } = flat ?? {};

  const androidStyles =
    Platform.OS === 'android'
      ? multiline
        ? { paddingVertical: 12, textAlignVertical: 'top' as const }
        : { paddingVertical: 8, textAlignVertical: 'center' as const }
      : {};

  const iosMultilineStyles =
    Platform.OS === 'ios' && multiline
      ? { paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top' as const }
      : null;

  return (
    <TextInput
      ref={ref}
      multiline={multiline}
      className={cn(
        multiline ? MULTILINE_CLASS : SINGLE_LINE_CLASS,
        "web:flex web:py-2 web:ring-offset-background file:border-0 file:bg-transparent file:font-medium",
        "web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
        "focus:border-primary",
        props.editable === false && "opacity-50 web:cursor-not-allowed",
        className
      )}
      placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
      placeholderTextColor="#9ca3af"
      selectionColor="#6366f1"
      underlineColorAndroid="transparent"
      style={[androidStyles, iosMultilineStyles, restStyle, { fontSize: scaledFontSize }]}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
export type { InputProps };
