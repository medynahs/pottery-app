import { EntryDraft } from '@/src/types/journal';
import type { Piece } from '@/src/types/pieces';
import { useCallback, useEffect, useState } from 'react';

export function useJournalDrafts(piece: Piece | null, visible: boolean) {
  const [drafts, setDrafts] = useState<EntryDraft[]>([]);

  useEffect(() => {
    if (visible && piece) {
      setDrafts(piece.timeline.map(entry => ({ notes: entry.notes ?? '', photo: entry.photo })));
    }
  }, [piece, visible]);

  const updateNotes = useCallback((index: number, notes: string) => {
    setDrafts(prev => {
      const next = [...prev];
      next[index] = { ...next[index], notes };
      return next;
    });
  }, []);

  const updatePhoto = useCallback((index: number, photo: string) => {
    setDrafts(prev => {
      const next = [...prev];
      next[index] = { ...next[index], photo };
      return next;
    });
  }, []);

  return { drafts, setDrafts, updateNotes, updatePhoto };
}
