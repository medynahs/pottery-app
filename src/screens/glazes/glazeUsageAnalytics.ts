import { getGlazeRootId, stripGlazeVersionSuffix } from '@/src/screens/glazes/glazeVersionUtils';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import type { Piece } from '@/src/types/pieces';
import {
    isWithinPeriod,
    resolvePeriod,
    type AnalyticsPeriod,
    type AnalyticsPeriodId,
} from '@/src/utils/analyticsPeriods';
import type { RankedUsage } from '@/src/utils/computeStudioStats';
import { formatDateShort } from '@/src/utils/dates';

type FamilyUsage = {
  label: string;
  pieceCount: number;
  testCount: number;
};

export type GlazeFamilyDrillDown = {
  label: string;
  familyKey: string;
  pieceCount: number;
  testCount: number;
  pieces: {
    pieceId: number;
    name: string;
    stageLabel: string;
    dateLabel: string;
  }[];
  tests: {
    testId: string;
    glazeId: string;
    glazeVersionLabel: string;
    resultRating: GlazeTestTile['resultRating'];
    dateLabel: string;
  }[];
};

function resolveFamilyLabel(
  glazeId: string,
  glazeById: Map<string, GlazeLibraryItem>,
): string {
  const glaze = glazeById.get(glazeId);
  if (!glaze) return 'Unknown glaze';

  const rootId = getGlazeRootId(glaze);
  const root = glazeById.get(rootId) ?? glaze;
  return stripGlazeVersionSuffix(root.name) || root.name;
}

function pieceGlazeActivityDate(piece: Piece): string {
  return piece.updatedAt ?? piece.createdAt;
}

function testActivityDate(test: GlazeTestTile): string {
  return test.firingDate;
}

const STAGE_LABELS: Record<string, string> = {
  idea: 'Idea',
  forming: 'Forming',
  'leather-hard': 'Leather hard',
  trimming: 'Trimming',
  drying: 'Drying',
  'bone-dry': 'Bone dry',
  bisque: 'Bisque',
  glazing: 'Glazing',
  'glaze-fired': 'Glaze fired',
  finished: 'Finished',
  cemetery: 'Cemetery',
};

/**
 * Rank glaze families by linked piece firings + logged test tiles.
 * Versions roll up under their root family name.
 */
export function buildGlazeUsageRankings(
  pieces: Piece[],
  glazeTests: GlazeTestTile[],
  glazes: GlazeLibraryItem[],
  periodId: AnalyticsPeriodId = 'all-time',
  now: Date = new Date(),
): RankedUsage[] {
  const period: AnalyticsPeriod = resolvePeriod(periodId, now);
  const glazeById = new Map(glazes.map((glaze) => [glaze.id, glaze]));
  const families = new Map<string, FamilyUsage>();

  const bump = (glazeId: string, kind: 'pieceCount' | 'testCount') => {
    const glaze = glazeById.get(glazeId);
    if (!glaze) return;

    const rootId = getGlazeRootId(glaze);
    const label = resolveFamilyLabel(glazeId, glazeById);
    const existing = families.get(rootId) ?? { label, pieceCount: 0, testCount: 0 };
    existing[kind] += 1;
    families.set(rootId, existing);
  };

  pieces.forEach((piece) => {
    if (piece.deleted || !piece.glazeId) return;
    if (!isWithinPeriod(pieceGlazeActivityDate(piece), period)) return;
    bump(piece.glazeId, 'pieceCount');
  });

  glazeTests.forEach((test) => {
    if (!test.glazeId) return;
    if (!isWithinPeriod(testActivityDate(test), period)) return;
    bump(test.glazeId, 'testCount');
  });

  const rows = [...families.entries()]
    .map(([familyKey, family]) => ({
      familyKey,
      label: family.label,
      count: family.pieceCount + family.testCount,
      pieceCount: family.pieceCount,
      testCount: family.testCount,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) return [];

  return rows.map((row) => ({
    label: row.label,
    count: row.count,
    pct: (row.count / total) * 100,
    familyKey: row.familyKey,
    pieceCount: row.pieceCount,
    testCount: row.testCount,
  }));
}

export function buildGlazeFamilyDrillDown(
  familyKey: string,
  pieces: Piece[],
  glazeTests: GlazeTestTile[],
  glazes: GlazeLibraryItem[],
  periodId: AnalyticsPeriodId = 'all-time',
  now: Date = new Date(),
): GlazeFamilyDrillDown {
  const period = resolvePeriod(periodId, now);
  const glazeById = new Map(glazes.map((glaze) => [glaze.id, glaze]));
  const label = resolveFamilyLabel(familyKey, glazeById);

  const pieceRows = pieces
    .filter((piece) => {
      if (piece.deleted || !piece.glazeId) return false;
      const glaze = glazeById.get(piece.glazeId);
      if (!glaze || getGlazeRootId(glaze) !== familyKey) return false;
      return isWithinPeriod(pieceGlazeActivityDate(piece), period);
    })
    .map((piece) => ({
      pieceId: piece.id,
      name: piece.name,
      stageLabel: STAGE_LABELS[piece.stage.trim().toLowerCase()] ?? piece.stage,
      dateLabel: formatDateShort(pieceGlazeActivityDate(piece)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const testRows = glazeTests
    .filter((test) => {
      if (!test.glazeId) return false;
      const glaze = glazeById.get(test.glazeId);
      if (!glaze || getGlazeRootId(glaze) !== familyKey) return false;
      return isWithinPeriod(testActivityDate(test), period);
    })
    .map((test) => {
      const glaze = glazeById.get(test.glazeId);
      const versionLabel = glaze
        ? `${stripGlazeVersionSuffix(glaze.name) || glaze.name} v${glaze.versionNumber ?? 1}`
        : test.glazeNameSnapshot;
      return {
        testId: test.id,
        glazeId: test.glazeId,
        glazeVersionLabel: versionLabel,
        resultRating: test.resultRating,
        dateLabel: formatDateShort(test.firingDate),
      };
    })
    .sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));

  return {
    label,
    familyKey,
    pieceCount: pieceRows.length,
    testCount: testRows.length,
    pieces: pieceRows,
    tests: testRows,
  };
}

export function formatGlazeUsageHint(
  pieces: Piece[],
  glazeTests: GlazeTestTile[],
  glazes: GlazeLibraryItem[],
  periodId: AnalyticsPeriodId = 'all-time',
  now: Date = new Date(),
): string | null {
  const period = resolvePeriod(periodId, now);
  const glazeById = new Map(glazes.map((glaze) => [glaze.id, glaze]));
  let pieceLinks = 0;
  let tests = 0;

  pieces.forEach((piece) => {
    if (piece.deleted || !piece.glazeId || !glazeById.has(piece.glazeId)) return;
    if (!isWithinPeriod(pieceGlazeActivityDate(piece), period)) return;
    pieceLinks += 1;
  });
  glazeTests.forEach((test) => {
    if (!test.glazeId || !glazeById.has(test.glazeId)) return;
    if (!isWithinPeriod(testActivityDate(test), period)) return;
    tests += 1;
  });

  const total = pieceLinks + tests;
  if (total === 0) return null;

  const parts: string[] = [];
  if (pieceLinks > 0) parts.push(`${pieceLinks} piece${pieceLinks === 1 ? '' : 's'}`);
  if (tests > 0) parts.push(`${tests} test tile${tests === 1 ? '' : 's'}`);
  const scope = period.id === 'all-time' ? '' : ` · ${period.label.toLowerCase()}`;
  return `${parts.join(' · ')}${scope} · tap a row for details`;
}
