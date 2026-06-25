import type { BadgeContext } from '../constants/badgeRegistry';

function parseDate(raw?: string | null): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getStudioTenure(pieces: { createdAt?: string }[]): {
  days: number;
  label: string;
} | null {
  let earliest: Date | null = null;

  for (const piece of pieces) {
    const date = parseDate(piece.createdAt);
    if (!date) continue;
    if (!earliest || date.getTime() < earliest.getTime()) {
      earliest = date;
    }
  }

  if (!earliest) return null;

  const days = Math.max(1, Math.floor((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24)));

  if (days < 14) return { days, label: `${days} day${days === 1 ? '' : 's'} in the studio` };
  if (days < 60) {
    const weeks = Math.floor(days / 7);
    return { days, label: `${weeks} week${weeks === 1 ? '' : 's'} of making` };
  }
  if (days < 365) {
    const months = Math.max(1, Math.round(days / 30));
    return { days, label: `${months} month${months === 1 ? '' : 's'} on the wheel` };
  }

  const years = Math.floor(days / 365);
  const remMonths = Math.floor((days % 365) / 30);
  if (remMonths === 0) {
    return { days, label: `${years} year${years === 1 ? '' : 's'} of clay` };
  }
  return { days, label: `${years}y ${remMonths}mo in the studio` };
}

export function getJourneyTagline(
  ctx: BadgeContext,
  earnedBadges: number,
  title: string,
): string {
  if (ctx.totalPieces === 0) {
    return 'The wheel is waiting. Your chronicle begins with the first lump of clay.';
  }
  if (ctx.totalFirings === 0 && ctx.totalPieces > 0) {
    return `${ctx.totalPieces} piece${ctx.totalPieces === 1 ? '' : 's'} logged — fire the kiln when you\'re ready.`;
  }
  if (ctx.finishedPieces === 0) {
    return 'Pieces are taking shape. The finish line is closer than it feels.';
  }
  if (earnedBadges === 0) {
    return `A ${title.toLowerCase()} in the making — achievements unlock as you log your practice.`;
  }
  if (ctx.soldPieces > 0) {
    return `${ctx.finishedPieces} finished · ${ctx.soldPieces} sold — your studio story is writing itself.`;
  }
  if (ctx.totalFirings >= 25) {
    return `${ctx.totalFirings} firings logged. The kiln knows your name by now.`;
  }
  return `${ctx.finishedPieces} finished pieces · ${earnedBadges} achievements earned along the way.`;
}
