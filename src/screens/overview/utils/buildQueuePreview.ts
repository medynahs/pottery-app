import { FIRING_TYPE_LABELS } from '@/src/screens/kiln/constants';
import { getCalculatedTimeline } from '@/src/screens/kiln/firingEstimations';
import type { Firing, Kiln } from '@/src/types/kiln';
import type { Href } from 'expo-router';
import { ACTIVE_FIRING_STATES } from '@/src/screens/overview/utils/oneThingCard';

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export type QueuePreview = {
  label: string;
  route: Href;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatQueueDayLabel(date: Date, now: Date): string {
  const diffDays = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays <= 6) return WEEKDAY_LABELS[date.getDay()];

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function buildQueuePreview(
  firings: Firing[],
  kilns: Kiln[],
  now: Date = new Date(),
): QueuePreview | null {
  if (firings.some((firing) => ACTIVE_FIRING_STATES.has(firing.state))) {
    return null;
  }

  const kilnById = new Map(kilns.map((kiln) => [kiln.id, kiln]));

  const waitingSessions = firings
    .filter((firing) => firing.state === 'scheduled' && firing.pieceIds.length > 0)
    .map((firing) => {
      const kiln = kilnById.get(firing.kilnId);
      const { firesOnIso } = getCalculatedTimeline(firing, kiln);
      const firesOn = new Date(firesOnIso);
      return { firing, firesOn, pieceCount: firing.pieceIds.length };
    })
    .filter((entry) => !Number.isNaN(entry.firesOn.getTime()));

  if (waitingSessions.length === 0) return null;

  waitingSessions.sort((left, right) => {
    const dateDiff = left.firesOn.getTime() - right.firesOn.getTime();
    if (dateDiff !== 0) return dateDiff;
    return right.pieceCount - left.pieceCount;
  });

  const next = waitingSessions[0];
  const dayLabel = formatQueueDayLabel(next.firesOn, now);
  const typeLabel = FIRING_TYPE_LABELS[next.firing.type].toLowerCase();
  const pieceWord = next.pieceCount === 1 ? 'piece' : 'pieces';

  return {
    label: `${next.pieceCount} ${pieceWord} queued for ${dayLabel} ${typeLabel}`,
    route: '/(tabs)/kiln',
  };
}
