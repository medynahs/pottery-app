export type TextScale = 'compact' | 'default' | 'comfortable' | 'large';

export const TEXT_SCALE_MULTIPLIERS: Record<TextScale, number> = {
  compact: 0.9,
  default: 1,
  comfortable: 1.12,
  large: 1.2,
};

export const TEXT_SCALE_LABELS: Record<TextScale, string> = {
  compact: 'Compact',
  default: 'Default',
  comfortable: 'Comfortable',
  large: 'Large',
};

export const TEXT_SCALE_DESCRIPTIONS: Record<TextScale, string> = {
  compact: 'Smaller text, more on screen',
  default: 'Standard app sizing',
  comfortable: 'Slightly larger for easier reading',
  large: 'Larger, best for low vision',
};

export const FONT_SIZES = {
  eyebrow: 10,
  caption: 11,
  body: 13,
  bodyLg: 14,
  title: 22,
  titleLg: 24,
  display: 26,
} as const;

export function scaleFont(size: number, scale: TextScale = 'default'): number {
  return Math.round(size * TEXT_SCALE_MULTIPLIERS[scale]);
}
