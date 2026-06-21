/** European-style dates across the app (day-first). */
export const APP_DATE_LOCALE = 'en-GB';

export function todayIso(): string {
  const now = new Date();
  return isoFromParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** @deprecated Use `todayIso`, kept for compatibility with older call sites. */
export function todayDateIso(): string {
  return todayIso();
}

export function isoFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Display: 19 Jun 2026 */
export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  const date = parseIsoDate(iso) ?? new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(APP_DATE_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

/** Display: 19/06/2026 */
export function formatDateNumeric(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return '';
  return date.toLocaleDateString(APP_DATE_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Parse DD/MM/YYYY → YYYY-MM-DD. Returns null if invalid. */
export function parseDisplayDateToIso(display: string): string | null {
  const trimmed = display.trim();
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }
  return isoFromParts(year, month, day);
}

/** Short label for cards: 19 Jun */
export function formatDateShort(iso: string): string {
  const date = parseIsoDate(iso) ?? new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(APP_DATE_LOCALE, { day: 'numeric', month: 'short' });
}
