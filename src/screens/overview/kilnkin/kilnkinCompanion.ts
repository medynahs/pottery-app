export type KilnkinPersonality = 'gentle' | 'playful' | 'steady';

export type KilnkinCompanion = {
  id: string;
  name: string;
  species: string;
  personality: KilnkinPersonality;
  bornOn: string;
  notificationToneLabel: string;
  favoriteSnack: string;
  napSpot: string;
  loves: string;
  collects: string;
};

export const AVAILABLE_KILNKIN_COMPANIONS: KilnkinCompanion[] = [
  {
    id: 'cinder',
    name: 'Cinder',
    species: 'Kiln Cat',
    personality: 'gentle',
    bornOn: '2026-03-08',
    notificationToneLabel: 'Warm and reassuring',
    favoriteSnack: 'Imaginary clay crumbs and steam from tea mugs',
    napSpot: 'Under the warm work table near the reclaim bucket',
    loves: 'Warm kiln shelves and trim-room gossip',
    collects: 'Tiny kiln cookies, ribbon scraps, and glaze test stories',
  },
  {
    id: 'ember',
    name: 'Ember',
    species: 'Shelf Sprite',
    personality: 'playful',
    bornOn: '2026-03-08',
    notificationToneLabel: 'Bright and bouncy',
    favoriteSnack: 'Biscuit crumbs and fresh wedged clay',
    napSpot: 'On the sunny corner of the drying shelf',
    loves: 'Surprise trims and shiny glaze notes',
    collects: 'Test tile secrets and lucky sponge corners',
  },
  {
    id: 'sage',
    name: 'Sage',
    species: 'Studio Fox',
    personality: 'steady',
    bornOn: '2026-03-08',
    notificationToneLabel: 'Grounded and thoughtful',
    favoriteSnack: 'Tea steam and stories from old kilns',
    napSpot: 'Beside the finished cabinet in quiet light',
    loves: 'Orderly shelves and smooth handles',
    collects: 'Stamp marks, sketches, and quiet victories',
  },
];

export const DEFAULT_KILNKIN_COMPANION = AVAILABLE_KILNKIN_COMPANIONS[0];

function getPrefix(personality: KilnkinPersonality) {
  switch (personality) {
    case 'playful':
      return 'Little heads-up:';
    case 'steady':
      return 'A quiet note:';
    case 'gentle':
    default:
      return 'Soft reminder:';
  }
}

export function getKilnkinVoiceLine(companion: KilnkinCompanion, message: string) {
  return `${getPrefix(companion.personality)} ${message}`;
}
