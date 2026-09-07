import type { QueuePreview } from '@/src/screens/overview/utils/buildQueuePreview';

export type FiringQueueSnapshot = {
  boneDryCount: number;
  glazingCount: number;
  bisqueReadyCount: number;
};

export type ActiveFiringSummary = {
  label: string;
  subtitle: string;
} | null;

export function shouldShowFiringQueueWidget(input: {
  snapshot: FiringQueueSnapshot;
  activeFiring: ActiveFiringSummary;
  queuePreview: QueuePreview | null;
}): boolean {
  const { snapshot, activeFiring, queuePreview } = input;
  return (
    snapshot.boneDryCount + snapshot.glazingCount + snapshot.bisqueReadyCount > 0
    || activeFiring !== null
    || queuePreview !== null
  );
}

export function buildFiringQueueSnapshot(
  pieces: { stage: string }[],
  bisqueReadyCount: number,
): FiringQueueSnapshot {
  let boneDryCount = 0;
  let glazingCount = 0;
  for (const piece of pieces) {
    const stage = piece.stage.trim().toLowerCase();
    if (stage === 'bone-dry') boneDryCount += 1;
    if (stage === 'glazing') glazingCount += 1;
  }
  return { boneDryCount, glazingCount, bisqueReadyCount };
}
