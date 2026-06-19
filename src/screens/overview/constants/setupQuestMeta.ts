import type { SetupQuestKey } from '@/src/screens/overview/setupQuests/generateSetupQuests';
import { Calculator, CalendarDays, Database, Flame, Hammer, Layers, LayoutGrid, Plus, Sparkles, Zap } from 'lucide-react-native';
import React from 'react';

type MissionIcon = React.ComponentType<{ size?: number; color?: string }>;

export const SETUP_QUEST_META: Record<SetupQuestKey, { Icon: MissionIcon; iconColor: string; iconBg: string }> = {
  'customize-stages': { Icon: Layers, iconColor: 'hsl(213 55% 42%)', iconBg: 'hsl(213 50% 92%)' },
  'set-clay-bodies': { Icon: Database, iconColor: 'hsl(32 45% 38%)', iconBg: 'hsl(35 46% 88%)' },
  'set-bisque-cone': { Icon: Flame, iconColor: 'hsl(24 65% 42%)', iconBg: 'hsl(24 60% 90%)' },
  'set-glaze-cone': { Icon: Zap, iconColor: 'hsl(39 57% 45%)', iconBg: 'hsl(44 70% 88%)' },
  'set-pricing': { Icon: Calculator, iconColor: 'hsl(32 40% 38%)', iconBg: 'hsl(35 42% 88%)' },
  'configure-modules': { Icon: LayoutGrid, iconColor: 'hsl(32 40% 38%)', iconBg: 'hsl(35 42% 88%)' },
  'studio-rhythm': { Icon: CalendarDays, iconColor: 'hsl(160 40% 38%)', iconBg: 'hsl(150 35% 90%)' },
  'add-kiln': { Icon: Flame, iconColor: 'hsl(16 65% 42%)', iconBg: 'hsl(16 60% 90%)' },
  'log-first-piece': { Icon: Plus, iconColor: 'hsl(130 40% 36%)', iconBg: 'hsl(130 35% 90%)' },
  'create-glaze-recipe': { Icon: Sparkles, iconColor: 'hsl(270 40% 48%)', iconBg: 'hsl(270 35% 92%)' },
};
