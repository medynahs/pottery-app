import type { Firing } from '@/src/types/kiln';
import type { Piece } from '@/src/types/pieces';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import { buildGlazeUsageRankings } from '@/src/screens/glazes/glazeUsageAnalytics';
import {
  buildMonthBuckets,
  isWithinPeriod,
  monthKeyOf,
  resolvePeriod,
  type AnalyticsPeriod,
  type AnalyticsPeriodId,
} from './analyticsPeriods';

const FINISHED_STAGES = new Set(['finished', 'glaze-fired']);

export type CostBreakdown = {
  clay: number;
  glaze: number;
  energy: number;
  firing: number;
  labor: number;
  admin: number;
  overhead: number;
  other: number;
};

export type PieceEconomicRow = {
  id: number;
  name: string;
  stage: string;
  status?: string;
  dateLabel: string;
  date: number;
  totalCost: number;
  firingFee: number;
  listPrice: number | null;
  margin: number | null;
  isSold: boolean;
  isLost: boolean;
};

export type MonthlyTrendPoint = {
  key: string;
  label: string;
  productionCost: number;
  firingCost: number;
  piecesFinished: number;
  piecesFired: number;
};

export type RankedUsage = { label: string; count: number; pct: number };

export type StageDuration = { from: string; to: string; medianDays: number; sample: number };

export type StudioStats = {
  period: { id: AnalyticsPeriodId; label: string };
  summary: {
    piecesCreated: number;
    piecesFinished: number;
    piecesInCemetery: number;
    survivalRate: number | null;
    workHours: number;
    soldCount: number;
  };
  costs: {
    productionTotal: number;
    breakdown: CostBreakdown;
    avgPerPiece: number | null;
    costPerWorkHour: number | null;
    firingTotal: number;
    combinedTotal: number;
  };
  firings: {
    count: number;
    bisqueCount: number;
    glazeCount: number;
    piecesFired: number;
    uniquePiecesFired: number;
    totalCost: number;
    avgCostPerFiring: number | null;
    avgCostPerPiece: number | null;
    avgPiecesPerFiring: number | null;
    successRate: number | null;
    piecesLost: number;
    recent: Firing[];
  };
  revenue: {
    soldRevenue: number;
    soldCost: number;
    realizedMargin: number;
    avgSalePrice: number | null;
    potentialRevenue: number;
  };
  economics: PieceEconomicRow[];
  monthlyTrend: MonthlyTrendPoint[];
  materials: {
    clayBodies: RankedUsage[];
    formingMethods: RankedUsage[];
    glazes: RankedUsage[];
  };
  process: StageDuration[];
};

function num(v: number | undefined | null): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

/** Latest timeline timestamp for one of the given stages, else null. */
function stageTimestamp(piece: Piece, stages: Set<string>): string | null {
  for (let i = piece.timeline.length - 1; i >= 0; i--) {
    const entry = piece.timeline[i];
    if (stages.has(entry.stage.trim().toLowerCase())) return entry.timestamp;
  }
  return null;
}

