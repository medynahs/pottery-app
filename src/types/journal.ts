import { PiecePhoto, TimelineEntry } from "./pieces";

export type EntryDraft = {
  notes: string;
  /** Ordered list of photos, one per polaroid slot. Mirrors the timeline shape
   *  so editing a slot preserves the other slots' assetIds (no orphan/re-upload). */
  photos: PiecePhoto[];
};

export type JournalSpread =
  | {
      key: string;
      kind: 'cover';
      title: string;
      subtitle: string;
      accent: string;
      tabLabel: string;
    }
  | {
      key: string;
      kind: 'entry';
      index: number;
      stageLabel: string;
      entry: TimelineEntry;
      draft: EntryDraft;
      isLast: boolean;
      durationLabel: string;
      dateLabel: string;
      accent: string;
      tabLabel: string;
    };