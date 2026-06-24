import type { EventCategoryId, Ritual, StageKey } from './studioRhythm';
import {
  Camera,
  Clock,
  DoorOpen,
  Droplets,
  Flame,
  GraduationCap,
  Hammer,
  Layers,
  Lightbulb,
  Package,
  Palette,
  RefreshCw,
  Scissors,
  Sparkles,
  Star,
  Store,
  Thermometer,
  Wind,
} from 'lucide-react-native';
import type { ComponentType } from 'react';

export type RhythmIconComponent = ComponentType<{ size: number; color: string }>;

export const STAGE_RHYTHM_ICONS: Record<StageKey, RhythmIconComponent> = {
  throw: Hammer,
  trim: Scissors,
  glaze: Sparkles,
  bisque: Flame,
};

export const EVENT_CATEGORY_ICONS: Record<EventCategoryId, RhythmIconComponent> = {
  market: Store,
  shipping: Package,
  photography: Camera,
  glaze_mixing: Palette,
  restock: RefreshCw,
  workshop: GraduationCap,
  open_studio: DoorOpen,
  custom: Star,
};

export const DRYING_TIMER_ICONS = {
  leatherHard: Droplets,
  boneDry: Wind,
  glazeDry: Sparkles,
  bisqueCool: Thermometer,
} as const;

export const RITUAL_PICKABLE_ICONS: Array<{ key: string; Icon: RhythmIconComponent }> = [
  { key: 'palette', Icon: Palette },
  { key: 'sparkles', Icon: Sparkles },
  { key: 'camera', Icon: Camera },
  { key: 'layers', Icon: Layers },
  { key: 'hammer', Icon: Hammer },
  { key: 'scissors', Icon: Scissors },
  { key: 'flame', Icon: Flame },
  { key: 'droplets', Icon: Droplets },
  { key: 'package', Icon: Package },
  { key: 'star', Icon: Star },
  { key: 'clock', Icon: Clock },
  { key: 'lightbulb', Icon: Lightbulb },
];

export const RITUAL_PICKABLE_ICONS_MAP: Record<string, RhythmIconComponent> = Object.fromEntries(
  RITUAL_PICKABLE_ICONS.map(({ key, Icon }) => [key, Icon])
);

const LEGACY_RITUAL_EMOJI_ICON: Record<string, string> = {
  '🧪': 'palette',
  '🧹': 'sparkles',
  '📷': 'camera',
  '🔬': 'layers',
  '🏺': 'hammer',
  '✂️': 'scissors',
  '🖌️': 'sparkles',
  '🔥': 'flame',
  '💧': 'droplets',
  '📦': 'package',
  '⭐': 'star',
  '🎨': 'palette',
};

const DEFAULT_RITUAL_ICON_KEYS: Record<string, string> = {
  'ritual-glaze-mixing': 'palette',
  'ritual-studio-cleanup': 'sparkles',
  'ritual-photo-shoot': 'camera',
  'ritual-test-tiles': 'layers',
};

export function migrateStudioRituals(rituals: Array<Ritual & { emoji?: string }>): Ritual[] {
  return rituals.map(({ emoji, ...ritual }) => {
    if (ritual.iconKey && RITUAL_PICKABLE_ICONS_MAP[ritual.iconKey]) {
      return ritual;
    }
    const iconKey = (emoji && LEGACY_RITUAL_EMOJI_ICON[emoji])
      ?? DEFAULT_RITUAL_ICON_KEYS[ritual.id]
      ?? 'star';
    return { ...ritual, iconKey };
  });
}

export function resolveRitualIconKey(ritual: Pick<Ritual, 'id' | 'iconKey'>): string {
  if (ritual.iconKey && RITUAL_PICKABLE_ICONS_MAP[ritual.iconKey]) return ritual.iconKey;
  if (DEFAULT_RITUAL_ICON_KEYS[ritual.id]) return DEFAULT_RITUAL_ICON_KEYS[ritual.id];
  return 'star';
}

export function resolveRitualIcon(ritual: Pick<Ritual, 'id' | 'iconKey'>): RhythmIconComponent {
  return RITUAL_PICKABLE_ICONS_MAP[resolveRitualIconKey(ritual)] ?? Star;
}
