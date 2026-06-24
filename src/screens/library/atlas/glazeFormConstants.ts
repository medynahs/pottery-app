export const GLAZE_BRAND_OPTIONS = [
  'Amaco',
  'Mayco',
  'Spectrum',
  'Coyote',
  'Bristol',
  'Other',
] as const;

export const KNOWN_GLAZE_BRANDS = GLAZE_BRAND_OPTIONS.filter((b) => b !== 'Other');

export function isKnownGlazeBrand(value: string): boolean {
  return KNOWN_GLAZE_BRANDS.includes(value as (typeof KNOWN_GLAZE_BRANDS)[number]);
}

export function glazeBrandChipSelection(supplier: string): string {
  if (!supplier.trim()) return '';
  return isKnownGlazeBrand(supplier) ? supplier : 'Other';
}
