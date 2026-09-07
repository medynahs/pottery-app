import type { Firing, FiringResult, Kiln, KilnPerformanceStats, PieceFireReceipt } from '../../../types/kiln';
import type { GlazeOutcome, Piece } from '../../../types/pieces';
import { FIRING_TARGET_STAGE } from '../constants';
import { buildFiringCostBreakdown } from '../firingEstimations';

export const DEFAULT_KILN_MAX_TEMP_C = 1300;

/** Coerce persisted / API kiln records to safe local shape. */
export function normalizeKiln(kiln: Kiln): Kiln {
  return {
    ...kiln,
    name: kiln.name?.trim() || 'Unnamed kiln',
    type: kiln.type ?? 'electric',
    coneRange: kiln.coneRange ?? '',
    shelves: kiln.shelves ?? 0,
    size: kiln.size ?? '',
    location: kiln.location ?? '',
    notes: kiln.notes ?? '',
    emergencyNotes: kiln.emergencyNotes ?? '',
    maintenanceLogs: kiln.maintenanceLogs ?? [],
    maxTempC: kiln.maxTempC ?? DEFAULT_KILN_MAX_TEMP_C,
  };
}

export function trimOrEmpty(value?: string | null) {
  return (value ?? '').trim();
}

/** Spec-style date: "June 15, 2026" */
export function formatFiringLogDate(input?: string) {
  if (!input) return '-';
  const date = new Date(input.includes('T') ? input : `${input}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getFiringSortTimestamp(firing: Firing) {
  return new Date(
    firing.firedDate ?? firing.completedAt ?? firing.createdAt,
  ).getTime();
}

export function getFiringDisplayDate(firing: Firing) {
  return formatFiringLogDate(firing.firedDate ?? firing.completedAt ?? firing.createdAt);
}

export function getLastFiringForKiln(kilnId: string, firings: Firing[]): Firing | undefined {
  return firings
    .filter((f) => f.kilnId === kilnId && f.state === 'completed')
    .sort((a, b) => getFiringSortTimestamp(b) - getFiringSortTimestamp(a))[0];
}

export function deriveLastFiredAt(kilnId: string, firings: Firing[]): string | undefined {
  const last = getLastFiringForKiln(kilnId, firings);
  if (!last) return undefined;
  if (last.firedDate) return `${last.firedDate}T12:00:00.000Z`;
  return last.completedAt ?? last.createdAt;
}

export function getKilnPerformanceStats(kilnId: string, firings: Firing[]): KilnPerformanceStats {
  const completed = firings.filter((f) => f.kilnId === kilnId && f.state === 'completed');
  const withTemp = completed.filter((f) => f.peakTempC != null);
  const withHold = completed.filter((f) => f.holdTimeMinutes != null);
  const successCount = completed.filter((f) => f.result === 'success').length;

  return {
    totalFirings: completed.length,
    successCount,
    successPct: completed.length > 0 ? Math.round((successCount / completed.length) * 100) : null,
    avgPeakTempC:
      withTemp.length > 0
        ? Math.round(withTemp.reduce((sum, f) => sum + (f.peakTempC ?? 0), 0) / withTemp.length)
        : null,
    avgHoldMinutes:
      withHold.length > 0
        ? Math.round(withHold.reduce((sum, f) => sum + (f.holdTimeMinutes ?? 0), 0) / withHold.length)
        : null,
  };
}

export function formatHoldTime(minutes?: number) {
  if (minutes == null || Number.isNaN(minutes)) return null;
  return `Hold: ${minutes} min`;
}

export function getKilnMaxTempLabel(kiln: Kiln) {
  const temp = kiln.maxTempC ?? DEFAULT_KILN_MAX_TEMP_C;
  return `${temp}°C max`;
}

export function getLastFiredLabel(kiln: Kiln, firings: Firing[]) {
  const at = kiln.lastFiredAt ?? deriveLastFiredAt(kiln.id, firings);
  if (!at) return 'Never fired';
  return `Last fired ${formatFiringLogDate(at)}`;
}

export function getFiringOutcomeEmoji(result?: Firing['result']) {
  if (result === 'success') return '🟢';
  if (result === 'issues' || result === 'failure') return '⚠️';
  return null;
}

export function getGlazeOutcomeForFiringResult(result?: FiringResult): GlazeOutcome | undefined {
  if (result === 'success') return 'success';
  if (result === 'issues') return 'underfired';
  if (result === 'failure') return 'crack';
  return undefined;
}

export function firingResultSurvived(result?: FiringResult) {
  return result === 'success';
}

export function buildFiringEconomics({
  firing,
  kiln,
  pieces,
}: {
  firing: Pick<Firing, 'type' | 'result'>;
  kiln?: Kiln;
  pieces: Piece[];
}) {
  const { totalCost, costPerPiece, lineItems } = buildFiringCostBreakdown({ kiln, pieces });
  const targetStage = FIRING_TARGET_STAGE[firing.type];
  const survived = firingResultSurvived(firing.result);

  const pieceReceipts: PieceFireReceipt[] | undefined =
    lineItems.length > 0
      ? lineItems.map(({ piece, cost }) => ({
          pieceBackendId: piece.backendId ?? String(piece.id),
          pieceName: piece.name,
          stageBeforeFiring: piece.stage,
          stageAfterFiring: targetStage,
          survived,
          firingFee: cost ?? undefined,
          clayBody: piece.clay,
        }))
      : undefined;

  const clayBodiesUsed =
    pieces.length > 0
      ? [...new Set(pieces.map((piece) => piece.clay).filter(Boolean))]
      : undefined;

  return {
    totalCost,
    costPerPiece,
    lineItems,
    pieceReceipts,
    clayBodiesUsed,
  };
}

export function applyGlazeOutcomeToPiece(
  piece: Piece,
  firing: Pick<Firing, 'type' | 'result'>,
  explicitOutcome?: GlazeOutcome,
): Piece {
  if (firing.type !== 'glaze' || !piece.glazeId) return piece;
  const outcome = explicitOutcome ?? getGlazeOutcomeForFiringResult(firing.result);
  if (!outcome || piece.glazeOutcome) return piece;
  return { ...piece, glazeOutcome: outcome, syncDirty: true };
}
