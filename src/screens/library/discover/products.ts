import type { DiscoverInspiration, DiscoverProductRef } from './types';

export const DISCOVER_BRANDS = [
  'Amaco',
  'Mayco',
  'Spectrum',
  'Coyote',
  'Bristol',
  'Studio blend',
] as const;

export type DiscoverBrand = (typeof DISCOVER_BRANDS)[number] | 'all';

export function formatProductLayer(product: DiscoverProductRef): string {
  const layers = product.layers != null ? `${product.layers}× ` : '';
  const method = product.method ? `${product.method} · ` : '';
  return `${method}${layers}${product.brand} ${product.name}`;
}

export function inspirationBrands(inspiration: DiscoverInspiration): string[] {
  const brands = inspiration.products?.map((p) => p.brand) ?? [];
  return [...new Set(brands)];
}

export function inspirationProductLabel(inspiration: DiscoverInspiration): string {
  const products = inspiration.products ?? [];
  if (products.length === 0) return 'Glaze combo';
  if (products.length === 1) return `${products[0].brand} ${products[0].name}`;
  return products.map((p) => p.name).join(' + ');
}

export function normalizeProductToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** True when a library glaze likely matches a catalog product (store-bought or custom name match). */
export function glazeMatchesProduct(
  glaze: { name: string; supplier?: string; source?: string },
  product: DiscoverProductRef,
): boolean {
  const glazeName = normalizeProductToken(glaze.name.replace(/\s+v\d+\s*$/i, ''));
  const productName = normalizeProductToken(product.name);
  const productBrand = normalizeProductToken(product.brand);
  const supplier = normalizeProductToken(glaze.supplier ?? '');

  const nameMatch =
    glazeName.includes(productName)
    || productName.includes(glazeName)
    || glazeName.split(' ').some((word) => word.length > 3 && productName.includes(word));

  if (!nameMatch) return false;

  if (!supplier) return true;
  return supplier.includes(productBrand) || productBrand.includes(supplier);
}

export function comboUsesOwnedGlaze(
  inspiration: DiscoverInspiration,
  glazes: { name: string; supplier?: string; source?: string }[],
): boolean {
  const products = inspiration.products ?? [];
  if (products.length === 0 || glazes.length === 0) return false;
  return products.some((product) => glazes.some((glaze) => glazeMatchesProduct(glaze, product)));
}
