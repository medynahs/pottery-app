import {
  GLAZE_ATMOSPHERE_LABELS,
  GLAZE_CLAY_TYPE_LABELS,
  GLAZE_FINISH_LABELS,
  GLAZE_SOURCE_LABELS,
  GLAZE_STATUS_EMOJI,
  GLAZE_STATUS_LABELS,
  GLAZE_ATMOSPHERE_OPTIONS,
  GLAZE_FINISH_OPTIONS,
  GLAZE_SOURCE_OPTIONS,
  type GlazeAtmosphere,
  type GlazeClayType,
  type GlazeFinish,
  type GlazeLibraryItem,
  type GlazeSource,
  type GlazeStatus,
} from '@/src/screens/glazes/types';
import { normalizeCone } from '@/src/screens/library/discover/types';
import { formatDateShort, parseIsoDate } from '@/src/utils/dates';
import { filterGlazesByCollection } from './collections';
import { collapseToLatestGlazeVersions, formatGlazeDisplayName } from '@/src/screens/glazes/glazeVersionUtils';

export { formatGlazeDisplayName };

export type GlazeStatusFilter = 'all' | GlazeStatus;
export type GlazeClayFilter = 'all' | GlazeClayType;
export type GlazeFinishFilter = 'all' | GlazeFinish;
export type GlazeAtmosphereFilter = 'all' | GlazeAtmosphere;
export type GlazeSourceFilter = 'all' | GlazeSource;

export type GlazeFilters = {
  status: GlazeStatusFilter;
  clay: GlazeClayFilter;
  finish: GlazeFinishFilter;
  atmosphere: GlazeAtmosphereFilter;
  source: GlazeSourceFilter;
  collection: string;
  productionOnly: boolean;
  matchesMyCone: boolean;
};

export const DEFAULT_GLAZE_FILTERS: GlazeFilters = {
  status: 'all',
  clay: 'all',
  finish: 'all',
  atmosphere: 'all',
  source: 'all',
  collection: 'all',
  productionOnly: false,
  matchesMyCone: false,
};

export const GLAZE_STATUS_FILTER_OPTIONS: Array<{ key: GlazeStatusFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'works_great', label: `${GLAZE_STATUS_EMOJI.works_great} Works Great` },
  { key: 'experimental', label: `${GLAZE_STATUS_EMOJI.experimental} Experimental` },
  { key: 'failed', label: `${GLAZE_STATUS_EMOJI.failed} Failed` },
];

export const GLAZE_CLAY_FILTER_OPTIONS: Array<{ key: GlazeClayFilter; label: string }> = [
  { key: 'all', label: 'All clay' },
  { key: 'stoneware', label: GLAZE_CLAY_TYPE_LABELS.stoneware },
  { key: 'earthenware', label: GLAZE_CLAY_TYPE_LABELS.earthenware },
  { key: 'porcelain', label: GLAZE_CLAY_TYPE_LABELS.porcelain },
];

export const GLAZE_FINISH_FILTER_OPTIONS: Array<{ key: GlazeFinishFilter; label: string }> = [
  { key: 'all', label: 'All finishes' },
  ...GLAZE_FINISH_OPTIONS.map((finish) => ({
    key: finish as GlazeFinishFilter,
    label: GLAZE_FINISH_LABELS[finish],
  })),
];

export const GLAZE_ATMOSPHERE_FILTER_OPTIONS: Array<{ key: GlazeAtmosphereFilter; label: string }> = [
  { key: 'all', label: 'Any atmosphere' },
  ...GLAZE_ATMOSPHERE_OPTIONS.map((atmosphere) => ({
    key: atmosphere as GlazeAtmosphereFilter,
    label: GLAZE_ATMOSPHERE_LABELS[atmosphere],
  })),
];

export const GLAZE_SOURCE_FILTER_OPTIONS: Array<{ key: GlazeSourceFilter; label: string }> = [
  { key: 'all', label: 'All sources' },
  ...GLAZE_SOURCE_OPTIONS.map((source) => ({
    key: source as GlazeSourceFilter,
    label: GLAZE_SOURCE_LABELS[source],
  })),
];

