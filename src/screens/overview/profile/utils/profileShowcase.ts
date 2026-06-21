import type { Piece } from '@/src/types/pieces';

/** Best photo to represent a finished piece on the profile grid. */
export function resolveShowcasePhoto(piece: Piece): string | null {
  const finishedPhotos = piece.timeline
    .filter((entry) => entry.stage === 'finished')
    .flatMap((entry) => entry.photos?.filter(Boolean) ?? []);

  if (finishedPhotos.length > 0) {
    return finishedPhotos[finishedPhotos.length - 1] ?? null;
  }

  const cover = piece.photo ?? piece.imgUrl;
  if (cover) return cover;

  for (let i = piece.timeline.length - 1; i >= 0; i -= 1) {
    const photos = piece.timeline[i].photos?.filter(Boolean) ?? [];
    if (photos.length > 0) return photos[photos.length - 1] ?? null;
  }

  return null;
}

/** Finished pieces the potter wants visible on their profile, newest first. */
export function getProfileShowcasePieces(pieces: Piece[]): Piece[] {
  return pieces
    .filter((piece) => piece.stage === 'finished' && piece.showOnProfile !== false)
    .filter((piece) => resolveShowcasePhoto(piece) != null)
    .sort((a, b) => {
      const aTime = a.updatedAt ?? a.createdAt;
      const bTime = b.updatedAt ?? b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
}
