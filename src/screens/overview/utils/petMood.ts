export type PetMood = 'excited' | 'happy' | 'worried' | 'cozy' | 'focused' | 'sleepy';

export const PET_MOOD_META: Record<PetMood, {
  badge: string;
  label: string;
  cardBorder: string;
  cardBg: string;
  avatarBg: string;
}> = {
  excited: { badge: '✨', label: 'Feeling excited', cardBorder: 'hsl(44 65% 70%)', cardBg: 'rgba(255,251,235,0.9)', avatarBg: 'hsl(44 70% 88%)' },
  happy: { badge: '😊', label: 'Happy in the studio', cardBorder: 'hsl(130 42% 70%)', cardBg: 'rgba(240,252,244,0.9)', avatarBg: 'hsl(130 45% 88%)' },
  worried: { badge: '😟', label: 'A little worried', cardBorder: 'hsl(24 55% 70%)', cardBg: 'rgba(255,246,237,0.9)', avatarBg: 'hsl(24 60% 88%)' },
  cozy: { badge: '🧸', label: 'Cozy rest day', cardBorder: 'hsl(280 30% 74%)', cardBg: 'rgba(250,246,255,0.9)', avatarBg: 'hsl(280 35% 90%)' },
  focused: { badge: '🎯', label: 'Focused and ready', cardBorder: 'hsl(35 45% 72%)', cardBg: 'rgba(255,253,246,0.9)', avatarBg: 'hsl(35 65% 88%)' },
  sleepy: { badge: '😴', label: 'Waiting for clay…', cardBorder: 'hsl(35 30% 76%)', cardBg: 'rgba(253,252,249,0.9)', avatarBg: 'hsl(35 35% 90%)' },
};

export function getPetMood(params: {
  activeFiring: boolean;
  kilnReady: boolean;
  dryingTooLong: boolean;
  scrapOverflow: boolean;
  isRestDay: boolean;
  totalPieces: number;
}): PetMood {
  if (params.activeFiring) return 'excited';
  if (params.kilnReady) return 'happy';
  if (params.dryingTooLong || params.scrapOverflow) return 'worried';
  if (params.isRestDay) return 'cozy';
  if (params.totalPieces === 0) return 'sleepy';
  return 'focused';
}

export const PAT_REACTIONS = [
  'Purrr… 🐾',
  '*happy wiggle* 🌀',
  'You get me! 🫶',
  '*tail wag* ✨',
  'Warm and fuzzy 🧸',
  '*does a little spin* 🪆',
];
