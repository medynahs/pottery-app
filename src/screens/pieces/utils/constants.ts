import { ArchiveX, Droplets, Flame, Hammer, Lightbulb, PackageCheck, Scissors, Sparkles, Star, Wind, Zap } from 'lucide-react-native';
import { JournalTheme } from './journalTheme';

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
  'Cone 09': 955,
  'Cone 08': 983,
  'Cone 07': 1008,
  'Cone 06': 1023,
  'Cone 05': 1046,
  'Cone 04': 1063,
  'Cone 03': 1101,
  'Cone 02': 1120,
  'Cone 01': 1137,
  'Cone 1': 1154,
  'Cone 2': 1162,
  'Cone 3': 1168,
  'Cone 4': 1186,
  'Cone 5': 1196,
  'Cone 6': 1222,
  'Cone 7': 1240,
  'Cone 8': 1263,
  'Cone 9': 1280,
  'Cone 10': 1305,
  'Cone 11': 1315,
  'Cone 12': 1326,
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

import type { GlazeOutcome } from '../../../types/pieces';

export const GLAZE_OUTCOME_OPTIONS: GlazeOutcome[] = ['success', 'crawling', 'underfired', 'crack'];

export const GLAZE_OUTCOME_LABELS: Record<GlazeOutcome, string> = {
  success: 'Success',
  crawling: 'Crawling',
  underfired: 'Underfired',
  crack: 'Crack',
};

export const EMPTY_FORM = {
  name: '',
  clay: '',
  stage: 'idea',
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
  glazeId: '',
  glazeOutcome: '',
};

export const STAGE_ICON_MAP = Object.fromEntries(STAGES.map(s => [s.id, s.Icon]));
export const PAGE_ACCENTS: string[] = [...JournalTheme.pageAccents];

export const BOOK_ART = {
  coverIllustration: require('../../../../assets/images/pottery-studio.png'),
  pageWatermark: require('../../../../assets/images/pottery-wheel.png'),
  memorialStamp: require('../../../../assets/images/pottery-memorial.png'),
};
