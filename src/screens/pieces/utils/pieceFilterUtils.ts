import { formatGlazeDisplayName } from '@/src/screens/glazes/glazeVersionUtils';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import type { GlazeOutcome, Piece } from '@/src/types/pieces';
import { countPiecePhotos } from '@/src/utils/premiumGate';
import {
  GLAZE_OUTCOME_LABELS,
  GLAZE_OUTCOME_OPTIONS,
  isConditionStatus,
  PIECE_STATUSES,
} from './constants';
import { isPieceForSale } from './pieceListing';

export type GlazeFilterOption = {
  id: string;
  label: string;
  pieceCount: number;
};

export type LabeledFilterOption = {
  key: string;
  label: string;
};

export type SortKey = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'updated';

export type ActiveFilters = {
  clays: string[];
  forms: string[];
  formingMethods: string[];
  glazes: string[];
  statuses: string[];
  firingTypes: string[];
  glazeOutcomes: string[];
  locations: string[];
  bisqueTemps: string[];
  glazeTemps: string[];
  forSaleOnly: boolean;
  noGlazeOnly: boolean;
  batchOnly: boolean;
  hasPhotosOnly: boolean;
  problemOnly: boolean;
  soldOnly: boolean;
};

export const EMPTY_FILTERS: ActiveFilters = {
  clays: [],
  forms: [],
  formingMethods: [],
  glazes: [],
  statuses: [],
  firingTypes: [],
  glazeOutcomes: [],
  locations: [],
  bisqueTemps: [],
  glazeTemps: [],
  forSaleOnly: false,
  noGlazeOnly: false,
  batchOnly: false,
  hasPhotosOnly: false,
  problemOnly: false,
  soldOnly: false,
};

export function countActiveFilters(filters: ActiveFilters): number {
  return (
    filters.clays.length +
    filters.forms.length +
    filters.formingMethods.length +
    filters.glazes.length +
    filters.statuses.length +
    filters.firingTypes.length +
    filters.glazeOutcomes.length +
    filters.locations.length +
    filters.bisqueTemps.length +
    filters.glazeTemps.length +
    (filters.forSaleOnly ? 1 : 0) +
    (filters.noGlazeOnly ? 1 : 0) +
    (filters.batchOnly ? 1 : 0) +
    (filters.hasPhotosOnly ? 1 : 0) +
    (filters.problemOnly ? 1 : 0) +
    (filters.soldOnly ? 1 : 0)
  );
}

