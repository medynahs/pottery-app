import { generateGlazeBatchId } from '@/src/screens/glazes/batchId';
import { glazeToEditDraft } from '@/src/screens/library/atlas/helpers';
import type { GlazeDraft } from '@/src/screens/library/atlas/types';
import { computeUnifiedSuccessRate, formatUnifiedOutcomeStatsLine } from '@/src/screens/glazes/glazeOutcomeMap';
import type { GlazeIngredient, GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import type { Piece } from '@/src/types/pieces';
import { todayDateIso } from '@/src/utils/dates';

/** Remove a trailing " v3" suffix from a glaze name. */
export function stripGlazeVersionSuffix(name: string): string {
  return name.replace(/\s+v\d+\s*$/i, '').trim();
}

export function getGlazeRootId(glaze: GlazeLibraryItem): string {
  return glaze.rootGlazeId ?? glaze.id;
}

export function formatGlazeDisplayName(
  glaze: Pick<GlazeLibraryItem, 'name' | 'versionNumber'>,
  options?: { alwaysShowVersion?: boolean },
): string {
  const base = stripGlazeVersionSuffix(glaze.name);
  const version = glaze.versionNumber ?? 1;
  if (!options?.alwaysShowVersion && version <= 1) return base;
  return `${base} v${version}`;
}

export function getGlazeVersions(
  glazes: GlazeLibraryItem[],
  rootId: string,
): GlazeLibraryItem[] {
  return glazes
    .filter((glaze) => getGlazeRootId(glaze) === rootId)
    .sort((a, b) => {
      const versionDiff = (a.versionNumber ?? 1) - (b.versionNumber ?? 1);
      if (versionDiff !== 0) return versionDiff;
      const mixedA = a.dateMixed ?? a.createdAt.slice(0, 10);
      const mixedB = b.dateMixed ?? b.createdAt.slice(0, 10);
      return mixedA.localeCompare(mixedB);
    });
}

/** Keep only the newest version per glaze family for the library grid. */
export function collapseToLatestGlazeVersions(glazes: GlazeLibraryItem[]): GlazeLibraryItem[] {
  const byRoot = new Map<string, GlazeLibraryItem>();

  glazes.forEach((glaze) => {
    const rootId = getGlazeRootId(glaze);
    const existing = byRoot.get(rootId);
    if (!existing) {
      byRoot.set(rootId, glaze);
      return;
    }

    const version = glaze.versionNumber ?? 1;
    const existingVersion = existing.versionNumber ?? 1;
    if (version > existingVersion) {
      byRoot.set(rootId, glaze);
      return;
    }
    if (version < existingVersion) return;

    const mixedA = glaze.dateMixed ?? glaze.createdAt;
    const mixedB = existing.dateMixed ?? existing.createdAt;
    if (mixedA.localeCompare(mixedB) > 0) {
      byRoot.set(rootId, glaze);
    }
  });

  return Array.from(byRoot.values());
}

export function computeNextVersionNumber(
  glazes: GlazeLibraryItem[],
  parent: GlazeLibraryItem,
): number {
  const rootId = getGlazeRootId(parent);
  const family = getGlazeVersions(glazes, rootId);
  const maxVersion = family.reduce(
    (max, glaze) => Math.max(max, glaze.versionNumber ?? 1),
    0,
  );
  return maxVersion + 1;
}

/** Pre-fill a create form when remixing from a parent batch. */
export function buildNewVersionDraft(parent: GlazeLibraryItem): GlazeDraft {
  const draft = glazeToEditDraft(parent);
  draft.name = stripGlazeVersionSuffix(parent.name);
  draft.dateMixed = todayDateIso();
  draft.status = 'experimental';
  draft.bucketPhotoUri = undefined;
  draft.firstTilePhotoUri = undefined;
  draft.firstPiecePhotoUri = undefined;
  return draft;
}

export function formatVersionStatsLine(
  glazeId: string,
  tests: GlazeTestTile[],
  pieces: Piece[],
): string {
  const versionTests = tests.filter((test) => test.glazeId === glazeId);
  const versionPieces = pieces.filter((piece) => piece.glazeId === glazeId);
  return formatUnifiedOutcomeStatsLine(versionTests, versionPieces);
}

export function computeVersionSuccessRate(
  glazeId: string,
  tests: GlazeTestTile[],
  pieces: Piece[],
): number | null {
  const versionTests = tests.filter((test) => test.glazeId === glazeId);
  const versionPieces = pieces.filter((piece) => piece.glazeId === glazeId);
  return computeUnifiedSuccessRate(versionTests, versionPieces);
}

export type IngredientCompareRow = {
  material: string;
  leftPct: string | null;
  rightPct: string | null;
  changed: boolean;
};

function ingredientMap(ingredients: GlazeIngredient[]): Map<string, string> {
  const map = new Map<string, string>();
  ingredients
    .filter((row) => row.material.trim() && row.percentage.trim())
    .forEach((row) => {
      map.set(row.material.trim().toLowerCase(), row.percentage.trim());
    });
  return map;
}

export function compareGlazeIngredients(
  left: GlazeIngredient[],
  right: GlazeIngredient[],
): IngredientCompareRow[] {
  const leftMap = ingredientMap(left);
  const rightMap = ingredientMap(right);
  const materials = new Set([...leftMap.keys(), ...rightMap.keys()]);

  return Array.from(materials)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const leftPct = leftMap.get(key) ?? null;
      const rightPct = rightMap.get(key) ?? null;
      const material =
        left.find((row) => row.material.trim().toLowerCase() === key)?.material.trim()
        ?? right.find((row) => row.material.trim().toLowerCase() === key)?.material.trim()
        ?? key;
      return {
        material,
        leftPct,
        rightPct,
        changed: leftPct !== rightPct,
      };
    });
}

export function buildVersionBatchId(
  name: string,
  dateMixed: string,
  versionNumber: number,
): string {
  return generateGlazeBatchId(stripGlazeVersionSuffix(name), dateMixed, versionNumber);
}
