import type { LucideIcon } from 'lucide-react-native';
import {
  BookOpen,
  FlaskConical,
  HelpCircle,
  Pin,
  Sparkles,
  Flame,
} from 'lucide-react-native';
import { ANALYTICS_THEME } from '@/src/screens/analytics/analyticsTheme';

/** Profile tabs share the warm studio palette from Analytics. */
export const PROFILE_THEME = {
  ...ANALYTICS_THEME,
  heroGradient: ['#8B5E3C', '#5C3820'] as const,
  heroGradientSoft: ['#A8744F', '#6E4528'] as const,
} as const;

export const JOURNEY_ACCENTS = {
  hero: { bg: 'hsl(28 48% 28%)', color: PROFILE_THEME.heroText, border: 'rgba(255,244,224,0.2)' },
  stats: { bg: 'hsl(38 55% 92%)', color: 'hsl(24 50% 32%)', border: 'hsl(34 34% 84%)' },
  badges: { bg: 'hsl(44 70% 92%)', color: 'hsl(35 65% 32%)', border: 'hsl(40 50% 80%)' },
  timeline: { bg: 'hsl(200 40% 92%)', color: 'hsl(200 45% 32%)', border: 'hsl(200 30% 82%)' },
} as const;

export type PostKindStyle = {
  Icon: LucideIcon;
  bg: string;
  text: string;
  border: string;
  accent: string;
};

export const POST_KIND_STYLES: Record<string, PostKindStyle> = {
  'Piece journal': {
    Icon: BookOpen,
    bg: 'hsl(38 55% 92%)',
    text: 'hsl(24 50% 32%)',
    border: 'hsl(34 34% 84%)',
    accent: '#B86A3C',
  },
  'Firing complete': {
    Icon: Flame,
    bg: 'hsl(18 60% 92%)',
    text: 'hsl(12 55% 38%)',
    border: 'hsl(20 45% 82%)',
    accent: '#D4644A',
  },
  'Ask the community': {
    Icon: HelpCircle,
    bg: 'hsl(213 55% 92%)',
    text: 'hsl(213 50% 35%)',
    border: 'hsl(213 35% 82%)',
    accent: '#5B8FA8',
  },
  'Studio notice': {
    Icon: Pin,
    bg: 'hsl(280 30% 94%)',
    text: 'hsl(280 35% 38%)',
    border: 'hsl(280 25% 84%)',
    accent: '#9B7BB8',
  },
  'Glaze recipe': {
    Icon: FlaskConical,
    bg: 'hsl(142 35% 92%)',
    text: 'hsl(142 40% 30%)',
    border: 'hsl(142 30% 82%)',
    accent: '#6B9E78',
  },
  Update: {
    Icon: Sparkles,
    bg: 'hsl(38 45% 95%)',
    text: 'hsl(32 28% 44%)',
    border: 'hsl(34 30% 84%)',
    accent: '#C98352',
  },
};

export function postKindStyle(label: string | null): PostKindStyle {
  if (!label) return POST_KIND_STYLES.Update;
  return POST_KIND_STYLES[label] ?? POST_KIND_STYLES.Update;
}
