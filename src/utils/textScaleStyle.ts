import { StyleSheet, type TextStyle } from 'react-native';
import { scaleFont, type TextScale } from '@/src/constants/typography';

/** Base px sizes aligned with Tailwind / text.tsx variants */
export const VARIANT_FONT_SIZES: Record<string, number> = {
  h1: 36,
  h2: 30,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  p: 16,
  blockquote: 16,
  code: 14,
  lead: 20,
  large: 18,
  small: 14,
  muted: 14,
};

const TAILWIND_SIZE_MAP: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

const TAILWIND_LEADING_MAP: Record<string, number> = {
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
};

const TAILWIND_LEADING_RATIO: Record<string, number> = {
  none: 1.1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

export function extractFontSizeFromClassName(className?: string): number | undefined {
  if (!className) return undefined;

  const bracket = className.match(/text-\[(\d+(?:\.\d+)?)px\]/);
  if (bracket) return Number(bracket[1]);

  const token = className.match(/\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b/)?.[1];
  return token ? TAILWIND_SIZE_MAP[token] : undefined;
}

export function extractLineHeightFromClassName(
  className?: string,
  baseFontSize = 16,
): number | undefined {
  if (!className) return undefined;

  const bracket = className.match(/leading-\[(\d+(?:\.\d+)?)(?:px)?\]/);
  if (bracket) return Number(bracket[1]);

  const numeric = className.match(/\bleading-(\d+)\b/)?.[1];
  if (numeric && TAILWIND_LEADING_MAP[numeric]) {
    return TAILWIND_LEADING_MAP[numeric];
  }

  const ratioToken = className.match(/\bleading-(none|tight|snug|normal|relaxed|loose)\b/)?.[1];
  if (ratioToken && TAILWIND_LEADING_RATIO[ratioToken]) {
    return Math.round(baseFontSize * TAILWIND_LEADING_RATIO[ratioToken]);
  }

  return undefined;
}

export function resolveBaseFontSize(
  style: TextStyle | TextStyle[] | undefined,
  className?: string,
  variant?: string | null,
): number {
  const flat = StyleSheet.flatten(style);
  if (typeof flat?.fontSize === 'number') return flat.fontSize;

  const fromClass = extractFontSizeFromClassName(className);
  if (fromClass) return fromClass;

  if (variant && VARIANT_FONT_SIZES[variant]) return VARIANT_FONT_SIZES[variant];

  return 16;
}

export function getScaledTextStyle(
  textScale: TextScale,
  options: {
    style?: TextStyle | TextStyle[] | undefined;
    className?: string;
    variant?: string | null;
    defaultSize?: number;
  },
): TextStyle {
  const flat = StyleSheet.flatten(options.style);
  const baseFontSize = resolveBaseFontSize(options.style, options.className, options.variant);
  const effectiveBase = baseFontSize === 16 && options.defaultSize ? options.defaultSize : baseFontSize;
  const scaledFontSize = scaleFont(effectiveBase, textScale);

  const scaledStyle: TextStyle = { fontSize: scaledFontSize };

  if (typeof flat?.lineHeight === 'number') {
    scaledStyle.lineHeight = scaleFont(flat.lineHeight, textScale);
  } else {
    const fromClass = extractLineHeightFromClassName(options.className, effectiveBase);
    if (fromClass !== undefined) {
      scaledStyle.lineHeight = scaleFont(fromClass, textScale);
    } else {
      scaledStyle.lineHeight = Math.round(scaledFontSize * 1.45);
    }
  }

  return scaledStyle;
}

export function getTextScaleMultiplier(textScale: TextScale): number {
  return scaleFont(16, textScale) / 16;
}
