/** Derive initials from a glaze name for batch IDs (e.g. "Cobalt Blue" → "CB"). */
function initialsFromName(name: string): string {
  const base = name.replace(/\s*v\d+\s*$/i, '').trim();
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'GL';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function formatBatchMonth(dateMixed: string): string {
  const match = /^(\d{4})-(\d{2})/.exec(dateMixed.trim());
  if (match) return `${match[1]}-${match[2]}`;
  const parsed = new Date(dateMixed);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
}

/** Build a batch ID like CB-2026-06-v3. */
export function generateGlazeBatchId(
  name: string,
  dateMixed: string,
  versionNumber: number,
): string {
  const initials = initialsFromName(name);
  const month = formatBatchMonth(dateMixed);
  const version = Math.max(1, versionNumber);
  return `${initials}-${month}-v${version}`;
}

export { todayIso } from '@/src/utils/dates';
