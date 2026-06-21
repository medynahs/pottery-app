import type { AppModule } from '@/src/store/appStore';
import { BookOpen, Box, Flame, Users } from 'lucide-react-native';

/** Expo tab route, file remains `app/(tabs)/library.tsx`. */
export const GLAZE_ATLAS_TAB_ROUTE = '/(tabs)/library' as const;

export const APP_MODULE_LABELS: Record<AppModule, string> = {
  overview: 'Overview',
  pieces: 'Pieces',
  kiln: 'Kiln',
  'glaze-atlas': 'Glaze Atlas',
  community: 'Community',
};

export const CUSTOMIZABLE_MODULE_OPTIONS: Array<{
  id: AppModule;
  label: string;
  description: string;
  icon: typeof Box;
  iconColor: string;
  iconBg: string;
}> = [
  {
    id: 'pieces',
    label: 'Pieces',
    description: 'Track pieces from forming to finished.',
    icon: Box,
    iconColor: 'hsl(24 40% 45%)',
    iconBg: 'bg-stone-100',
  },
  {
    id: 'kiln',
    label: 'Kiln',
    description: 'Firing queues, logs, and kiln context.',
    icon: Flame,
    iconColor: 'hsl(39 57% 51%)',
    iconBg: 'bg-primary/10',
  },
  {
    id: 'glaze-atlas',
    label: 'Glaze Atlas',
    description: 'Log glaze batches, test tiles, and version history.',
    icon: BookOpen,
    iconColor: 'hsl(39 57% 45%)',
    iconBg: 'bg-amber-50',
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Share progress and learn from others.',
    icon: Users,
    iconColor: 'hsl(135 45% 40%)',
    iconBg: 'bg-green-50',
  },
];