export function glazeSearchHaystack(glaze: GlazeLibraryItem): string {
  const ingredients = (glaze.recipeIngredients ?? [])
    .map((ing) => `${ing.material} ${ing.percentage}`)
    .join(' ');
  return [
    glaze.name,
    glaze.notes ?? '',
    glaze.ingredientsText ?? '',
    ingredients,
    glaze.coneRange ?? '',
    glaze.defaultCone ?? '',
    glaze.batchId ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

export function resolveGlazeStatus(glaze: GlazeLibraryItem): GlazeStatus {
  return glaze.status ?? 'experimental';
}

export function getGlazeDateMixedIso(glaze: GlazeLibraryItem): string {
  return glaze.dateMixed ?? glaze.createdAt.slice(0, 10);
}

export function formatDaysSinceMixed(glaze: GlazeLibraryItem): string {
  const iso = getGlazeDateMixedIso(glaze);
  const mixed = parseIsoDate(iso);
  if (!mixed) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  mixed.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - mixed.getTime()) / 86_400_000);
  if (diffDays <= 0) return 'Mixed today';
  if (diffDays === 1) return 'Mixed yesterday';
  if (diffDays < 30) return `Mixed ${diffDays}d ago`;
  return `Mixed ${formatDateShort(iso)}`;
}

export function buildGlazeCardSubtitle(glaze: GlazeLibraryItem): string {
  const parts: string[] = [];

  if (glaze.bestClayType) {
    parts.push(`Best on ${GLAZE_CLAY_TYPE_LABELS[glaze.bestClayType].toLowerCase()}`);
  }

  if (glaze.bestFiringTempC) {
    parts.push(`at ${glaze.bestFiringTempC}°C`);
  } else if (glaze.defaultCone || glaze.coneRange) {
    parts.push(`at ${glaze.defaultCone || glaze.coneRange}`);
  }

  const finish = GLAZE_FINISH_LABELS[glaze.finish];
  if (parts.length === 0) return finish;
  return `${parts.join(' ')} · ${finish}`;
}

export function buildGlazeCardMetaLine(glaze: GlazeLibraryItem): string {
  const mixedLabel = formatDaysSinceMixed(glaze);
  if (glaze.batchId && mixedLabel) return `${glaze.batchId} · ${mixedLabel}`;
  if (glaze.batchId) return glaze.batchId;
  return mixedLabel;
}

export function filterGlazesList(
  glazes: GlazeLibraryItem[],
  filters: GlazeFilters,
  search: string,
  userConeNorm: string | null,
): GlazeLibraryItem[] {
  let list = filterGlazesByCollection(glazes, filters.collection);

  if (filters.status !== 'all') {
    list = list.filter((glaze) => resolveGlazeStatus(glaze) === filters.status);
  }

  if (filters.clay !== 'all') {
    list = list.filter((glaze) => glaze.bestClayType === filters.clay);
  }

  if (filters.finish !== 'all') {
    list = list.filter((glaze) => glaze.finish === filters.finish);
  }

  if (filters.atmosphere !== 'all') {
    list = list.filter((glaze) => glaze.atmosphere === filters.atmosphere);
  }

  if (filters.source !== 'all') {
    list = list.filter((glaze) => glaze.source === filters.source);
  }

  if (filters.productionOnly) {
    list = list.filter((glaze) => glaze.production);
  }

  if (filters.matchesMyCone && userConeNorm) {
    list = list.filter(
      (glaze) => normalizeCone(glaze.defaultCone || glaze.coneRange) === userConeNorm,
    );
  }

  const query = search.trim().toLowerCase();
  if (query) {
    list = list.filter((glaze) => glazeSearchHaystack(glaze).includes(query));
  }

  list = collapseToLatestGlazeVersions(list);

  return [...list].sort((a, b) => {
    const mixedA = getGlazeDateMixedIso(a);
    const mixedB = getGlazeDateMixedIso(b);
    const mixedDiff = mixedB.localeCompare(mixedA);
    if (mixedDiff !== 0) return mixedDiff;

    return (
      new Date(b.lastTestedAt ?? b.createdAt).getTime()
      - new Date(a.lastTestedAt ?? a.createdAt).getTime()
    );
  });
}

