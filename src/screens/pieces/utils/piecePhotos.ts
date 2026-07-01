import type { Piece } from '@/src/types/pieces';

export type PiecePhotoItem = {
  uri: string;
  caption: string;
};

/** Collect cover + timeline photos in journal order for gallery display. */
export function collectPiecePhotos(
  piece: Piece,
  stageLabels: Record<string, string> = {},
): PiecePhotoItem[] {
  const items: PiecePhotoItem[] = [];
  const cover = piece.photo ?? piece.imgUrl;

  if (cover) {
    items.push({ uri: cover, caption: 'Cover photo' });
  }

  for (const entry of piece.timeline) {
    const photos = (entry.photos ?? []).filter((p) => p.uri);
    if (photos.length === 0) continue;

    const stageLabel = stageLabels[entry.stage] ?? entry.stage;
    const dateLabel = new Date(entry.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    photos.forEach((photo, index) => {
      const suffix = photos.length > 1 ? ` · ${index + 1}/${photos.length}` : '';
      items.push({
        uri: photo.uri,
        caption: `${stageLabel} · ${dateLabel}${suffix}`,
      });
    });
  }

  return items;
}
