import type { Href } from 'expo-router';

export const KILN_QUEUE_PIECES_ROUTE = '/(tabs)/pieces?stage=bone-dry,glazing' as const;

export function resolveKilnDestination(hasKilnTab: boolean): Href {
  return hasKilnTab ? '/(tabs)/kiln' : KILN_QUEUE_PIECES_ROUTE;
}
