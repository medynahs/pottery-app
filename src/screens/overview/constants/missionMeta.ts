import { CalendarDays, Flame, Hammer, Scissors, Sparkles, Trophy } from 'lucide-react-native';
import React from 'react';

type MissionIcon = React.ComponentType<{ size?: number; color?: string }>;

export const MISSION_META: Record<string, { title: string; Icon: MissionIcon; iconColor: string; chipClassName: string }> = {
  trim: { title: 'Trim Watch', Icon: Scissors, iconColor: 'hsl(39 57% 51%)', chipClassName: 'bg-primary/10' },
  reclaim: { title: 'Reclaim Loop', Icon: Hammer, iconColor: 'hsl(35 65% 42%)', chipClassName: 'bg-amber-50' },
  'wheel-practice': { title: 'Wheel Focus', Icon: Sparkles, iconColor: 'hsl(270 55% 52%)', chipClassName: 'bg-purple-50' },
  'kiln-check': { title: 'Kiln Check', Icon: Flame, iconColor: 'hsl(16 78% 52%)', chipClassName: 'bg-red-50' },
  'upcoming-event': { title: 'Calendar Nudge', Icon: CalendarDays, iconColor: 'hsl(213 70% 45%)', chipClassName: 'bg-blue-50' },
  'goal-focus': { title: 'Weekly Goal', Icon: Trophy, iconColor: 'hsl(44 70% 45%)', chipClassName: 'bg-yellow-50' },
};