/** The date that best represents "when this piece mattered" for period filtering. */
function pieceEffectiveDate(piece: Piece): string {
  const finishedAt = stageTimestamp(piece, FINISHED_STAGES);
  return finishedAt ?? piece.updatedAt ?? piece.createdAt;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function rankUsage(counts: Map<string, number>, total: number): RankedUsage[] {
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, pct: total > 0 ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

function firingDate(firing: Firing): string {
  return firing.completedAt ?? firing.createdAt;
}

function firingCostPerPiece(firing: Firing): number {
  if (typeof firing.estimatedCostPerPiece === 'number') return firing.estimatedCostPerPiece;
  const total = num(firing.estimatedTotalCost);
  return firing.pieceIds.length > 0 ? total / firing.pieceIds.length : 0;
}

function firingSurvival(firing: Firing): { survived: number; lost: number } {
  if (typeof firing.survivedCount === 'number' || typeof firing.lostCount === 'number') {
    return { survived: num(firing.survivedCount), lost: num(firing.lostCount) };
  }
  if (firing.pieceReceipts && firing.pieceReceipts.length > 0) {
    const lost = firing.pieceReceipts.filter((r) => !r.survived).length;
    return { survived: firing.pieceReceipts.length - lost, lost };
  }
  // Fall back to firing-level result.
  const count = firing.pieceIds.length;
  if (firing.result === 'failure') return { survived: 0, lost: count };
  return { survived: count, lost: 0 };
}

const STAGE_TRANSITIONS: { from: string; to: string }[] = [
  { from: 'forming', to: 'leather-hard' },
  { from: 'leather-hard', to: 'trimming' },
  { from: 'bone-dry', to: 'bisque' },
  { from: 'glazing', to: 'glaze-fired' },
];

export type ComputeStudioStatsArgs = {
  pieces: Piece[];
  firings: Firing[];
  glazeTests?: GlazeTestTile[];
  glazes?: GlazeLibraryItem[];
  periodId: AnalyticsPeriodId;
  now?: Date;
};

export function computeStudioStats({
  pieces,
  firings,
  glazeTests = [],
  glazes = [],
  periodId,
  now = new Date(),
}: ComputeStudioStatsArgs): StudioStats {
  const period: AnalyticsPeriod = resolvePeriod(periodId, now);

  // ── Pieces scoped to the period (by their effective date) ──────────
  const piecesInPeriod = pieces.filter((p) => isWithinPeriod(pieceEffectiveDate(p), period));

  const piecesCreated = pieces.filter((p) => isWithinPeriod(p.createdAt, period)).length;
  const finishedPieces = piecesInPeriod.filter((p) => FINISHED_STAGES.has(p.stage.trim().toLowerCase()));
  const cemeteryPieces = piecesInPeriod.filter((p) => p.stage.trim().toLowerCase() === 'cemetery');

  const survivalDenom = finishedPieces.length + cemeteryPieces.length;
  const survivalRate = survivalDenom > 0 ? (finishedPieces.length / survivalDenom) * 100 : null;

  const workHours = piecesInPeriod.reduce((sum, p) => sum + num(p.workHours), 0);
  const soldPieces = piecesInPeriod.filter((p) => p.status === 'sold');

  // ── Costs (from pieces that have a costed total in the period) ─────
  const costedPieces = piecesInPeriod.filter((p) => num(p.totalCost) > 0);
  const breakdown: CostBreakdown = {
    clay: 0, glaze: 0, energy: 0, firing: 0, labor: 0, admin: 0, overhead: 0, other: 0,
  };
  let productionTotal = 0;
  for (const p of costedPieces) {
    breakdown.clay += num(p.costClay) || num(p.costClayOverride);
    breakdown.glaze += num(p.costGlaze) || num(p.costGlazeOverride);
    breakdown.energy += num(p.costEnergy) || num(p.costEnergyOverride);
    breakdown.firing += num(p.firingFee);
    breakdown.labor += num(p.laborCost);
    breakdown.admin += num(p.adminCost);
    breakdown.overhead += num(p.overheadCost);
    breakdown.other += num(p.costOther);
    productionTotal += num(p.totalCost);
  }
  const avgPerPiece = costedPieces.length > 0 ? productionTotal / costedPieces.length : null;
  const costPerWorkHour = workHours > 0 ? productionTotal / workHours : null;

  // ── Firings (completed, in period) ─────────────────────────────────
  const completedFirings = firings.filter(
    (f) => f.state === 'completed' && isWithinPeriod(firingDate(f), period),
  );
  const firingTotal = completedFirings.reduce((sum, f) => sum + num(f.estimatedTotalCost), 0);
  const piecesFired = completedFirings.reduce((sum, f) => sum + f.pieceIds.length, 0);
  const uniquePieceIds = new Set<number>();
  completedFirings.forEach((f) => f.pieceIds.forEach((id) => uniquePieceIds.add(id)));

  let survived = 0;
  let lost = 0;
  completedFirings.forEach((f) => {
    const s = firingSurvival(f);
    survived += s.survived;
    lost += s.lost;
  });
  const survivalTotal = survived + lost;

  const bisqueCount = completedFirings.filter((f) => f.type === 'bisque').length;
  const glazeCount = completedFirings.filter((f) => f.type === 'glaze').length;

  const recent = [...completedFirings]
    .sort((a, b) => new Date(firingDate(b)).getTime() - new Date(firingDate(a)).getTime())
    .slice(0, 10);

  // ── Revenue (sold pieces in period) ────────────────────────────────
  const soldRevenue = soldPieces.reduce(
    (sum, p) => sum + (num(p.retailPriceTarget) || num(p.suggestedPrice)),
    0,
  );
  const soldCost = soldPieces.reduce((sum, p) => sum + num(p.totalCost), 0);
  const potentialRevenue = finishedPieces
    .filter((p) => p.status !== 'sold')
    .reduce((sum, p) => sum + (num(p.retailPriceTarget) || num(p.suggestedPrice)), 0);

  // ── Per-piece economics ────────────────────────────────────────────
  const economics: PieceEconomicRow[] = piecesInPeriod
    .filter((p) => num(p.totalCost) > 0 || p.status === 'sold' || FINISHED_STAGES.has(p.stage.trim().toLowerCase()))
    .map((p) => {
      const totalCost = num(p.totalCost);
      const listPrice = num(p.retailPriceTarget) || num(p.suggestedPrice) || null;
      const isSold = p.status === 'sold';
      const dateIso = pieceEffectiveDate(p);
      return {
        id: p.id,
        name: p.name,
        stage: p.stage,
        status: p.status,
        date: new Date(dateIso).getTime() || 0,
        dateLabel: formatShortDate(dateIso),
        totalCost,
        firingFee: num(p.firingFee),
        listPrice,
        margin: isSold && listPrice != null ? listPrice - totalCost : null,
        isSold,
        isLost: p.stage.trim().toLowerCase() === 'cemetery',
      };
    })
    .sort((a, b) => b.totalCost - a.totalCost);

  // ── Monthly trend (rolling 6 months, independent of period) ────────
  const buckets = buildMonthBuckets(6, now);
  const trendMap = new Map<string, MonthlyTrendPoint>();
  buckets.forEach((b) =>
    trendMap.set(b.key, {
      key: b.key,
      label: b.label,
      productionCost: 0,
      firingCost: 0,
      piecesFinished: 0,
      piecesFired: 0,
    }),
  );
  pieces.forEach((p) => {
    const key = monthKeyOf(pieceEffectiveDate(p));
    const point = key ? trendMap.get(key) : undefined;
    if (!point) return;
    point.productionCost += num(p.totalCost);
    if (FINISHED_STAGES.has(p.stage.trim().toLowerCase())) point.piecesFinished += 1;
  });
  firings.forEach((f) => {
    if (f.state !== 'completed') return;
    const key = monthKeyOf(firingDate(f));
    const point = key ? trendMap.get(key) : undefined;
    if (!point) return;
    point.firingCost += num(f.estimatedTotalCost);
    point.piecesFired += f.pieceIds.length;
  });
  const monthlyTrend = buckets.map((b) => trendMap.get(b.key)!);

  // ── Materials usage ────────────────────────────────────────────────
  const activePieces = pieces.filter((p) => p.stage.trim().toLowerCase() !== 'cemetery');
  const clayCounts = new Map<string, number>();
  const formingCounts = new Map<string, number>();
  activePieces.forEach((p) => {
    const clay = p.clay?.trim() || 'Unspecified';
    clayCounts.set(clay, (clayCounts.get(clay) ?? 0) + 1);
    const method = p.formingMethod?.trim() || 'Unspecified';
    formingCounts.set(method, (formingCounts.get(method) ?? 0) + 1);
  });
  const glazeCounts = new Map<string, number>();
  glazeTests.forEach((t) => {
    const name = t.glazeNameSnapshot?.trim() || 'Unknown';
    glazeCounts.set(name, (glazeCounts.get(name) ?? 0) + 1);
  });
  const glazeUsage = buildGlazeUsageRankings(pieces, glazeTests, glazes);

  // ── Process (median days in stage) ─────────────────────────────────
  const process: StageDuration[] = STAGE_TRANSITIONS.map(({ from, to }) => {
    const durations: number[] = [];
    pieces.forEach((p) => {
      const fromEntry = p.timeline.find((e) => e.stage.trim().toLowerCase() === from);
      const toEntry = p.timeline.find((e) => e.stage.trim().toLowerCase() === to);
      if (!fromEntry || !toEntry) return;
      const days =
        (new Date(toEntry.timestamp).getTime() - new Date(fromEntry.timestamp).getTime()) /
        (1000 * 60 * 60 * 24);
      if (Number.isFinite(days) && days >= 0) durations.push(days);
    });
    return { from, to, medianDays: median(durations), sample: durations.length };
  }).filter((d) => d.sample > 0);

  return {
    period: { id: period.id, label: period.label },
    summary: {
      piecesCreated,
      piecesFinished: finishedPieces.length,
      piecesInCemetery: cemeteryPieces.length,
      survivalRate,
      workHours,
      soldCount: soldPieces.length,
    },
    costs: {
      productionTotal,
      breakdown,
      avgPerPiece,
      costPerWorkHour,
      firingTotal,
      combinedTotal: productionTotal + firingTotal,
    },
    firings: {
      count: completedFirings.length,
      bisqueCount,
      glazeCount,
      piecesFired,
      uniquePiecesFired: uniquePieceIds.size,
      totalCost: firingTotal,
      avgCostPerFiring: completedFirings.length > 0 ? firingTotal / completedFirings.length : null,
      avgCostPerPiece: piecesFired > 0 ? firingTotal / piecesFired : null,
      avgPiecesPerFiring: completedFirings.length > 0 ? piecesFired / completedFirings.length : null,
      successRate: survivalTotal > 0 ? (survived / survivalTotal) * 100 : null,
      piecesLost: lost,
      recent,
    },
    revenue: {
      soldRevenue,
      soldCost,
      realizedMargin: soldRevenue - soldCost,
      avgSalePrice: soldPieces.length > 0 ? soldRevenue / soldPieces.length : null,
      potentialRevenue,
    },
    economics,
    monthlyTrend,
    materials: {
      clayBodies: rankUsage(clayCounts, activePieces.length),
      formingMethods: rankUsage(formingCounts, activePieces.length),
      glazes: glazeUsage.length > 0 ? glazeUsage : rankUsage(glazeCounts, glazeTests.length),
    },
    process,
  };
}

function formatShortDate(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Keep the firing cost-per-piece helper exported for reuse in the UI.
export { firingCostPerPiece };
