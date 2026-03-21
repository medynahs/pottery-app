import type { Piece } from '../pieces/types';
import type { Firing, FiringLocation, FiringType, Kiln } from './types';

const DEFAULT_QUEUE_DELAY_DAYS: Record<FiringLocation, number> = {
  studio: 21,
  'external-kiln': 5,
  home: 0,
};

const DEFAULT_FIRING_HOURS: Record<'bisque' | 'glaze', number> = {
  bisque: 14,
  glaze: 11,
};

const DEFAULT_COOLING_HOURS: Record<'bisque' | 'glaze', number> = {
  bisque: 20,
  glaze: 16,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type AutoFiringStatus = 'waiting' | 'firing' | 'cooling' | 'ready' | 'completed';

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(input: string) {
  const [year, month, day] = input.split('-').map((value) => Number(value));
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function normalizeCoreType(type: FiringType): 'bisque' | 'glaze' {
  return type === 'glaze' ? 'glaze' : 'bisque';
}

function getDefaultCycleDurationDays(type: FiringType) {
  const normalizedType = normalizeCoreType(type);
  return (DEFAULT_FIRING_HOURS[normalizedType] + DEFAULT_COOLING_HOURS[normalizedType]) / 24;
}

function getQueueDelayDays({ kiln, location }: { kiln?: Kiln; location: FiringLocation }) {
  if (location === 'studio') {
    return kiln?.queueDelayDays ?? kiln?.runsEveryDays ?? kiln?.studioDelayDays ?? DEFAULT_QUEUE_DELAY_DAYS.studio;
  }

  return DEFAULT_QUEUE_DELAY_DAYS[location];
}

function getCycleDurationDays({ kiln, type }: { kiln?: Kiln; type: FiringType }) {
  return kiln?.cycleDurationDays ?? getDefaultCycleDurationDays(type);
}

function getPickupDelayDays(kiln?: Kiln) {
  return kiln?.pickupDelayDays ?? 0;
}

function getRunsEveryDays(kiln?: Kiln) {
  return kiln?.runsEveryDays;
}

export function estimateReadyDateIso({
  type,
  location,
  submissionDate,
  kiln,
}: {
  type: FiringType;
  location: FiringLocation;
  submissionDate: string;
  kiln?: Kiln;
}) {
  const readyDate = parseIsoDate(submissionDate);
  const queueDelayDays = getQueueDelayDays({ kiln, location });
  const cycleDurationDays = getCycleDurationDays({ kiln, type });
  const pickupDelayDays = getPickupDelayDays(kiln);
  const totalDays = queueDelayDays + cycleDurationDays + pickupDelayDays;
  readyDate.setTime(readyDate.getTime() + totalDays * MS_PER_DAY);
  return readyDate.toISOString();
}

export function estimateFiringCost({
  kiln,
  pieces,
}: {
  kiln?: Kiln;
  pieces: Piece[];
}) {
  if (!kiln) {
    return { totalCost: null, costPerPiece: null };
  }

  const model = kiln.pricingModel ?? 'per-kiln';
  const baseRate = kiln.pricingBaseRate ?? (model === 'per-kiln' ? 45 : model === 'per-shelf' ? 18 : 2.2);
  const pieceCount = Math.max(0, pieces.length);

  let totalCost = 0;

  if (model === 'per-kiln') {
    totalCost = baseRate;
  }

  if (model === 'per-shelf') {
    const shelvesNeeded = Math.max(1, Math.ceil(pieceCount / Math.max(1, kiln.shelves || 1)));
    totalCost = shelvesNeeded * baseRate;
  }

  if (model === 'per-volume') {
    const totalVolumeCm3 = pieces.reduce((acc, piece) => acc + (piece.volumeCm3 ?? 0), 0);
    const liters = totalVolumeCm3 > 0 ? totalVolumeCm3 / 1000 : pieceCount;
    totalCost = liters * baseRate;
  }

  const roundedTotal = Number(totalCost.toFixed(2));
  const costPerPiece = pieceCount > 0 ? Number((roundedTotal / pieceCount).toFixed(2)) : null;

  return { totalCost: roundedTotal, costPerPiece };
}

export function formatReadyDate(input?: string) {
  if (!input) return '—';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getAutoFiringStatus(firing: Firing, kiln?: Kiln) {
  if (firing.state === 'completed' || firing.statusOverride === 'picked-up') {
    return 'completed' as AutoFiringStatus;
  }

  if (firing.statusOverride === 'ready') {
    return 'ready' as AutoFiringStatus;
  }

  if (firing.statusOverride === 'fired') {
    return 'firing' as AutoFiringStatus;
  }

  const submissionDate = firing.submissionDate ?? toIsoDate(new Date(firing.createdAt));
  const location = firing.location ?? 'studio';
  const expectedReadyAt = firing.expectedReadyAt ?? estimateReadyDateIso({
    type: firing.type,
    location,
    submissionDate,
    kiln,
  });

  const normalizedType = normalizeCoreType(firing.type);
  const defaultFiringHours = DEFAULT_FIRING_HOURS[normalizedType];
  const defaultCoolingHours = DEFAULT_COOLING_HOURS[normalizedType];
  const cycleDurationHours = getCycleDurationDays({ kiln, type: firing.type }) * 24;
  const firingRatio = defaultFiringHours / (defaultFiringHours + defaultCoolingHours);
  const firingHours = cycleDurationHours * firingRatio;
  const readyAt = new Date(expectedReadyAt).getTime();
  const pickupDelayMs = getPickupDelayDays(kiln) * MS_PER_DAY;
  const cycleEnd = readyAt - pickupDelayMs;
  const firingStart = cycleEnd - cycleDurationHours * 60 * 60 * 1000;
  const firingEnd = firingStart + firingHours * 60 * 60 * 1000;
  const now = Date.now();

  if (now < firingStart) return 'waiting';
  if (now < firingEnd) return 'firing';
  if (now < cycleEnd) return 'cooling';
  return 'ready';
}

export function getExpectedReadyAt(firing: Firing, kiln?: Kiln) {
  if (firing.expectedReadyAt) return firing.expectedReadyAt;

  const submissionDate = firing.submissionDate ?? toIsoDate(new Date(firing.createdAt));
  const location = firing.location ?? 'studio';

  return estimateReadyDateIso({
    type: firing.type,
    location,
    submissionDate,
    kiln,
  });
}

export function getKilnTimingSummary(kiln?: Kiln) {
  if (!kiln) return [] as Array<{ label: string; value: number }>;

  const summary: Array<{ label: string; value: number }> = [];

  if (kiln.queueDelayDays != null || kiln.studioDelayDays != null) {
    summary.push({ label: 'Queue', value: kiln.queueDelayDays ?? kiln.studioDelayDays ?? 0 });
  }

  if (kiln.cycleDurationDays != null) {
    summary.push({ label: 'Cycle', value: kiln.cycleDurationDays });
  }

  if (kiln.pickupDelayDays != null) {
    summary.push({ label: 'Pickup', value: kiln.pickupDelayDays });
  }

  if (getRunsEveryDays(kiln) != null) {
    summary.push({ label: 'Every', value: getRunsEveryDays(kiln) ?? 0 });
  }

  return summary;
}
