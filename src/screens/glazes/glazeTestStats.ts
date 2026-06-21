import {
  GLAZE_APPLICATION_METHOD_LABELS,
  type GlazeTestTile,
} from './types';
import {
  formatUnifiedOutcomeStatsLine,
  summarizeUnifiedOutcomes,
  topUnifiedOutcomeIssue,
  STUDIO_GLAZE_OUTCOME_LABELS,
} from './glazeOutcomeMap';
import type { Piece } from '@/src/types/pieces';

function findTopValue(values: string[]): string | undefined {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function summarizeGlazeTests(tests: GlazeTestTile[]) {
  const unified = summarizeUnifiedOutcomes(tests, []);
  const greatCount = tests.filter((test) => test.resultRating === 'great').length;
  const interestingCount = tests.filter((test) => test.resultRating === 'interesting').length;
  const badCount = tests.filter((test) => test.resultRating === 'bad').length;
  const layeredCount = tests.filter((test) => test.layeredWith.length > 0).length;

  return {
    total: tests.length,
    greatCount,
    interestingCount,
    badCount,
    layeredCount,
    successRate: tests.length > 0 ? Math.round((greatCount / tests.length) * 100) : 0,
    favoriteClayBody: findTopValue(tests.map((test) => test.clayBody)),
    favoriteMethod: findTopValue(tests.map((test) => test.applicationMethod)),
    favoriteCone: findTopValue(tests.map((test) => test.cone)),
    unified,
    topIssue: topUnifiedOutcomeIssue(unified),
    topIssueCount: (() => {
      const issue = topUnifiedOutcomeIssue(unified);
      return issue ? unified[issue] : 0;
    })(),
  };
}

/** e.g. "Used 8 times · 7 successful · 1 crawling", tests + linked pieces */
export function formatGlazeUsageStatsLine(tests: GlazeTestTile[], linkedPieces: Piece[] = []): string {
  return formatUnifiedOutcomeStatsLine(tests, linkedPieces);
}

/** @deprecated Prefer `formatGlazeUsageStatsLine` when linked pieces are available. */
export function formatGlazeTestStatsLine(tests: GlazeTestTile[]): string {
  return formatGlazeUsageStatsLine(tests);
}

export function buildGlazeTestInsight(
  tests: GlazeTestTile[],
  linkedPieces: Piece[] = [],
): string | null {
  const allTests = tests;
  const summary = summarizeGlazeTests(allTests);
  const unified = summarizeUnifiedOutcomes(allTests, linkedPieces);

  if (summary.greatCount >= 2 && summary.favoriteClayBody) {
    return `Strongest so far on ${summary.favoriteClayBody}.`;
  }

  if (summary.favoriteMethod && allTests.length >= 2) {
    return `Best results usually come from ${GLAZE_APPLICATION_METHOD_LABELS[summary.favoriteMethod as GlazeTestTile['applicationMethod']].toLowerCase()} application.`;
  }

  const topIssue = topUnifiedOutcomeIssue(unified);
  if (topIssue && unified[topIssue] > 0) {
    return `Main studio risk: ${STUDIO_GLAZE_OUTCOME_LABELS[topIssue].toLowerCase()}.`;
  }

  if (summary.favoriteCone) {
    return `Most testing with this glaze lands at ${summary.favoriteCone}.`;
  }

  return null;
}
