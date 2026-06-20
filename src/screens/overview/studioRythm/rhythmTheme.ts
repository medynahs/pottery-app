/** Warm pottery palette — matches SetupModeSection and app browns */
export const RHYTHM_BROWN = {
  gradientStart: '#B86A3C',
  gradientEnd: '#7A4022',
  heroText: '#FFF7EC',
  heroMuted: 'rgba(255, 244, 224, 0.82)',
  heroBadge: 'rgba(0, 0, 0, 0.18)',
  progressFill: '#F2C25E',
  progressTrack: 'rgba(0, 0, 0, 0.20)',
  ink: 'hsl(24 55% 22%)',
  inkSoft: 'hsl(24 35% 38%)',
  inkMuted: 'hsl(32 28% 44%)',
  surface: 'hsl(40 50% 99%)',
  surfaceBorder: 'hsl(34 34% 84%)',
  iconBg: 'hsl(35 48% 91%)',
  iconColor: 'hsl(24 50% 32%)',
  accent: 'hsl(39 57% 51%)',
  accentDark: 'hsl(24 50% 30%)',
  cardShadow: '#3f2a12',
} as const;

export const RHYTHM_SECTIONS = {
  schedule: {
    label: 'Weekly schedule',
    hint: 'Which days you throw, trim, and glaze',
    iconColor: RHYTHM_BROWN.iconColor,
    iconBg: RHYTHM_BROWN.iconBg,
  },
  drying: {
    label: 'Drying timers',
    hint: 'When trim and bisque reminders kick in',
    iconColor: 'hsl(35 65% 38%)',
    iconBg: 'hsl(38 55% 92%)',
  },
  events: {
    label: 'Events',
    hint: 'Markets, shipping days, workshops',
    iconColor: 'hsl(24 45% 35%)',
    iconBg: 'hsl(34 40% 90%)',
  },
  rituals: {
    label: 'Studio rituals',
    hint: 'Weekly habits like cleanup or glaze mixing',
    iconColor: 'hsl(30 50% 32%)',
    iconBg: 'hsl(36 45% 91%)',
  },
} as const;
