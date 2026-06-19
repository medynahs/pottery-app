import type { StudioPiecePositions } from '@/src/screens/overview/utils/mapPiecesToStudioPositions';
import type { Firing } from '@/src/types/kiln';
import type { Href } from 'expo-router';

export const ACTIVE_FIRING_STATES = new Set(['loading', 'firing', 'cooling', 'unloading']);

const FIRING_STATE_LABEL: Record<string, string> = {
  loading: 'Loading the kiln',
  firing: 'Firing in progress',
  cooling: 'Cooling down',
  unloading: 'Ready to unload',
};

const FIRING_STATE_EMOJI: Record<string, string> = {
  loading: '📦',
  firing: '🔥',
  cooling: '🌡️',
  unloading: '✨',
};

export type PulseCard = {
  emoji: string;
  title: string;
  subtitle: string;
  route: Href;
  accentBg: string;
  accentBorder: string;
  accentText: string;
};

type StudioSignals = {
  kilnReady: boolean;
  dryingTooLong: boolean;
  scrapOverflow: boolean;
};

export function buildOneThingCard(
  activeFiring: Firing | null,
  studioSignals: StudioSignals,
  stagePositions: StudioPiecePositions,
): PulseCard | null {
  if (activeFiring) {
    const ready = activeFiring.expectedReadyAt;
    const hoursLeft = ready ? Math.max(0, Math.round((new Date(ready).getTime() - Date.now()) / (1000 * 60 * 60))) : null;
    return {
      emoji: FIRING_STATE_EMOJI[activeFiring.state] ?? '🏺',
      title: FIRING_STATE_LABEL[activeFiring.state] ?? activeFiring.state,
      subtitle: activeFiring.name + (hoursLeft != null ? ` · ~${hoursLeft}h until ready` : ''),
      route: '/(tabs)/kiln',
      accentBg: 'hsl(16 70% 94%)',
      accentBorder: 'hsl(16 60% 78%)',
      accentText: 'hsl(16 65% 38%)',
    };
  }
  if (studioSignals.kilnReady) {
    const n = stagePositions.kilnArea.length;
    return {
      emoji: '🔥',
      title: `${n} piece${n !== 1 ? 's' : ''} ready for the kiln`,
      subtitle: 'Bone dry and waiting — load when you can',
      route: '/(tabs)/kiln',
      accentBg: 'hsl(24 70% 94%)',
      accentBorder: 'hsl(24 60% 78%)',
      accentText: 'hsl(24 65% 38%)',
    };
  }
  if (studioSignals.dryingTooLong) {
    const n = stagePositions.dryingShelf.length;
    return {
      emoji: '💨',
      title: 'Check the drying shelf',
      subtitle: `${n} piece${n !== 1 ? 's' : ''} ${n !== 1 ? 'have' : 'has'} been drying over 3 days`,
      route: '/(tabs)/pieces?stage=drying',
      accentBg: 'hsl(210 50% 94%)',
      accentBorder: 'hsl(210 40% 78%)',
      accentText: 'hsl(210 45% 38%)',
    };
  }
  if (studioSignals.scrapOverflow) {
    return {
      emoji: '♻️',
      title: 'Reclaim bucket filling up',
      subtitle: 'A quick session would clear the backlog',
      route: '/(tabs)/pieces?stage=trimming',
      accentBg: 'hsl(35 50% 92%)',
      accentBorder: 'hsl(35 45% 76%)',
      accentText: 'hsl(35 50% 36%)',
    };
  }
  return null;
}
