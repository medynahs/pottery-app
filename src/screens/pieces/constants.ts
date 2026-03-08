import { ArchiveX, Droplets, Flame, Lightbulb, PackageCheck, Wind } from 'lucide-react-native';
import type { Piece } from './types';

export const STAGES = [
  { id: 'all', label: 'All', Icon: PackageCheck },
  { id: 'idea', label: 'Idea', Icon: Lightbulb },
  { id: 'wet', label: 'Wet/Leather', Icon: Droplets },
  { id: 'bone-dry', label: 'Bone Dry', Icon: Wind },
  { id: 'bisque', label: 'Bisque Fired', Icon: Flame },
  { id: 'glaze', label: 'Glazed', Icon: PackageCheck },
  { id: 'cemetery', label: 'Cemetery', Icon: ArchiveX },
];

export const PIECE_STAGES = STAGES.filter(s => s.id !== 'all');

export const STAGE_LABEL: Record<string, string> = {
  idea: 'Idea',
  wet: 'Wet/Leather',
  'bone-dry': 'Bone Dry',
  bisque: 'Bisque',
  glaze: 'Glazed',
  cemetery: 'Honored',
};

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
  'Cone 020',
  'Cone 018',
  'Cone 015',
  'Cone 012',
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
  'Cone 8',
  'Cone 9',
  'Cone 10',
  'Cone 11',
  'Cone 12',
];

export const FIRING_TYPES = [
  'Reduction',
  'Oxidation',
  'Soda',
  'Raku',
  'Pit',
  'Wood',
  'Other',
];

export const PIECE_STATUSES = [
  'Available',
  'Not for Sale',
  'Sold',
  'Gifted',
  'Trade',
];

export const EMPTY_FORM = {
  name: '',
  clay: '',
  stage: 'wet',
  photo: undefined,
  location: '',
  formingMethod: '',
  form: '',
  weight: '',
  dimensions: '',
  bisqueTemp: '',
  glazeTemp: '',
  firingType: '',
  decorations: '',
  notes: '',
  status: '',
  price: '',
};

export const INITIAL_PIECES: Piece[] = [
  { id: 1, name: 'Speckled Mug', stage: 'bisque', date: 'Oct 12', clay: 'B-Mix', imgUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'Tall Vase', stage: 'bone-dry', date: 'Oct 15', clay: 'Speckled Buff', imgUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Matcha Bowl', stage: 'wet', date: 'Oct 18', clay: 'Porcelain', imgUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=400&auto=format&fit=crop' },
  { id: 4, name: 'Planter Pot', stage: 'cemetery', date: 'Sep 22', clay: 'Red Stoneware', notes: 'Cracked in bisque', imgUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400&auto=format&fit=crop' },
  { id: 5, name: 'Yunomi Cup', stage: 'glaze', date: 'Oct 20', clay: 'B-Mix', imgUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=400&auto=format&fit=crop' },
  { id: 6, name: 'Serving Bowl', stage: 'bisque', date: 'Oct 8', clay: 'Porcelain', imgUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=400&auto=format&fit=crop' },
];
