import type { GlazeTestTile } from '@/src/screens/glazes/types';
import type { KilnType } from '@/src/types/kiln';
import { todayDateIso } from '@/src/utils/dates';
import type { TestDraft } from './types';

function parseCommaList(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function kilnTypeFromStudioKiln(type: KilnType): GlazeTestTile['kilnType'] {
  if (type === 'electric' || type === 'gas' || type === 'wood') return type;
  return 'other';
}

/** Normalize draft fields and build a test tile record for the store. */
export function buildGlazeTestFromDraft(
  testDraft: TestDraft,
  opts: { id: string; glazeName: string },
): GlazeTestTile {
  const clayBody = testDraft.clayBody?.trim() ?? '';
  const cone = testDraft.cone?.trim() ?? '';
  const firingDateRaw = testDraft.firingDate?.trim() || todayDateIso();
  const firingDate =
    firingDateRaw.length === 10 ? `${firingDateRaw}T12:00:00.000Z` : firingDateRaw;

  return {
    id: opts.id,
    glazeId: testDraft.glazeId,
    glazeNameSnapshot: opts.glazeName,
    clayBody,
    cone,
    kilnName: testDraft.kilnName?.trim() || undefined,
    kilnType: testDraft.kilnType ?? 'electric',
    applicationMethod: testDraft.applicationMethod ?? 'dip',
    thickness: testDraft.thickness ?? 'medium',
    layeredWith: parseCommaList(testDraft.layeredWith),
    shelfPosition: testDraft.shelfPosition?.trim() || undefined,
    firingDate,
    photoUri: testDraft.photoUri,
    notes: testDraft.notes?.trim() || undefined,
    resultRating: testDraft.resultRating ?? 'interesting',
    defects: testDraft.defects ?? [],
  };
}

export function isValidTestDraft(testDraft: TestDraft): boolean {
  return (
    Boolean(testDraft.glazeId)
    && (testDraft.clayBody?.trim().length ?? 0) > 0
    && (testDraft.cone?.trim().length ?? 0) > 0
  );
}
