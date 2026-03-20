import { ArchiveX, Droplets, Flame, Hammer, Lightbulb, PackageCheck, Scissors, Sparkles, Star, Wind, Zap } from 'lucide-react-native';
import type { Piece } from './types';

export const LIFECYCLE_ORDER = [
  'idea',
  'forming',
  'leather-hard',
  'trimming',
  'drying',
  'bone-dry',
  'bisque',
  'glazing',
  'glaze-fired',
  'finished',
] as const;

export type LifecycleStage = typeof LIFECYCLE_ORDER[number];

export function nextStage(stage: string): string | null {
  const idx = LIFECYCLE_ORDER.indexOf(stage as LifecycleStage);
  if (idx === -1 || idx === LIFECYCLE_ORDER.length - 1) return null;
  return LIFECYCLE_ORDER[idx + 1];
}

export const STAGES = [
  { id: 'all', label: 'All', Icon: PackageCheck },
  { id: 'idea', label: 'Idea / Planned', Icon: Lightbulb },
  { id: 'forming', label: 'Forming', Icon: Hammer },
  { id: 'leather-hard', label: 'Leather Hard', Icon: Droplets },
  { id: 'trimming', label: 'Trimming & Refining', Icon: Scissors },
  { id: 'drying', label: 'Drying', Icon: Wind },
  { id: 'bone-dry', label: 'Bone Dry', Icon: Wind },
  { id: 'bisque', label: 'Bisque Fired', Icon: Flame },
  { id: 'glazing', label: 'Glazing', Icon: Sparkles },
  { id: 'glaze-fired', label: 'Glaze Fired', Icon: Zap },
  { id: 'finished', label: 'Finished', Icon: Star },
  { id: 'cemetery', label: 'Cemetery', Icon: ArchiveX },
];

export const PIECE_STAGES = STAGES.filter(s => s.id !== 'all');

export const STAGE_LABEL: Record<string, string> = {
  idea: 'Idea',
  forming: 'Forming',
  'leather-hard': 'Leather Hard',
  trimming: 'Trimming',
  drying: 'Drying',
  'bone-dry': 'Bone Dry',
  bisque: 'Bisque',
  glazing: 'Glazing',
  'glaze-fired': 'Glaze Fired',
  finished: 'Finished',
  cemetery: 'Honored',
};

// Condition problems
export const PIECE_CONDITION_STATUSES = ['Cracked', 'Warped'];

// Disposition / outcome
export const PIECE_DISPOSITION_STATUSES = [
  'Available',
  'Not for Sale',
  'Sold',
  'Gifted',
  'Trade',
  'Exhibition',
  'Archived',
];

export const PIECE_STATUSES = [...PIECE_CONDITION_STATUSES, ...PIECE_DISPOSITION_STATUSES];

// Returns true for problem conditions that should be highlighted in red
export function isConditionStatus(status: string): boolean {
  return PIECE_CONDITION_STATUSES.map(s => s.toLowerCase()).includes(status.toLowerCase());
}

export const FORMING_METHODS = [
  'No Forming Method',
  'Coiled',
  'Mold Formed',
  'Pinched',
  'Slab Built',
  'Slip Cast',
  'Thrown and Altered',
  'Wheel Thrown',
];

export const PIECE_FORMS = [
  'No Form',
  'Bowl',
  'Coffee Cup',
  'Jar',
  'Moon Jar',
  'Mug',
  'Planter',
  'Plate',
  'Platter',
  'Tea Cup',
  'Test Tile',
  'Urn',
  'Vase',
];

export const BISQUE_TEMPS = [
  'Cone 022',
  'Cone 021',
  'Cone 020',
  'Cone 019',
  'Cone 018',
  'Cone 017',
  'Cone 016',
  'Cone 015',
  'Cone 014',
  'Cone 013',
  'Cone 012',
  'Cone 011',
  'Cone 010',
  'Cone 09',
  'Cone 08',
  'Cone 07',
  'Cone 06',
  'Cone 05',
  'Cone 04',
];

export const GLAZE_TEMPS = [
  'Cone 06',
  'Cone 05',
  'Cone 04',
  'Cone 03',
  'Cone 02',
  'Cone 01',
  'Cone 1',
  'Cone 2',
  'Cone 3',
  'Cone 4',
  'Cone 5',
  'Cone 6',
  'Cone 7',
  'Cone 8',
  'Cone 9',
  'Cone 10',
  'Cone 11',
  'Cone 12',
];

/** Approximate Orton large cone temperatures in Celsius (at ~60°C/hr) */
export const CONE_TEMPS_CELSIUS: Record<string, number> = {
  'Cone 022': 585,
  'Cone 021': 600,
  'Cone 020': 626,
  'Cone 019': 630,
  'Cone 018': 696,
  'Cone 017': 727,
  'Cone 016': 748,
  'Cone 015': 790,
  'Cone 014': 807,
  'Cone 013': 837,
  'Cone 012': 861,
  'Cone 011': 875,
  'Cone 010': 893,
  'Cone 09':  955,
  'Cone 08':  983,
  'Cone 07':  1008,
  'Cone 06':  1023,
  'Cone 05':  1046,
  'Cone 04':  1063,
  'Cone 03':  1101,
  'Cone 02':  1120,
  'Cone 01':  1137,
  'Cone 1':   1154,
  'Cone 2':   1162,
  'Cone 3':   1168,
  'Cone 4':   1186,
  'Cone 5':   1196,
  'Cone 6':   1222,
  'Cone 7':   1240,
  'Cone 8':   1263,
  'Cone 9':   1280,
  'Cone 10':  1305,
  'Cone 11':  1315,
  'Cone 12':  1326,
};

