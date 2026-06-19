import type { Firing } from '@/src/types/kiln';
import type { Piece, TimelineEntry } from '@/src/types/pieces';

export interface JourneyMilestone {
  id: string;
  year: string;
  label: string;
  color: string;
  date: Date;
}

function parseDate(raw?: string | null): Date | null {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatYear(date: Date): string {
  return `${date.getFullYear()}`;
}

function firingDate(firing: Firing): Date | null {
  return parseDate(firing.completedAt ?? firing.startedAt ?? firing.scheduledDate ?? firing.createdAt);
}

function compareByDateDesc(a: JourneyMilestone, b: JourneyMilestone): number {
  return b.date.getTime() - a.date.getTime();
}

function earliestTimelineDate(
  pieces: Piece[],
  matches: (entry: TimelineEntry, piece: Piece) => boolean,
): Date | null {
  let earliest: Date | null = null;

  for (const piece of pieces) {
    for (const entry of piece.timeline) {
      if (!matches(entry, piece)) continue;
      const date = parseDate(entry.timestamp);
      if (!date) continue;
      if (!earliest || date.getTime() < earliest.getTime()) {
        earliest = date;
      }
    }
  }

  return earliest;
}

function earliestStatusDate(pieces: Piece[], status: string): Date | null {
  let earliest: Date | null = null;

  for (const piece of pieces) {
    if (piece.status !== status) continue;

    let date =
      earliestTimelineDate([piece], (entry) => entry.status === status)
      ?? parseDate(piece.updatedAt);

    if (!date) {
      const finishedEntry = piece.timeline.find((entry) => entry.stage === 'finished');
      date = parseDate(finishedEntry?.timestamp ?? piece.createdAt);
    }

    if (!date) continue;
    if (!earliest || date.getTime() < earliest.getTime()) {
      earliest = date;
    }
  }

  return earliest;
}

function pushMilestone(
  milestones: JourneyMilestone[],
  seen: Set<string>,
  milestone: Omit<JourneyMilestone, 'year'> & { year?: string },
) {
  const key = `${milestone.id}:${milestone.date.toISOString()}`;
  if (seen.has(key)) return;
  seen.add(key);
  milestones.push({
    ...milestone,
    year: milestone.year ?? formatYear(milestone.date),
  });
}

export function buildJourneyMilestones(pieces: Piece[], firings: Firing[]): JourneyMilestone[] {
  const milestones: JourneyMilestone[] = [];
  const seen = new Set<string>();

  const piecesByCreated = [...pieces]
    .map((piece) => ({ piece, date: parseDate(piece.createdAt) }))
    .filter((entry): entry is { piece: Piece; date: Date } => entry.date != null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const firingsByDate = [...firings]
    .map((firing) => ({ firing, date: firingDate(firing) }))
    .filter((entry): entry is { firing: Firing; date: Date } => entry.date != null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const firstPiece = piecesByCreated[0];
  if (firstPiece) {
    pushMilestone(milestones, seen, {
      id: 'journey-started',
      date: firstPiece.date,
      label: firstPiece.piece.name
        ? `Started the journey with "${firstPiece.piece.name}"`
        : 'Started the pottery journey',
      color: 'bg-green-400',
    });
  }

  const firstFinished = earliestTimelineDate(pieces, (entry) => entry.stage === 'finished');
  if (firstFinished) {
    pushMilestone(milestones, seen, {
      id: 'first-finished',
      date: firstFinished,
      label: 'Finished first piece',
      color: 'bg-emerald-400',
    });
  }

  const firstBisque = firingsByDate.find(({ firing }) => firing.type === 'bisque');
  if (firstBisque) {
    pushMilestone(milestones, seen, {
      id: 'first-bisque',
      date: firstBisque.date,
      label: 'Logged first bisque firing',
      color: 'bg-primary',
    });
  }

  const firstGlaze = firingsByDate.find(({ firing }) => firing.type === 'glaze');
  if (firstGlaze) {
    pushMilestone(milestones, seen, {
      id: 'first-glaze',
      date: firstGlaze.date,
      label: 'Logged first glaze firing',
      color: 'bg-cyan-400',
    });
  }

  const firstSale = earliestStatusDate(pieces, 'sold');
  if (firstSale) {
    pushMilestone(milestones, seen, {
      id: 'first-sale',
      date: firstSale,
      label: 'Made first sale',
      color: 'bg-green-500',
    });
  }

  const firstGift = earliestStatusDate(pieces, 'gifted');
  if (firstGift) {
    pushMilestone(milestones, seen, {
      id: 'first-gift',
      date: firstGift,
      label: 'Gifted first piece',
      color: 'bg-fuchsia-400',
    });
  }

  const firstCemetery = earliestTimelineDate(pieces, (entry) => entry.stage === 'cemetery');
  if (firstCemetery) {
    pushMilestone(milestones, seen, {
      id: 'first-cemetery',
      date: firstCemetery,
      label: 'Sent first piece to the cemetery',
      color: 'bg-pink-400',
    });
  }

  for (const count of [10, 50, 100, 150, 300]) {
    const milestonePiece = piecesByCreated[count - 1];
    if (!milestonePiece) continue;
    pushMilestone(milestones, seen, {
      id: `pieces-${count}`,
      date: milestonePiece.date,
      label: `Made piece #${count}`,
      color: 'bg-blue-400',
    });
  }

  for (const count of [10, 25]) {
    const milestoneFiring = firingsByDate[count - 1];
    if (!milestoneFiring) continue;
    pushMilestone(milestones, seen, {
      id: `firings-${count}`,
      date: milestoneFiring.date,
      label: count === 25 ? 'Logged 25 kiln firings' : 'Logged 10 kiln firings',
      color: 'bg-amber-400',
    });
  }

  return milestones.sort(compareByDateDesc);
}
