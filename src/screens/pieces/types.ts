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
  name: string;
  stage: string;          // physical state (Stage)
  status?: string;        // outcome / condition (PieceStatus)
  createdAt: string;
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
  batchId?: string;
  batchSize?: number;
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
  bisqueTemp: string;
  glazeTemp: string;
  firingType: string;
  decorations: string;
  notes: string;
  epitaph: string;
  causeOfDeath: string;
  price: string;
  quantity: number;
};