export const FIRING_TYPES = [
  'Reduction',
  'Oxidation',
  'Soda',
  'Raku',
  'Pit',
  'Wood',
  'Other',
];

export const EMPTY_FORM = {
  name: '',
  clay: '',
  stage: 'forming',
  status: '',
  photo: undefined,
  location: '',
  formingMethod: '',
  form: '',
  weight: '',
  dimensions: '',
  heightCm: '',
  widthCm: '',
  firingFeeMode: 'bisque-glaze',
  salePriceMode: 'retail',
  workHours: '',
  adminHours: '',
  costClayOverride: '',
  costGlazeOverride: '',
  costEnergyOverride: '',
  costOther: '',
  markupPct: '',
  bisqueTemp: '',
  glazeTemp: '',
  firingType: '',
  decorations: '',
  notes: '',
  epitaph: '',
  causeOfDeath: '',
  retailPriceTarget: '',
  wholesalePriceTarget: '',
  quantity: 1,
};

export const INITIAL_PIECES: Piece[] = [
  { id: 1, name: 'Speckled Mug', stage: 'bisque', createdAt: '2025-10-12T10:00:00.000Z', timeline: [{ stage: 'forming', timestamp: '2025-10-12T10:00:00.000Z' }, { stage: 'leather-hard', timestamp: '2025-10-13T08:00:00.000Z' }, { stage: 'trimming', timestamp: '2025-10-13T14:00:00.000Z' }, { stage: 'drying', timestamp: '2025-10-14T09:00:00.000Z' }, { stage: 'bone-dry', timestamp: '2025-10-15T10:00:00.000Z' }, { stage: 'bisque', timestamp: '2025-10-16T11:00:00.000Z' }], clay: 'B-Mix', weight: '320g', location: 'Studio Shelf B', imgUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'Tall Vase', stage: 'leather-hard', createdAt: '2025-10-15T14:00:00.000Z', timeline: [{ stage: 'forming', timestamp: '2025-10-15T14:00:00.000Z' }, { stage: 'leather-hard', timestamp: '2025-10-16T10:00:00.000Z' }], clay: 'Speckled Buff', weight: '580g', location: 'Drying Rack', imgUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Matcha Bowl', stage: 'forming', createdAt: '2025-10-18T16:00:00.000Z', timeline: [{ stage: 'idea', timestamp: '2025-10-17T10:00:00.000Z' }, { stage: 'forming', timestamp: '2025-10-18T16:00:00.000Z' }], clay: 'Porcelain', location: 'Wheel', imgUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=400&auto=format&fit=crop' },
  { id: 4, name: 'Planter Pot', stage: 'cemetery', status: 'Cracked', createdAt: '2025-09-22T12:00:00.000Z', timeline: [{ stage: 'forming', timestamp: '2025-09-22T12:00:00.000Z' }, { stage: 'leather-hard', timestamp: '2025-09-23T09:00:00.000Z' }, { stage: 'trimming', timestamp: '2025-09-23T15:00:00.000Z' }, { stage: 'bone-dry', timestamp: '2025-09-26T10:00:00.000Z' }, { stage: 'bisque', timestamp: '2025-09-28T10:00:00.000Z' }, { stage: 'cemetery', timestamp: '2025-09-30T15:00:00.000Z' }], clay: 'Red Stoneware', notes: 'Cracked during bisque firing', imgUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400&auto=format&fit=crop' },
  { id: 5, name: 'Yunomi Cup', stage: 'glazing', createdAt: '2025-10-20T09:00:00.000Z', timeline: [{ stage: 'forming', timestamp: '2025-10-20T09:00:00.000Z' }, { stage: 'leather-hard', timestamp: '2025-10-21T09:00:00.000Z' }, { stage: 'trimming', timestamp: '2025-10-21T14:00:00.000Z' }, { stage: 'drying', timestamp: '2025-10-22T10:00:00.000Z' }, { stage: 'bone-dry', timestamp: '2025-10-23T09:00:00.000Z' }, { stage: 'bisque', timestamp: '2025-10-25T11:00:00.000Z' }, { stage: 'glazing', timestamp: '2025-10-27T14:00:00.000Z' }], clay: 'B-Mix', weight: '210g', dimensions: '8cm × 9cm', location: 'Glazing Station', imgUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=400&auto=format&fit=crop' },
  { id: 6, name: 'Serving Bowl', stage: 'finished', status: 'Available', createdAt: '2025-10-08T11:00:00.000Z', timeline: [{ stage: 'forming', timestamp: '2025-10-08T11:00:00.000Z' }, { stage: 'leather-hard', timestamp: '2025-10-09T09:00:00.000Z' }, { stage: 'trimming', timestamp: '2025-10-09T15:00:00.000Z' }, { stage: 'drying', timestamp: '2025-10-11T08:00:00.000Z' }, { stage: 'bone-dry', timestamp: '2025-10-12T09:00:00.000Z' }, { stage: 'bisque', timestamp: '2025-10-14T13:00:00.000Z' }, { stage: 'glazing', timestamp: '2025-10-16T10:00:00.000Z' }, { stage: 'glaze-fired', timestamp: '2025-10-18T14:00:00.000Z' }, { stage: 'finished', timestamp: '2025-10-19T10:00:00.000Z' }], clay: 'Porcelain', weight: '480g', dimensions: '28cm × 8cm', price: '85', imgUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=400&auto=format&fit=crop' },
];
