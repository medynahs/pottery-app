export type KilnkinPersonality = 'fire' | 'earth' | 'air' | 'water';

export type KilnkinCompanion = {
  id: string;
  name: string;
  species: string;
  personality: KilnkinPersonality;
  element: KilnkinPersonality;
  bornOn: string;
  notificationToneLabel: string;
  favoriteSnack: string;
  napSpot: string;
  loves: string;
  collects: string;
};

export const AVAILABLE_KILNKIN_COMPANIONS: KilnkinCompanion[] = [
  {
    id: 'ember',
    name: 'Ember',
    species: 'Kiln Fox',
    personality: 'fire',
    element: 'fire',
    bornOn: '2026-03-08',
    notificationToneLabel: 'Bold & Energising',
    favoriteSnack: 'Spicy cinnamon tea and roasted clay crumbs',
    napSpot: 'On top of the warm kiln lid',
    loves: 'Fast-fire schedules and decisive glaze choices',
    collects: 'Temperature logs and brave test tiles',
  },
  {
    id: 'terra',
    name: 'Terra',
    species: 'Studio Hare',
    personality: 'earth',
    element: 'earth',
    bornOn: '2026-03-08',
    notificationToneLabel: 'Grounded & Reassuring',
    favoriteSnack: 'Oat biscuits and fresh wedged clay',
    napSpot: 'Under the warm work table near the reclaim bucket',
    loves: 'Well-ordered shelves and slow rhythmic work',
    collects: 'Kiln cookies, glaze test cards, and studio routines',
  },
  {
    id: 'wisp',
    name: 'Wisp',
    species: 'Glaze Sprite',
    personality: 'air',
    element: 'air',
    bornOn: '2026-03-08',
    notificationToneLabel: 'Light & Unhurried',
    favoriteSnack: 'Biscuit crumbs and morning studio air',
    napSpot: 'On the sunny corner of the drying shelf',
    loves: 'Surprise glazes and spontaneous experiments',
    collects: 'Forgotten glaze recipes and lucky sponge corners',
  },
  {
    id: 'drift',
    name: 'Drift',
    species: 'River Cat',
    personality: 'water',
    element: 'water',
    bornOn: '2026-03-08',
    notificationToneLabel: 'Playful & Whimsical',
    favoriteSnack: 'Chamomile steam and stories from old kilns',
    napSpot: 'Beside the finished cabinet in soft morning light',
    loves: 'Slow-dry days and thoughtful glaze layers',
    collects: 'Glaze chemistry notes and quiet victory stamps',
  },
];

// Default free companion: Earth (most universally approachable)
export const DEFAULT_KILNKIN_COMPANION = AVAILABLE_KILNKIN_COMPANIONS[1];

function getPrefix(personality: KilnkinPersonality) {
  switch (personality) {
    case 'fire':
      return 'Heads up. Move now:';
    case 'air':
      return 'No rush. Just so you know:';
    case 'water':
      return 'Bloop. Tiny update:';
    case 'earth':
    default:
      return 'Steady reminder:';
  }
}

export function getKilnkinVoiceLine(companion: KilnkinCompanion, message: string) {
  return `${getPrefix(companion.personality)} ${message}`;
}
