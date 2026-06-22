import type { Firing, Kiln } from '@/src/types/kiln';
import { getAutoFiringStatus, type AutoFiringStatus } from '@/src/screens/kiln/firingEstimations';

export type FiringSessionDisplayStatus =
  | 'scheduled'
  | 'firing'
  | 'cooling'
  | 'ready'
  | 'completed';

const DISPLAY_LABELS: Record<FiringSessionDisplayStatus, string> = {
  scheduled: 'Scheduled',
  firing: 'Firing',
  cooling: 'Cooling',
  ready: 'Ready to unload',
  completed: 'Completed',
};

export function mapAutoStatusToDisplay(autoStatus: AutoFiringStatus): FiringSessionDisplayStatus {
  switch (autoStatus) {
    case 'waiting':
      return 'scheduled';
    case 'firing':
      return 'firing';
    case 'cooling':
      return 'cooling';
    case 'ready':
      return 'ready';
    default:
      return 'completed';
  }
}

export function getFiringSessionDisplayStatus(firing: Firing, kiln?: Kiln): FiringSessionDisplayStatus {
  if (firing.state === 'completed') return 'completed';
  if (firing.state === 'scheduled' || firing.state === 'loading') {
    const auto = getAutoFiringStatus(firing, kiln);
    if (auto === 'waiting') return 'scheduled';
  }
  return mapAutoStatusToDisplay(getAutoFiringStatus(firing, kiln));
}

export function getFiringSessionLabel(firing: Firing, kiln?: Kiln): string {
  return DISPLAY_LABELS[getFiringSessionDisplayStatus(firing, kiln)];
}

export function kilnHasOpenSessions(kilnId: string, firings: readonly Firing[]): boolean {
  return firings.some((firing) => firing.kilnId === kilnId && firing.state !== 'completed');
}

export function countOpenSessionsForKiln(kilnId: string, firings: readonly Firing[]): number {
  return firings.filter((firing) => firing.kilnId === kilnId && firing.state !== 'completed').length;
}
