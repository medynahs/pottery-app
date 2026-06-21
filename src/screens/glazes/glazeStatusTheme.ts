import type { GlazeStatus } from '@/src/screens/glazes/types';

export type GlazeStatusOrbTheme = {
  /** Soft outer ring on the frosted badge */
  ring: string;
  /** Frosted pill behind the orb */
  shell: string;
  shellBorder: string;
  /** Main glaze gradient (top → bottom) */
  gradient: [string, string];
  /** Inner glow tint */
  glow: string;
  /** Specular highlight */
  shine: string;
  /** Tiny accent dot, like a bubble in the bucket */
  speck: string;
};

/** Whimsical pottery-studio palette for glaze status orbs. */
export const GLAZE_STATUS_ORB_THEME: Record<GlazeStatus, GlazeStatusOrbTheme> = {
  works_great: {
    ring: 'rgba(72, 160, 120, 0.55)',
    shell: 'rgba(240, 255, 248, 0.96)',
    shellBorder: 'rgba(134, 197, 150, 0.65)',
    gradient: ['#B8F0D4', '#4CBF8A'],
    glow: 'rgba(184, 240, 212, 0.55)',
    shine: 'rgba(255, 255, 255, 0.88)',
    speck: 'rgba(255, 248, 220, 0.95)',
  },
  experimental: {
    ring: 'rgba(220, 150, 55, 0.55)',
    shell: 'rgba(255, 251, 235, 0.96)',
    shellBorder: 'rgba(245, 200, 120, 0.7)',
    gradient: ['#FFE9A8', '#F5A623'],
    glow: 'rgba(255, 233, 168, 0.6)',
    shine: 'rgba(255, 255, 255, 0.9)',
    speck: 'rgba(255, 180, 120, 0.85)',
  },
  failed: {
    ring: 'rgba(210, 110, 95, 0.5)',
    shell: 'rgba(255, 245, 242, 0.96)',
    shellBorder: 'rgba(240, 170, 155, 0.65)',
    gradient: ['#FFCAB8', '#E87868'],
    glow: 'rgba(255, 202, 184, 0.55)',
    shine: 'rgba(255, 255, 255, 0.85)',
    speck: 'rgba(255, 220, 210, 0.9)',
  },
};