function uniqueSorted(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export function buildClayFilterOptions(
  pieces: Piece[],
  clayBodies: Array<{ name: string }>,
): string[] {
  const names: string[] = [];
  for (const body of clayBodies) {
    const name = body.name.trim();
    if (name) names.push(name);
  }
  for (const piece of pieces) {
    const name = piece.clay.trim();
    if (name) names.push(name);
  }
  return uniqueSorted(names);
}

export function buildGlazeFilterOptions(
  glazes: GlazeLibraryItem[],
  pieces: Piece[],
): GlazeFilterOption[] {
  const countById = new Map<string, number>();
  for (const piece of pieces) {
    if (!piece.glazeId) continue;
    countById.set(piece.glazeId, (countById.get(piece.glazeId) ?? 0) + 1);
  }

  return glazes
    .map((glaze) => ({
      id: glaze.id,
      label: formatGlazeDisplayName(glaze),
      pieceCount: countById.get(glaze.id) ?? 0,
    }))
    .sort((a, b) => {
      if (a.pieceCount !== b.pieceCount) return b.pieceCount - a.pieceCount;
      return a.label.localeCompare(b.label);
    });
}

export function buildUsedStringOptions(
  pieces: Piece[],
  pick: (piece: Piece) => string | undefined,
): string[] {
  const values: string[] = [];
  for (const piece of pieces) {
    const value = pick(piece)?.trim();
    if (value) values.push(value);
  }
  return uniqueSorted(values);
}

export function getPieceBisqueTemp(piece: Piece): string | undefined {
  const direct = piece.bisqueTemp?.trim();
  if (direct) return direct;
  for (let index = piece.timeline.length - 1; index >= 0; index -= 1) {
    const value = piece.timeline[index].bisqueTemp?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getPieceGlazeTemp(piece: Piece): string | undefined {
  const direct = piece.glazeTemp?.trim();
  if (direct) return direct;
  for (let index = piece.timeline.length - 1; index >= 0; index -= 1) {
    const value = piece.timeline[index].glazeTemp?.trim();
    if (value) return value;
  }
  return undefined;
}

export function buildBisqueTempFilterOptions(pieces: Piece[]): string[] {
  const values: string[] = [];
  for (const piece of pieces) {
    const temp = getPieceBisqueTemp(piece);
    if (temp) values.push(temp);
  }
  return uniqueSorted(values);
}

export function buildGlazeTempFilterOptions(pieces: Piece[]): string[] {
  const values: string[] = [];
  for (const piece of pieces) {
    const temp = getPieceGlazeTemp(piece);
    if (temp) values.push(temp);
  }
  return uniqueSorted(values);
}

/** Map stored piece status values to canonical filter labels when possible. */
export function buildStatusFilterOptions(pieces: Piece[]): string[] {
  const used = buildUsedStringOptions(pieces, (piece) => piece.status);
  const canonical = PIECE_STATUSES.filter((status) =>
    used.some((value) => value.toLowerCase() === status.toLowerCase()),
  );
  const extras = used.filter(
    (value) => !PIECE_STATUSES.some((status) => status.toLowerCase() === value.toLowerCase()),
  );
  return [...canonical, ...extras];
}

export function buildGlazeOutcomeFilterOptions(pieces: Piece[]): LabeledFilterOption[] {
  const used = new Set<GlazeOutcome>();
  for (const piece of pieces) {
    if (piece.glazeOutcome) used.add(piece.glazeOutcome);
  }
  return GLAZE_OUTCOME_OPTIONS
    .filter((outcome) => used.has(outcome))
    .map((outcome) => ({
      key: outcome,
      label: GLAZE_OUTCOME_LABELS[outcome],
    }));
}

export function pieceMatchesStatusFilter(piece: Piece, statuses: string[]): boolean {
  if (statuses.length === 0) return true;
  const pieceStatus = piece.status?.trim();
  if (!pieceStatus) return false;
  const normalized = pieceStatus.toLowerCase();
  return statuses.some((status) => status.toLowerCase() === normalized);
}

export function pieceHasProblemStatus(piece: Piece): boolean {
  const status = piece.status?.trim();
  return !!status && isConditionStatus(status);
}

export function pieceIsSold(piece: Piece): boolean {
  return piece.status?.trim().toLowerCase() === 'sold';
}

export function pieceMatchesFilters(piece: Piece, filters: ActiveFilters): boolean {
  const clay = piece.clay.trim();

  if (filters.clays.length > 0 && !filters.clays.includes(clay)) return false;
  if (filters.forms.length > 0 && (!piece.form || !filters.forms.includes(piece.form))) return false;
  if (
    filters.formingMethods.length > 0
    && (!piece.formingMethod || !filters.formingMethods.includes(piece.formingMethod))
  ) {
    return false;
  }
  if (
    filters.glazes.length > 0
    && (!piece.glazeId || !filters.glazes.includes(piece.glazeId))
  ) {
    return false;
  }
  if (!pieceMatchesStatusFilter(piece, filters.statuses)) return false;
  if (
    filters.firingTypes.length > 0
    && (!piece.firingType || !filters.firingTypes.includes(piece.firingType))
  ) {
    return false;
  }
  if (
    filters.glazeOutcomes.length > 0
    && (!piece.glazeOutcome || !filters.glazeOutcomes.includes(piece.glazeOutcome))
  ) {
    return false;
  }
  if (
    filters.locations.length > 0
    && (!piece.location?.trim() || !filters.locations.includes(piece.location.trim()))
  ) {
    return false;
  }

  const bisqueTemp = getPieceBisqueTemp(piece);
  if (filters.bisqueTemps.length > 0 && (!bisqueTemp || !filters.bisqueTemps.includes(bisqueTemp))) {
    return false;
  }

  const glazeTemp = getPieceGlazeTemp(piece);
  if (filters.glazeTemps.length > 0 && (!glazeTemp || !filters.glazeTemps.includes(glazeTemp))) {
    return false;
  }

  if (filters.forSaleOnly && !isPieceForSale(piece)) return false;
  if (filters.noGlazeOnly && !!piece.glazeId) return false;
  if (filters.batchOnly && !piece.batchId) return false;
  if (filters.hasPhotosOnly && countPiecePhotos(piece) === 0) return false;
  if (filters.problemOnly && !pieceHasProblemStatus(piece)) return false;
  if (filters.soldOnly && !pieceIsSold(piece)) return false;

  return true;
}

export function filterGlazeOptions(
  options: GlazeFilterOption[],
  query: string,
): GlazeFilterOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return options;
  return options.filter((option) => option.label.toLowerCase().includes(normalized));
}
