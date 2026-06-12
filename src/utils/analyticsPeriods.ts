export type AnalyticsPeriodId = 'this-month' | 'last-3-months' | 'ytd' | 'all-time';

export type AnalyticsPeriod = {
  id: AnalyticsPeriodId;
  label: string;
  /** Inclusive start. `null` means unbounded (all-time). */
  start: Date | null;
  /** Exclusive end. */
  end: Date;
};

export const ANALYTICS_PERIOD_OPTIONS: { id: AnalyticsPeriodId; label: string }[] = [
  { id: 'this-month', label: 'This month' },
  { id: 'last-3-months', label: '3 months' },
  { id: 'ytd', label: 'Year' },
  { id: 'all-time', label: 'All time' },
];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Resolve a period id into a concrete date window relative to `now`. */
export function resolvePeriod(id: AnalyticsPeriodId, now: Date = new Date()): AnalyticsPeriod {
  const end = new Date(now.getTime());

  switch (id) {
    case 'this-month':
      return { id, label: 'This month', start: startOfMonth(now), end };
    case 'last-3-months': {
      const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 2, 1));
      return { id, label: 'Last 3 months', start, end };
    }
    case 'ytd':
      return { id, label: 'Year to date', start: new Date(now.getFullYear(), 0, 1), end };
    case 'all-time':
    default:
      return { id: 'all-time', label: 'All time', start: null, end };
  }
}

/** True when an ISO date string falls inside the period window. */
export function isWithinPeriod(iso: string | undefined | null, period: AnalyticsPeriod): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  if (period.start && t < period.start.getTime()) return false;
  return t <= period.end.getTime();
}

export type MonthBucket = {
  /** e.g. "2026-05" */
  key: string;
  /** e.g. "May" */
  label: string;
  start: Date;
  end: Date;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Build a rolling list of the last `count` month buckets, oldest first. */
export function buildMonthBuckets(count: number, now: Date = new Date()): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const month = start.getMonth();
    const key = `${start.getFullYear()}-${String(month + 1).padStart(2, '0')}`;
    buckets.push({ key, label: MONTH_LABELS[month], start, end });
  }
  return buckets;
}

export function monthKeyOf(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
