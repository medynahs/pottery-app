import type { LucideIcon } from 'lucide-react-native';
import {
  Flame,
  Gift,
  Layers,
  ShoppingBag,
  Sparkles,
  Star,
  Flower2,
} from 'lucide-react-native';
import { PROFILE_THEME } from './profileTheme';

export const JOURNEY_PAGE = {
  bg: PROFILE_THEME.pageBg,
  parchment: '#FFFBF2',
  parchmentBorder: '#E8D9BE',
  scrollShadow: '#3a2310',
  heroGradient: ['#B86A3C', '#6B3A1F', '#4A2818'] as const,
  heroGlow: 'rgba(255, 247, 236, 0.12)',
  achievementsGradient: ['#F5E8C8', '#E8D4A8', '#D4B88A'] as const,
  goldRing: '#F2C25E',
  earnedGlow: 'rgba(242, 194, 94, 0.35)',
} as const;

export const MILESTONE_VISUALS: Record<
  string,
  { Icon: LucideIcon; accent: string; soft: string }
> = {
  'journey-started': { Icon: Sparkles, accent: '#6B9E78', soft: 'hsl(142 35% 92%)' },
  'first-finished': { Icon: Star, accent: '#C98352', soft: 'hsl(38 55% 92%)' },
  'first-bisque': { Icon: Flame, accent: '#D4644A', soft: 'hsl(18 60% 92%)' },
  'first-glaze': { Icon: Flame, accent: '#5B8FA8', soft: 'hsl(200 40% 92%)' },
  'first-sale': { Icon: ShoppingBag, accent: '#4A9460', soft: 'hsl(142 35% 92%)' },
  'first-gift': { Icon: Gift, accent: '#B87BB8', soft: 'hsl(280 30% 94%)' },
  'first-cemetery': { Icon: Flower2, accent: '#9B8B7A', soft: 'hsl(32 20% 90%)' },
};

export function milestoneVisual(id: string) {
  if (MILESTONE_VISUALS[id]) return MILESTONE_VISUALS[id];
  if (id.startsWith('pieces-')) {
    return { Icon: Layers, accent: '#6B8FC4', soft: 'hsl(213 55% 92%)' };
  }
  if (id.startsWith('firings-')) {
    return { Icon: Flame, accent: '#D4A843', soft: 'hsl(44 70% 92%)' };
  }
  return { Icon: Sparkles, accent: PROFILE_THEME.accent, soft: PROFILE_THEME.accentSoft };
}

export const STAT_STAMP_STYLES = {
  clay: { accent: '#B86A3C', soft: 'hsl(38 55% 92%)', border: 'hsl(34 34% 84%)' },
  finish: { accent: '#6B9E78', soft: 'hsl(142 35% 92%)', border: 'hsl(142 30% 82%)' },
  kiln: { accent: '#D4644A', soft: 'hsl(18 60% 92%)', border: 'hsl(20 45% 82%)' },
  atlas: { accent: '#5B8FA8', soft: 'hsl(200 40% 92%)', border: 'hsl(200 30% 82%)' },
} as const;
