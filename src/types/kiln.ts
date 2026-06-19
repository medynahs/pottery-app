// src/screens/kiln/types.ts

export type KilnType = 'electric' | 'gas' | 'wood' | 'pit' | 'studio';
export type FiringLogSource = 'session' | 'manual';
export type KilnPricingModel = 'per-volume' | 'per-shelf' | 'per-kiln';
export type FiringLocation = 'studio' | 'external-kiln' | 'home';
export type FiringStatusOverride = 'fired' | 'ready' | 'picked-up';

export type Kiln = {
  id: string;
  /** UUID issued by the backend after the kiln is first synced. */
  backendId?: string;
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
  /** Maximum rated temperature in °C (spec default 1300). */
  maxTempC?: number;
  /** ISO timestamp of the most recent completed firing. */
  lastFiredAt?: string;
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

export type PieceFireReceipt = {
  pieceBackendId: string;
  pieceName: string;
  stageBeforeFiring?: string;
  stageAfterFiring?: string;
  survived: boolean;
  firingFee?: number;
  clayBody?: string;
};

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
  /** UUID issued by the backend after the firing is first synced. */
  backendId?: string;
  /** Studio this firing belongs to (for shared-studio firings). */
  studioId?: string;
  /** How many active days the firing ran (backend-calculated). */
  activeDays?: number;
  /** Pieces that survived (backend-calculated from receipts). */
  survivedCount?: number;
  /** Pieces that were lost (backend-calculated from receipts). */
  lostCount?: number;
  /** Per-piece outcome receipts, populated after completion. */
  pieceReceipts?: PieceFireReceipt[];
  /** Calendar date the kiln actually fired (YYYY-MM-DD). */
  firedDate?: string;
  /** Peak temperature reached during the firing (°C). */
  peakTempC?: number;
  /** Hold time at peak temperature (minutes). */
  holdTimeMinutes?: number;
  /** Optional photo documenting the firing load or result. */
  photoUri?: string;
  /** Whether this record came from a live session or a retroactive log. */
  logSource?: FiringLogSource;
};

export type LogFiringPayload = {
  firedDate: string;
  peakTempC: number;
  holdTimeMinutes: number;
  photoUri?: string;
  result: 'success' | 'issues';
  resultNotes?: string;
  type?: FiringType;
  /** Pieces that were in this firing (optional). */
  pieceIds?: number[];
};

export type KilnPerformanceStats = {
  totalFirings: number;
  successCount: number;
  successPct: number | null;
  avgPeakTempC: number | null;
  avgHoldMinutes: number | null;
};

export type KilnChecklist = {
  id: string;
  text: string;
  checked: boolean;
};
