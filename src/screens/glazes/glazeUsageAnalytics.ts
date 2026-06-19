import { getGlazeRootId, stripGlazeVersionSuffix } from '@/src/screens/glazes/glazeVersionUtils';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import type { Piece } from '@/src/types/pieces';
import type { RankedUsage } from '@/src/utils/computeStudioStats';

type FamilyUsage = {
  label: string;
  pieceCount: number;
  testCount: number;
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

/**
 * Rank glaze families by linked piece firings + logged test tiles (all time).
 * Versions roll up under their root family name.
 */
export function buildGlazeUsageRankings(
  pieces: Piece[],
  glazeTests: GlazeTestTile[],
  glazes: GlazeLibraryItem[],
): RankedUsage[] {
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
    bump(piece.glazeId, 'pieceCount');
  });

  glazeTests.forEach((test) => {
    if (!test.glazeId) return;
    bump(test.glazeId, 'testCount');
  });

  const rows = [...families.values()]
    .map((family) => ({
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
  }));
}

export function formatGlazeUsageHint(
  pieces: Piece[],
  glazeTests: GlazeTestTile[],
  glazes: GlazeLibraryItem[],
): string | null {
  const glazeById = new Map(glazes.map((glaze) => [glaze.id, glaze]));
  let pieceLinks = 0;
  let tests = 0;

  pieces.forEach((piece) => {
    if (!piece.deleted && piece.glazeId && glazeById.has(piece.glazeId)) pieceLinks += 1;
  });
  glazeTests.forEach((test) => {
    if (test.glazeId && glazeById.has(test.glazeId)) tests += 1;
  });

  const total = pieceLinks + tests;
  if (total === 0) return null;

  const parts: string[] = [];
  if (pieceLinks > 0) parts.push(`${pieceLinks} piece${pieceLinks === 1 ? '' : 's'}`);
  if (tests > 0) parts.push(`${tests} test tile${tests === 1 ? '' : 's'}`);
  return parts.join(' · ');
}
