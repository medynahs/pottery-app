import { EntryDraft, JournalSpread } from '@/src/types/journal';
import type { Piece } from '@/src/types/pieces';
import { useMemo } from 'react';
import { PAGE_ACCENTS, STAGE_LABEL } from '../utils/constants';
import { formatDate, formatDuration } from '../utils/journal';

export function useJournalSpreads(piece: Piece | null, drafts: EntryDraft[], stageLabelById: Record<string, string>, totalMs: number) {
  return useMemo<JournalSpread[]>(() => {
    if (!piece) return [];

    const coverAccent = PAGE_ACCENTS[0];
    const timelineSpreads = piece.timeline.map((entry, index) => {
      const nextTs = piece.timeline[index + 1]?.timestamp;
      const durationMs = nextTs
        ? new Date(nextTs).getTime() - new Date(entry.timestamp).getTime()
        : Date.now() - new Date(entry.timestamp).getTime();
      const stageLabel = stageLabelById[entry.stage] ?? STAGE_LABEL[entry.stage] ?? entry.stage;

      return {
        key: `entry-${index}-${entry.timestamp}`,
        kind: 'entry' as const,
        index,
        stageLabel,
        entry,
        draft: drafts[index] ?? { notes: entry.notes ?? '', photo: entry.photo },
        isLast: index === piece.timeline.length - 1,
        durationLabel: formatDuration(durationMs),
        dateLabel: formatDate(entry.timestamp),
        accent: PAGE_ACCENTS[(index + 1) % PAGE_ACCENTS.length],
        tabLabel: `${index + 1}`,
      };
    });

    return [
      {
        key: `cover-${piece.id}`,
        kind: 'cover',
        title: piece.name,
        subtitle: `${piece.clay} · ${formatDuration(totalMs)} in the making`,
        accent: coverAccent,
        tabLabel: 'Cover',
      },
      ...timelineSpreads,
    ];
  }, [drafts, piece, stageLabelById, totalMs]);
}
