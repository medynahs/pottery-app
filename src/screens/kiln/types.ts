// src/screens/kiln/types.ts

export type KilnType = 'electric' | 'gas' | 'wood' | 'studio';

export type Kiln = {
  id: string;
  name: string;
  type: KilnType;
  coneRange: string;   // e.g. "04–6", "Cone 10"
  shelves: number;
  size: string;        // e.g. '18" diameter'
  location: string;
  notes: string;       // personality / quirks
  createdAt: string;
};

export type FiringType = 'bisque' | 'glaze' | 'luster' | 'other';

export type FiringState =
  | 'scheduled'
  | 'loading'
  | 'firing'
  | 'cooling'
  | 'unloading'
  | 'completed';

export type FiringResult = 'success' | 'issues' | 'failure';

export type Firing = {
  id: string;
  kilnId: string;
  name: string;
  type: FiringType;
  cone: string;
  state: FiringState;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  /** IDs of pieces assigned to this firing */
  pieceIds: number[];
  notes: string;
  result?: FiringResult;
  resultNotes?: string;
  createdAt: string;
};

export type KilnChecklist = {
  id: string;
  text: string;
  checked: boolean;
};
