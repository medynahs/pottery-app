
export { formatDate, formatDateNumeric, formatDateShort, todayIso } from '@/src/utils/dates';

export function formatDuration(ms: number): string {
    const hours = Math.floor(ms / 3_600_000);
    if (hours < 24) return hours < 1 ? '< 1h' : `${hours}h`;
    const days = Math.floor(ms / 86_400_000);
    if (days < 14) return `${days} day${days !== 1 ? 's' : ''}`;
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
}
