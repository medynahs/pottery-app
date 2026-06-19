import { BrandColors, Colors } from '@/src/constants/theme';

/** Shared journal palette — aligned with app theme tokens. */
export const JournalTheme = {
  shellGradient: ['#2D221C', '#4C3226', '#6C4433'] as const,
  headerIconBg: 'rgba(255, 244, 228, 0.12)',
  headerText: '#F4DFC0',
  headerSubtext: 'rgba(255, 244, 228, 0.65)',

  pageBackground: '#F3E4CB',
  pageBorder: BrandColors.primaryMuted,
  titleInk: '#9C4929',
  bodyInk: Colors.light.foreground,
  mutedInk: Colors.light.mutedForeground,

  cardBackground: 'rgba(255, 252, 245, 0.95)',
  cardBorder: 'hsl(34 25% 82%)',
  tileBackground: 'rgba(255,251,242,0.93)',
  tileBorder: '#DFC6A0',

  notesGradient: ['rgba(215, 180, 141, 0.26)', 'rgba(255,255,255,0.12)'] as const,
  placeholder: BrandColors.primaryMuted,

  navButtonActive: 'rgba(92, 60, 43, 0.82)',
  navButtonDisabled: 'rgba(120, 95, 76, 0.2)',
  navIconActive: '#FFF5E7',
  navIconDisabled: '#B89A82',
  pageIndicatorBg: 'rgba(87, 57, 41, 0.82)',

  polaroidPlaceholder: ['#F5E7D1', '#E7C9A4'] as const,
  polaroidLabel: BrandColors.primaryMuted,
  cameraOverlay: 'rgba(71, 44, 31, 0.72)',

  /** Cover spread — editorial title page */
  coverWash: ['rgba(215, 180, 141, 0.22)', 'rgba(255, 252, 245, 0)'] as const,
  coverRule: 'rgba(156, 73, 41, 0.22)',
  coverMastheadInk: BrandColors.primaryMuted,
  coverSpecLabel: Colors.light.mutedForeground,
  coverNotesBorder: BrandColors.primary,
  coverMemorialBg: 'rgba(60, 45, 38, 0.08)',
  coverMemorialBorder: 'rgba(60, 45, 38, 0.18)',
  /** Cover title — brand gold on parchment */
  coverTitleColor: BrandColors.primary,
  coverTitleAccent: BrandColors.primaryMuted,
  /** Stage tab / label accents — warm studio palette harmonized with primary gold. */
  pageAccents: [
    BrandColors.primary,
    'hsl(38 55% 55%)',
    Colors.light.secondary,
    'hsl(210 35% 55%)',
    'hsl(350 40% 60%)',
    BrandColors.primaryMuted,
  ],
} as const;
