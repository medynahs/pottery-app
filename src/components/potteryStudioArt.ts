import type { ImageSourcePropType } from 'react-native';

export type PotteryArtBBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type PotteryArtOrnament = {
  key: string;
  source: ImageSourcePropType;
  bbox: PotteryArtBBox;
  bottom?: number;
  enterX: number;
  enterY: number;
  floatAmplitude: number;
  left?: number;
  right?: number;
  sizeRatio: number;
  top?: number;
};

export const STUDIO_BACKDROP_COLOR = '#FBF0E0';

export const LETTERING_BBOX = { minX: 716, minY: 630, maxX: 1330, maxY: 1749 };

export const POTTERY_STUDIO_ORNAMENTS: PotteryArtOrnament[] = [
  {
    key: 'rib',
    source: require('../../assets/images/ribtool.png'),
    sizeRatio: 0.17,
    top: 0.055,
    left: 0.035,
    bbox: { minX: 382, minY: 180, maxX: 712, maxY: 528 },
    enterX: -24,
    enterY: -18,
    floatAmplitude: 5,
  },
  {
    key: 'kiln',
    source: require('../../assets/images/kilnsplash.png'),
    sizeRatio: 0.17,
    top: 0.05,
    right: 0.03,
    bbox: { minX: 1580, minY: 177, maxX: 1912, maxY: 596 },
    enterX: 22,
    enterY: -16,
    floatAmplitude: 4,
  },
  {
    key: 'trim2',
    source: require('../../assets/images/trimmingtool2.png'),
    sizeRatio: 0.15,
    top: 0.24,
    right: 0.02,
    bbox: { minX: 1664, minY: 976, maxX: 1843, maxY: 1405 },
    enterX: 28,
    enterY: 0,
    floatAmplitude: 6,
  },
  {
    key: 'wood',
    source: require('../../assets/images/woodtool.png'),
    sizeRatio: 0.14,
    top: 0.4,
    left: 0.02,
    bbox: { minX: 272, minY: 954, maxX: 417, maxY: 1363 },
    enterX: -26,
    enterY: 0,
    floatAmplitude: 5,
  },
  {
    key: 'turntable',
    source: require('../../assets/images/turntablewithvase.png'),
    sizeRatio: 0.17,
    bottom: 0.1,
    right: 0.04,
    bbox: { minX: 1414, minY: 1758, maxX: 1743, maxY: 2141 },
    enterX: 18,
    enterY: 22,
    floatAmplitude: 5,
  },
  {
    key: 'trim',
    source: require('../../assets/images/trimmingtool.png'),
    sizeRatio: 0.15,
    bottom: 0.075,
    left: 0.42,
    bbox: { minX: 972, minY: 1902, maxX: 1087, maxY: 2342 },
    enterX: 0,
    enterY: 26,
    floatAmplitude: 7,
  },
  {
    key: 'whimsy',
    source: require('../../assets/images/whimsyvase.png'),
    sizeRatio: 0.16,
    bottom: 0.115,
    left: 0.035,
    bbox: { minX: 258, minY: 1717, maxX: 534, maxY: 2159 },
    enterX: -20,
    enterY: 24,
    floatAmplitude: 6,
  },
];

const PIECE_PLACEHOLDER_KEYS = ['whimsy', 'turntable', 'rib', 'wood', 'trim', 'trim2'] as const;

const ornamentByKey = Object.fromEntries(
  POTTERY_STUDIO_ORNAMENTS.map((ornament) => [ornament.key, ornament])
) as Record<string, PotteryArtOrnament>;

export function pickPiecePlaceholderArt(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 1000;
  }
  const key = PIECE_PLACEHOLDER_KEYS[hash % PIECE_PLACEHOLDER_KEYS.length];
  return ornamentByKey[key];
}
