import { TimelineEntry } from "./pieces";

export type EntryDraft = {
  notes: string;
  /** Ordered list of photo URIs — one per polaroid slot. */
  photos: string[];
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