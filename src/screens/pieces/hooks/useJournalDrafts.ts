import { EntryDraft } from '@/src/types/journal';
import type { Piece, PiecePhoto } from '@/src/types/pieces';
import { useCallback, useEffect, useState } from 'react';

/** Migrate a legacy single-photo entry to the photos array. */
function initPhotos(entry: { photo?: string; photos?: PiecePhoto[] }): PiecePhoto[] {
  if (entry.photos && entry.photos.length > 0) return entry.photos;
  if (entry.photo) return [{ uri: entry.photo }];
  return [];
}

export function useJournalDrafts(piece: Piece | null, visible: boolean) {
  const [drafts, setDrafts] = useState<EntryDraft[]>([]);

  useEffect(() => {
    if (visible && piece) {
      setDrafts(piece.timeline.map(entry => ({
        notes: entry.notes ?? '',
        photos: initPhotos(entry),
      })));
    }
  }, [piece?.id, visible]);

  const updateNotes = useCallback((index: number, notes: string) => {
    setDrafts(prev => {
      const next = [...prev];
      next[index] = { ...next[index], notes };
      return next;
    });
  }, []);

  /** Update a single slot in the photos array for the given entry. A freshly
   *  picked image has no assetId yet, so sync-up will upload it. */
  const updatePhotoAt = useCallback((entryIndex: number, photoIndex: number, uri: string) => {
    setDrafts(prev => {
      const next = [...prev];
      const current = next[entryIndex];
      const photos = [...(current.photos ?? [])];
      photos[photoIndex] = { uri };
      next[entryIndex] = { ...current, photos };
      return next;
    });
  }, []);

  const deletePhotoAt = useCallback((entryIndex: number, photoIndex: number) => {
    setDrafts(prev => {
      const next = [...prev];
      const current = next[entryIndex];
      const photos = (current.photos ?? []).filter((_, i) => i !== photoIndex);
      next[entryIndex] = { ...current, photos };
      return next;
    });
  }, []);

  return { drafts, setDrafts, updateNotes, updatePhotoAt, deletePhotoAt };
}
