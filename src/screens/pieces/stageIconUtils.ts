import type { StageConfig } from '@/src/hooks/useStageConfig';
import {
  ArchiveX,
  Bell,
  Clock,
  Database,
  Droplets,
  Flame,
  Globe,
  Hammer,
  Layers,
  Lightbulb,
  Moon,
  PackageCheck,
  Palette,
  Scissors,
  Shield,
  Sparkles,
  Star,
  Thermometer,
  Trophy,
  Wind,
  Zap,
} from 'lucide-react-native';
import type { ComponentType } from 'react';

type IconComp = ComponentType<{ size: number; color: string }>;

/** Icons for built-in stage IDs (including 'all') */
export const STAGE_ICONS: Record<string, IconComp> = {
  all:            PackageCheck,
  idea:           Lightbulb,
  forming:        Hammer,
  'leather-hard': Droplets,
  trimming:       Scissors,
  drying:         Wind,
  'bone-dry':     Wind,
  bisque:         Flame,
  glazing:        Sparkles,
  'glaze-fired':  Zap,
  finished:       Star,
  cemetery:       ArchiveX,
};

/** Full icon palette available for custom stage picking */
export const PICKABLE_ICONS: Array<{ key: string; Icon: IconComp }> = [
  { key: 'lightbulb',   Icon: Lightbulb   },
  { key: 'hammer',      Icon: Hammer      },
  { key: 'droplets',    Icon: Droplets    },
  { key: 'scissors',    Icon: Scissors    },
  { key: 'wind',        Icon: Wind        },
  { key: 'flame',       Icon: Flame       },
  { key: 'sparkles',    Icon: Sparkles    },
  { key: 'zap',         Icon: Zap         },
  { key: 'star',        Icon: Star        },
  { key: 'palette',     Icon: Palette     },
  { key: 'layers',      Icon: Layers      },
  { key: 'clock',       Icon: Clock       },
  { key: 'thermometer', Icon: Thermometer },
  { key: 'trophy',      Icon: Trophy      },
  { key: 'moon',        Icon: Moon        },
  { key: 'shield',      Icon: Shield      },
  { key: 'globe',       Icon: Globe       },
  { key: 'bell',        Icon: Bell        },
  { key: 'database',    Icon: Database    },
  { key: 'archive',     Icon: ArchiveX    },
];

export const PICKABLE_ICONS_MAP: Record<string, IconComp> =
  Object.fromEntries(PICKABLE_ICONS.map(({ key, Icon }) => [key, Icon]));

/** Resolve the display icon for any StageConfig (built-in or custom) */
export function resolveStageIcon(stage: StageConfig): IconComp {
  if (stage.isCustom && stage.iconKey) {
    return PICKABLE_ICONS_MAP[stage.iconKey] ?? Lightbulb;
  }
  return STAGE_ICONS[stage.id] ?? Lightbulb;
}
