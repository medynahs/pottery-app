import { createEmptyGlazeDraft } from '@/src/screens/library/atlas/helpers';
import type { GlazeDraft } from '@/src/screens/library/atlas/types';
import type { GlazeFinish } from '@/src/screens/glazes/types';
import { formatProductLayer } from './products';
import type { DiscoverInspiration, DiscoverProductRef } from './types';

const ROLE_LABELS: Record<NonNullable<DiscoverProductRef['role']>, string> = {
  base: 'Base layer',
  accent: 'Top layer',
  liner: 'Liner',
};

function resolveFinish(finish?: string): GlazeFinish | undefined {
  if (finish === 'glossy' || finish === 'matte' || finish === 'satin' || finish === 'crystalline') {
    return finish;
  }
  return undefined;
}

/** Prefill Add Glaze for one product from a Discover combo stack. */
export function discoverProductToGlazeDraft(
  product: DiscoverProductRef,
  inspiration: Pick<DiscoverInspiration, 'title' | 'coneLabel' | 'finish'>,
  defaultCone: string | null,
): GlazeDraft {
  const cone = inspiration.coneLabel.trim() || defaultCone || 'Cone 6';
  const draft = createEmptyGlazeDraft(defaultCone, []);
  draft.name = product.name;
  draft.source = 'store-bought';
  draft.supplier = product.brand;
  draft.defaultCone = cone;
  draft.coneRange = cone;

  const finish = resolveFinish(inspiration.finish);
  if (finish) draft.finish = finish;

  const roleLabel = product.role ? ROLE_LABELS[product.role] : null;
  draft.applicationNotes = formatProductLayer(product);
  draft.notes = roleLabel
    ? `From Discover combo “${inspiration.title}” · ${roleLabel}.`
    : `From Discover combo “${inspiration.title}”.`;

  return draft;
}
