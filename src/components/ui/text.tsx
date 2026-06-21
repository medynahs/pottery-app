import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from "react-native";
import { useTextScaleContext } from "@/src/hooks/useTextScale";
import { getScaledTextStyle } from "@/src/utils/textScaleStyle";
import { cn } from "./utils/cn";
import { TextClassContext } from "./utils/text-context";

const textVariants = cva("text-base text-foreground font-body", {
  variants: {
    variant: {
      h1: "web:select-text text-4xl font-display tracking-tight lg:text-5xl",
      h2: "web:select-text text-3xl font-display tracking-tight",
      h3: "web:select-text text-2xl font-display",
      h4: "web:select-text text-xl font-display",
      h5: "web:select-text text-lg font-body-medium",
      h6: "web:select-text text-base font-body-medium",
      p: "web:select-text leading-relaxed",
      blockquote: "web:select-text mt-6 border-l-2 pl-6 italic font-display",
      code: "web:select-text relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
      lead: "web:select-text text-xl text-muted-foreground leading-relaxed",
      large: "web:select-text text-lg font-body-medium",
      small: "web:select-text text-sm font-body-medium leading-none",
      muted: "web:select-text text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {}

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, variant, style, ...props }, ref) => {
    const textClass = React.useContext(TextClassContext);
    const textScale = useTextScaleContext();
    const mergedClassName = cn(textVariants({ variant }), textClass, className);
    const flat = StyleSheet.flatten(style);
    const scaledStyle = getScaledTextStyle(textScale, {
      style: flat,
      className: mergedClassName,
      variant,
    });
    const { fontSize: _fs, lineHeight: _lh, ...restStyle } = flat ?? {};

    return (
      <RNText
        className={mergedClassName}
        style={[scaledStyle, restStyle]}
        ref={ref}
        maxFontSizeMultiplier={1}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Text, textVariants };
export type { TextProps };
