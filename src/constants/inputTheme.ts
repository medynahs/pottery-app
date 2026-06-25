import { BrandColors } from '@/src/constants/theme';

/** Shared typography + colors for all text fields. */
export const INPUT_FONT_SIZE = 16;
export const INPUT_FONT_SIZE_SM = 14;
export const INPUT_LINE_HEIGHT = 22;
export const INPUT_LINE_HEIGHT_SM = 20;

export const INPUT_TEXT_COLOR = 'hsl(24 25% 15%)';
export const INPUT_PLACEHOLDER_COLOR = 'hsl(24 16% 58%)';
export const INPUT_SELECTION_COLOR = BrandColors.primaryHex;
export const INPUT_ICON_COLOR = 'hsl(24 20% 50%)';

export const INPUT_BORDER_CLASS = 'border border-border';
export const INPUT_RADIUS_CLASS = 'rounded-xl';
export const INPUT_SURFACE_CLASS = 'bg-card';

export const INPUT_SINGLE_LINE_CLASS = [
  'native:h-12 min-h-10 w-full px-3.5 text-base text-foreground',
  INPUT_RADIUS_CLASS,
  INPUT_BORDER_CLASS,
  INPUT_SURFACE_CLASS,
].join(' ');

export const INPUT_MULTILINE_CLASS = [
  'w-full px-3.5 py-3 text-base text-foreground',
  INPUT_RADIUS_CLASS,
  INPUT_BORDER_CLASS,
  INPUT_SURFACE_CLASS,
].join(' ');

export const INPUT_GHOST_CLASS = 'flex-1 p-0 bg-transparent border-0 text-base text-foreground';

export const SEARCH_ROW_CLASS = [
  'flex-row items-center gap-2.5 px-3.5 native:h-12 min-h-10',
  INPUT_RADIUS_CLASS,
  INPUT_BORDER_CLASS,
  INPUT_SURFACE_CLASS,
].join(' ');
