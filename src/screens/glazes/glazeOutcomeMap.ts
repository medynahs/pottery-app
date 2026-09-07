import { GLAZE_OUTCOME_LABELS } from '@/src/screens/pieces/utils/constants';
import type { GlazeOutcome, Piece } from '@/src/types/pieces';
import type { GlazeDefect, GlazeResultRating, GlazeTestTile } from './types';

/** Studio-facing firing outcomes, shared by pieces, stats, and glaze detail. */
export type StudioGlazeOutcome = GlazeOutcome;

export const STUDIO_GLAZE_OUTCOME_LABELS = GLAZE_OUTCOME_LABELS;

export type MappedTestOutcome = StudioGlazeOutcome | 'interesting' | 'unclassified';

export type UnifiedOutcomeSummary = {
  /** Test tiles + linked pieces with a glaze batch. */
  totalFirings: number;
  success: number;
  crawling: number;
  underfired: number;
  crack: number;
  /** Lab tiles marked interesting, tracked separately. */
  interesting: number;
  /** Bad tests without a mapped defect category. */
  unclassified: number;
};

const DEFECT_TO_OUTCOME: Partial<Record<GlazeDefect, StudioGlazeOutcome>> = {
  crawling: 'crawling',
  crazing: 'crack',
  'color-shift': 'underfired',
  pinholing: 'underfired',
  blistering: 'underfired',
  running: 'underfired',
};

const OUTCOME_PRIORITY: StudioGlazeOutcome[] = ['crawling', 'crack', 'underfired', 'success'];

/** Map a test tile rating + defects to the studio outcome vocabulary. */
export function outcomeFromTestTile(test: GlazeTestTile): MappedTestOutcome | null {
  if (test.resultRating === 'great') return 'success';
  if (test.resultRating === 'interesting') return 'interesting';

  for (const defect of test.defects) {
    const mapped = DEFECT_TO_OUTCOME[defect];
    if (mapped) return mapped;
  }

  if (test.resultRating === 'bad') return 'unclassified';
  return null;
}

/** Preview how a draft test tile will roll up before save. */
export function previewTestTileOutcome(
  resultRating: GlazeResultRating,
  defects: GlazeDefect[],
): MappedTestOutcome | null {
  return outcomeFromTestTile({
    id: 'preview',
    glazeId: '',
    glazeNameSnapshot: '',
    clayBody: '',
    cone: '',
    applicationMethod: 'dip',
    thickness: 'medium',
    layeredWith: [],
    firingDate: '',
    resultRating,
    defects,
  });
}

export function labelForMappedOutcome(outcome: MappedTestOutcome): string {
  if (outcome === 'interesting') return 'Interesting (lab note)';
  if (outcome === 'unclassified') return 'Poor result';
  return STUDIO_GLAZE_OUTCOME_LABELS[outcome];
}

export function outcomeFromPiece(piece: Piece): StudioGlazeOutcome | null {
  return piece.glazeOutcome ?? null;
}

export function summarizeUnifiedOutcomes(
  tests: GlazeTestTile[],
  pieces: Piece[],
): UnifiedOutcomeSummary {
  const summary: UnifiedOutcomeSummary = {
    totalFirings: tests.length,
    success: 0,
    crawling: 0,
    underfired: 0,
    crack: 0,
    interesting: 0,
    unclassified: 0,
  };

  tests.forEach((test) => {
    const mapped = outcomeFromTestTile(test);
    if (mapped === 'interesting') summary.interesting += 1;
    else if (mapped === 'unclassified') summary.unclassified += 1;
    else if (mapped) summary[mapped] += 1;
  });

  pieces.filter((piece) => piece.glazeId).forEach((piece) => {
    summary.totalFirings += 1;
    const outcome = outcomeFromPiece(piece);
    if (outcome) summary[outcome] += 1;
  });

  return summary;
}

export function formatUnifiedOutcomeStatsLine(
  tests: GlazeTestTile[],
  pieces: Piece[] = [],
): string {
  const summary = summarizeUnifiedOutcomes(tests, pieces);
  if (summary.totalFirings === 0) return 'No firings logged yet';

  const parts = [`Used ${summary.totalFirings} time${summary.totalFirings === 1 ? '' : 's'}`];

  if (summary.success > 0) {
    parts.push(`${summary.success} successful`);
  }

  const issueCounts: { label: string; count: number }[] = [
    { label: STUDIO_GLAZE_OUTCOME_LABELS.crawling.toLowerCase(), count: summary.crawling },
    { label: STUDIO_GLAZE_OUTCOME_LABELS.underfired.toLowerCase(), count: summary.underfired },
    { label: STUDIO_GLAZE_OUTCOME_LABELS.crack.toLowerCase(), count: summary.crack },
  ].filter((entry) => entry.count > 0);

  const topIssue = issueCounts.sort((a, b) => b.count - a.count)[0];
  if (topIssue) {
    parts.push(`${topIssue.count} ${topIssue.label}`);
  } else if (summary.unclassified > 0) {
    parts.push(`${summary.unclassified} poor result${summary.unclassified === 1 ? '' : 's'}`);
  }

  return parts.join(' · ');
}

export function computeUnifiedSuccessRate(
  tests: GlazeTestTile[],
  pieces: Piece[],
): number | null {
  const summary = summarizeUnifiedOutcomes(tests, pieces);
  const scored =
    summary.success
    + summary.crawling
    + summary.underfired
    + summary.crack
    + summary.unclassified;
  if (scored === 0) return null;
  return Math.round((summary.success / scored) * 100);
}

export function topUnifiedOutcomeIssue(
  summary: UnifiedOutcomeSummary,
): StudioGlazeOutcome | null {
  let top: StudioGlazeOutcome | null = null;
  let topCount = 0;
  OUTCOME_PRIORITY.forEach((outcome) => {
    if (outcome === 'success') return;
    const count = summary[outcome];
    if (count > topCount) {
      top = outcome;
      topCount = count;
    }
  });
  return top;
}
