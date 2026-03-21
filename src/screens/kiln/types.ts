// src/screens/kiln/types.ts

export type KilnType = 'electric' | 'gas' | 'wood' | 'studio';
export type KilnPricingModel = 'per-volume' | 'per-shelf' | 'per-kiln';
export type FiringLocation = 'studio' | 'external-kiln' | 'home';
export type FiringStatusOverride = 'fired' | 'ready' | 'picked-up';

export type Kiln = {
  id: string;
  name: string;
  imageUri?: string;
  type: KilnType;
  coneRange: string;   // e.g. "04–6", "Cone 10"
  shelves: number;
  size: string;        // e.g. '46 cm diameter'
  location: string;
  notes: string;       // personality / quirks
  queueDelayDays?: number;
  cycleDurationDays?: number;
  pickupDelayDays?: number;
  runsEveryDays?: number;
  /** Legacy field kept for persisted older kiln records. */
  studioDelayDays?: number;
  pricingModel?: KilnPricingModel;
  pricingBaseRate?: number;
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
  location?: FiringLocation;
  cone: string;
  state: FiringState;
  submissionDate?: string;
  expectedReadyAt?: string;
  estimatedTotalCost?: number;
  estimatedCostPerPiece?: number;
  clayBodiesUsed?: string[];
  glazeNotes?: string;
  statusOverride?: FiringStatusOverride;
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
