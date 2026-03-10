// src/screens/kiln/constants.ts

import type { FiringState, FiringType, KilnType } from './types';

export const KILN_TYPE_LABELS: Record<KilnType, string> = {
  electric: 'Electric',
  gas: 'Gas',
  wood: 'Wood',
  studio: 'Studio (shared)',
};

export const KILN_TYPE_OPTIONS = (Object.keys(KILN_TYPE_LABELS) as KilnType[]).map((k) => ({
  value: k,
  label: KILN_TYPE_LABELS[k],
}));

export const FIRING_TYPE_LABELS: Record<FiringType, string> = {
  bisque: 'Bisque',
  glaze: 'Glaze',
  luster: 'Luster',
  other: 'Other',
};

export const FIRING_TYPE_OPTIONS = (Object.keys(FIRING_TYPE_LABELS) as FiringType[]).map((k) => ({
  value: k,
  label: FIRING_TYPE_LABELS[k],
}));

export const FIRING_STATE_LABELS: Record<FiringState, string> = {
  scheduled: 'Scheduled',
  loading: 'Loading',
  firing: 'Firing',
  cooling: 'Cooling',
  unloading: 'Ready to Unload',
  completed: 'Completed',
};

export const FIRING_STATE_ORDER: FiringState[] = [
  'scheduled',
  'loading',
  'firing',
  'cooling',
  'unloading',
  'completed',
];

export function nextFiringState(state: FiringState): FiringState | null {
  const idx = FIRING_STATE_ORDER.indexOf(state);
  if (idx === -1 || idx >= FIRING_STATE_ORDER.length - 1) return null;
  return FIRING_STATE_ORDER[idx + 1];
}

/** Cone options in common use order */
export const CONE_OPTIONS = [
  { value: '022', label: 'Cone 022' },
  { value: '018', label: 'Cone 018' },
  { value: '010', label: 'Cone 010' },
  { value: '06', label: 'Cone 06' },
  { value: '05', label: 'Cone 05' },
  { value: '04', label: 'Cone 04' },
  { value: '03', label: 'Cone 03' },
  { value: '02', label: 'Cone 02' },
  { value: '01', label: 'Cone 01' },
  { value: '1', label: 'Cone 1' },
  { value: '2', label: 'Cone 2' },
  { value: '4', label: 'Cone 4' },
  { value: '5', label: 'Cone 5' },
  { value: '6', label: 'Cone 6' },
  { value: '8', label: 'Cone 8' },
  { value: '9', label: 'Cone 9' },
  { value: '10', label: 'Cone 10' },
  { value: '12', label: 'Cone 12' },
];

/** Returns the piece stage to advance FROM when completing a firing of a given type */
export const FIRING_SOURCE_STAGE: Record<string, string> = {
  bisque: 'bone-dry',
  glaze: 'glazing',
};

/** Returns the piece stage to advance TO when completing a firing of a given type */
export const FIRING_TARGET_STAGE: Record<string, string> = {
  bisque: 'bisque',
  glaze: 'glaze-fired',
};

/** Stages that indicate a piece is "waiting for bisque" */
export const WAITING_FOR_BISQUE_STAGE = 'bone-dry';
/** Stages that indicate a piece is "waiting for glaze firing" */
export const WAITING_FOR_GLAZE_STAGE = 'glazing';

export const DEFAULT_CHECKLIST = [
  { id: 'c1', text: 'Wipe bottoms of all glazed pieces', checked: false },
  { id: 'c2', text: 'Check pieces for cracks before loading', checked: false },
  { id: 'c3', text: 'Apply kiln wash to shelves if needed', checked: false },
  { id: 'c4', text: 'Arrange pieces by height (tallest in back)', checked: false },
  { id: 'c5', text: 'Document which pieces are going in', checked: false },
];