export function glazeStatusLabel(status: GlazeStatus): string {
  return GLAZE_STATUS_LABELS[status];
}

export function countActiveGlazeFilters(filters: GlazeFilters): number {
  let count = 0;
  if (filters.status !== 'all') count += 1;
  if (filters.clay !== 'all') count += 1;
  if (filters.finish !== 'all') count += 1;
  if (filters.atmosphere !== 'all') count += 1;
  if (filters.source !== 'all') count += 1;
  if (filters.collection !== 'all') count += 1;
  if (filters.productionOnly) count += 1;
  if (filters.matchesMyCone) count += 1;
  return count;
}

export function labelForStatusFilter(key: GlazeStatusFilter): string | null {
  if (key === 'all') return null;
  return GLAZE_STATUS_FILTER_OPTIONS.find((o) => o.key === key)?.label ?? null;
}

export function labelForClayFilter(key: GlazeClayFilter): string | null {
  if (key === 'all') return null;
  return GLAZE_CLAY_FILTER_OPTIONS.find((o) => o.key === key)?.label ?? null;
}

export function labelForFinishFilter(key: GlazeFinishFilter): string | null {
  if (key === 'all') return null;
  return GLAZE_FINISH_FILTER_OPTIONS.find((o) => o.key === key)?.label ?? null;
}

export function labelForAtmosphereFilter(key: GlazeAtmosphereFilter): string | null {
  if (key === 'all') return null;
  return GLAZE_ATMOSPHERE_FILTER_OPTIONS.find((o) => o.key === key)?.label ?? null;
}

export function labelForSourceFilter(key: GlazeSourceFilter): string | null {
  if (key === 'all') return null;
  return GLAZE_SOURCE_FILTER_OPTIONS.find((o) => o.key === key)?.label ?? null;
}

export function labelForCollectionFilter(key: string): string | null {
  if (key === 'all') return null;
  if (key === 'favorites') return 'Favorites';
  return key;
}

export function buildActiveGlazeFilterTags(
  filters: GlazeFilters,
  userConeLabel: string | null,
  onPatch: (patch: Partial<GlazeFilters>) => void,
): Array<{ key: string; label: string; onClear: () => void }> {
  const tags: Array<{ key: string; label: string; onClear: () => void }> = [];

  const statusLabel = labelForStatusFilter(filters.status);
  if (statusLabel) {
    tags.push({ key: 'status', label: statusLabel, onClear: () => onPatch({ status: 'all' }) });
  }

  const finishLabel = labelForFinishFilter(filters.finish);
  if (finishLabel) {
    tags.push({ key: 'finish', label: finishLabel, onClear: () => onPatch({ finish: 'all' }) });
  }

  const clayLabel = labelForClayFilter(filters.clay);
  if (clayLabel) {
    tags.push({ key: 'clay', label: clayLabel, onClear: () => onPatch({ clay: 'all' }) });
  }

  const atmosphereLabel = labelForAtmosphereFilter(filters.atmosphere);
  if (atmosphereLabel) {
    tags.push({
      key: 'atmosphere',
      label: atmosphereLabel,
      onClear: () => onPatch({ atmosphere: 'all' }),
    });
  }

  const sourceLabel = labelForSourceFilter(filters.source);
  if (sourceLabel) {
    tags.push({ key: 'source', label: sourceLabel, onClear: () => onPatch({ source: 'all' }) });
  }

  if (filters.productionOnly) {
    tags.push({
      key: 'production',
      label: 'Production',
      onClear: () => onPatch({ productionOnly: false }),
    });
  }

  if (filters.matchesMyCone) {
    tags.push({
      key: 'cone',
      label: userConeLabel ? `My cone (${userConeLabel})` : 'My cone',
      onClear: () => onPatch({ matchesMyCone: false }),
    });
  }

  const collectionLabel = labelForCollectionFilter(filters.collection);
  if (collectionLabel) {
    tags.push({
      key: 'collection',
      label: collectionLabel,
      onClear: () => onPatch({ collection: 'all' }),
    });
  }

  return tags;
}
