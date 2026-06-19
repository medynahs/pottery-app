import type { Piece, TimelineEntry } from '@/src/types/pieces';

export type CaptureMetaTile = {
  label: string;
  value: string;
  icon: string;
};

/** Metadata captured during stage advance, stored on the timeline entry. */
export function getEntryCaptureTiles(entry: TimelineEntry, piece?: Piece): CaptureMetaTile[] {
  const tiles: CaptureMetaTile[] = [];

  const bisqueTemp = entry.bisqueTemp ?? (entry.stage === 'bisque' ? piece?.bisqueTemp : undefined);
  const glazeTemp = entry.glazeTemp ?? (entry.stage === 'glaze-fired' ? piece?.glazeTemp : undefined);
  const status = entry.status ?? (entry.stage === 'finished' ? piece?.status : undefined);

  if (bisqueTemp) {
    tiles.push({ label: 'Bisque Cone', value: bisqueTemp, icon: '🔥' });
  }
  if (glazeTemp) {
    tiles.push({ label: 'Glaze Cone', value: glazeTemp, icon: '🌡️' });
  }
  if (status) {
    tiles.push({ label: 'Disposition', value: status, icon: '✦' });
  }
  return tiles;
}

export function hasEntryCapture(entry: TimelineEntry, piece?: Piece): boolean {
  return getEntryCaptureTiles(entry, piece).length > 0;
}
