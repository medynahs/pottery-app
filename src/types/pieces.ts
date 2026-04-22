import type { PricingFiringMode, PricingSaleMode, PricingUserType } from './pricing';

export type TimelineEntry = {
  stage: string;
  timestamp: string;
  notes?: string;
  photo?: string;
};

// Physical state of the piece in the pottery process
export type Stage =
  | 'idea'
  | 'forming'
  | 'leather-hard'
  | 'trimming'
  | 'drying'
  | 'bone-dry'
  | 'bisque'
  | 'glazing'
  | 'glaze-fired'
  | 'finished'
  | 'cemetery';

// Condition or disposition — separate from physical stage
export type PieceStatus =
  | 'cracked'
  | 'warped'
  | 'available'
  | 'not-for-sale'
  | 'sold'
  | 'gifted'
  | 'trade'
  | 'exhibition'
  | 'archived';

export type Piece = {
  id: number;
  /** UUID assigned by the backend after the piece is first synced. */
  backendId?: string;
  name: string;
  stage: string;          // physical state (Stage)
  status?: string;        // outcome / condition (PieceStatus)
  createdAt: string;
  description?: string;
  timeline: TimelineEntry[];
  clay: string;
  photo?: string;
  imgUrl?: string;
  location?: string;
  formingMethod?: string;
  form?: string;
  weight?: string;
  dimensions?: string;
  bisqueTemp?: string;
  glazeTemp?: string;
  firingType?: string;
  decorations?: string;
  notes?: string;
  epitaph?: string;
  causeOfDeath?: string;
  price?: string;
  heightCm?: number;
  widthCm?: number;
  volumeCm3?: number;
  pricingUserType?: PricingUserType;
  firingFeeMode?: PricingFiringMode;
  salePriceMode?: PricingSaleMode;
  firingFee?: number;
  firingFeeQuoteRequired?: boolean;
  weightGrams?: number;
  workHours?: number;
  adminHours?: number;
  workMinutes?: number;
  adminMinutes?: number;
  costClay?: number;
  costGlaze?: number;
  costEnergy?: number;
  costOther?: number;
  costClayOverride?: number;
  costGlazeOverride?: number;
  costEnergyOverride?: number;
  materialCost?: number;
  laborCost?: number;
  adminCost?: number;
  overheadCost?: number;
  sellingFeePct?: number;
  taxPct?: number;
  sellingFeeAmount?: number;
  taxAmount?: number;
  profitAmount?: number;
  totalCost?: number;
  markupPct?: number;
  suggestedPrice?: number;
  wholesalePrice?: number;
  retailPriceTarget?: number;
  wholesalePriceTarget?: number;
  batchId?: string;
  batchSize?: number;
  updatedAt?: string;
};

export type PieceForm = {
  name: string;
  clay: string;
  stage: string;
  status: string;
  photo?: string;
  location: string;
  formingMethod: string;
  form: string;
  weight: string;
  dimensions: string;
  heightCm: string;
  widthCm: string;
  firingFeeMode: PricingFiringMode;
  salePriceMode: PricingSaleMode;
  workHours: string;
  adminHours: string;
  costClayOverride: string;
  costGlazeOverride: string;
  costEnergyOverride: string;
  costOther: string;
  markupPct: string;
  bisqueTemp: string;
  glazeTemp: string;
  firingType: string;
  decorations: string;
  notes: string;
  epitaph: string;
  causeOfDeath: string;
  retailPriceTarget: string;
  wholesalePriceTarget: string;
  quantity: number;
};

export type DisplayItem =
  | { type: 'single'; piece: Piece }
  | { type: 'batch'; pieces: Piece[]; batchId: string }
  | { type: 'set-header'; batchId: string; name: string; count: number };

export type GridRow =
  | { type: 'batch'; batchId: string; pieces: Piece[] }
  | { type: 'pair'; items: Piece[] }
  | { type: 'set-header'; batchId: string; name: string; count: number };

