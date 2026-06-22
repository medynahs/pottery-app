import type { Href } from 'expo-router';
import type { KilnSectionMode } from '@/src/utils/roleBasedUx';

export const KILN_QUEUE_PIECES_ROUTE = '/(tabs)/pieces?stage=bone-dry,glazing' as const;
export const KILN_ACTIVE_KILNS_ROUTE = '/(tabs)/kiln?section=kilns' as const;

export function parseKilnSectionParam(
  section: string | string[] | undefined,
): KilnSectionMode | null {
  const raw = Array.isArray(section) ? section[0] : section;
  if (raw === 'kilns' || raw === 'sessions' || raw === 'queue') return raw;
  return null;
}

export function resolveKilnDestination(hasKilnTab: boolean): Href {
  return hasKilnTab ? '/(tabs)/kiln' : KILN_QUEUE_PIECES_ROUTE;
}
