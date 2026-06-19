import {
  Award,
  BookOpen,
  Camera,
  Crown,
  Disc,
  Flame,
  FlaskConical,
  Gem,
  Gift,
  Hammer,
  Layers,
  Medal,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Trophy,
} from 'lucide-react-native';
import type React from 'react';
import type { Firing } from '@/src/types/kiln';
import type { Piece } from '@/src/types/pieces';

export type BadgeIconComponent = React.ComponentType<{ size?: number; color?: string }>;

export interface BadgeContext {
  totalPieces: number;
  finishedPieces: number;
  glazedPieces: number;
  bisqueFirings: number;
  glazeFirings: number;
  totalFirings: number;
  piecesWithNotes: number;
  failedPieces: number;
  giftedPieces: number;
  wheelPieces: number;
  handBuiltPieces: number;
  piecesWithPhoto: number;
  soldPieces: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  icon: BadgeIconComponent;
  iconColor: string;
  bg: string;
  border: string;
  current: (ctx: BadgeContext) => number;
  target: number;
}

export const BADGE_REGISTRY: BadgeDef[] = [
  {
    id: 'first-fire',
    name: 'First Fire',
    desc: '1 bisque firing',
    icon: Flame,
    iconColor: 'hsl(39 57% 51%)',
    bg: 'bg-primary/10',
    border: 'border-primary/25',
    current: (ctx) => ctx.bisqueFirings,
    target: 1,
  },
  {
    id: 'first-glaze',
    name: 'First Glaze',
    desc: '1 glaze firing',
    icon: Gem,
    iconColor: 'hsl(200 75% 48%)',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    current: (ctx) => ctx.glazeFirings,
    target: 1,
  },
  {
    id: 'kiln-master',
    name: 'Kiln Master',
    desc: '25 firings',
    icon: Trophy,
    iconColor: 'hsl(38 80% 50%)',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    current: (ctx) => ctx.totalFirings,
    target: 25,
  },
  {
    id: 'glaze-alchemist',
    name: 'Glaze Alchemist',
    desc: '10 glaze firings',
    icon: FlaskConical,
    iconColor: 'hsl(168 60% 40%)',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    current: (ctx) => ctx.glazeFirings,
    target: 10,
  },
  {
    id: 'centering',
    name: 'Centering',
    desc: '50 pieces made',
    icon: Layers,
    iconColor: 'hsl(213 80% 55%)',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    current: (ctx) => ctx.totalPieces,
    target: 50,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    desc: '100 pieces made',
    icon: Medal,
    iconColor: 'hsl(44 80% 46%)',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    current: (ctx) => ctx.totalPieces,
    target: 100,
  },
  {
    id: 'prolific',
    name: 'Prolific',
    desc: '150 pieces made',
    icon: TrendingUp,
    iconColor: 'hsl(145 50% 45%)',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    current: (ctx) => ctx.totalPieces,
    target: 150,
  },
  {
    id: 'studio-veteran',
    name: 'Studio Veteran',
    desc: '300 pieces made',
    icon: Crown,
    iconColor: 'hsl(38 90% 42%)',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    current: (ctx) => ctx.totalPieces,
    target: 300,
  },
  {
    id: 'wheel-warrior',
    name: 'Wheel Warrior',
    desc: '25 wheel-thrown pieces',
    icon: Disc,
    iconColor: 'hsl(213 65% 50%)',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    current: (ctx) => ctx.wheelPieces,
    target: 25,
  },
  {
    id: 'hand-builder',
    name: 'Hand Builder',
    desc: '25 hand-built pieces',
    icon: Hammer,
    iconColor: 'hsl(28 55% 45%)',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    current: (ctx) => ctx.handBuiltPieces,
    target: 25,
  },
  {
    id: 'glazing-artist',
    name: 'Glazing Artist',
    desc: '50 pieces glazed',
    icon: Star,
    iconColor: 'hsl(270 60% 55%)',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    current: (ctx) => ctx.glazedPieces,
    target: 50,
  },
  {
    id: 'finisher',
    name: 'Finisher',
    desc: '30 pieces finished',
    icon: Award,
    iconColor: 'hsl(100 40% 45%)',
    bg: 'bg-green-50',
    border: 'border-green-200',
    current: (ctx) => ctx.finishedPieces,
    target: 30,
  },
  {
    id: 'record-keeper',
    name: 'Record Keeper',
    desc: '10 pieces with notes',
    icon: BookOpen,
    iconColor: 'hsl(213 70% 45%)',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    current: (ctx) => ctx.piecesWithNotes,
    target: 10,
  },
  {
    id: 'photo-story',
    name: 'Photo Story',
    desc: '10 pieces with photos',
    icon: Camera,
    iconColor: 'hsl(240 30% 50%)',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    current: (ctx) => ctx.piecesWithPhoto,
    target: 10,
  },
  {
    id: 'resilient',
    name: 'Resilient',
    desc: '5 pieces failed',
    icon: Sparkles,
    iconColor: 'hsl(340 75% 50%)',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    current: (ctx) => ctx.failedPieces,
    target: 5,
  },
  {
    id: 'first-sale',
    name: 'First Sale',
    desc: '1 piece sold',
    icon: Tag,
    iconColor: 'hsl(145 55% 42%)',
    bg: 'bg-green-50',
    border: 'border-green-100',
    current: (ctx) => ctx.soldPieces,
    target: 1,
  },
  {
    id: 'market-ready',
    name: 'Market Ready',
    desc: '10 pieces sold',
    icon: ShoppingBag,
    iconColor: 'hsl(145 55% 35%)',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    current: (ctx) => ctx.soldPieces,
    target: 10,
  },
  {
    id: 'giver',
    name: 'Giver',
    desc: '15 pieces gifted',
    icon: Gift,
    iconColor: 'hsl(310 60% 55%)',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    current: (ctx) => ctx.giftedPieces,
    target: 15,
  },
];

export const PROFILE_TITLES: { min: number; title: string }[] = [
  { min: 0, title: 'Clay Beginner' },
  { min: 1, title: 'First Thrower' },
  { min: 3, title: 'Apprentice Potter' },
  { min: 5, title: 'Craft Artisan' },
  { min: 8, title: 'Skilled Potter' },
  { min: 12, title: 'Studio Craftsman' },
  { min: 15, title: 'Master Potter' },
  { min: 18, title: 'Studio Legend' },
];

export function buildBadgeContext(pieces: Piece[], firings: Firing[]): BadgeContext {
  return {
    totalPieces: pieces.length,
    finishedPieces: pieces.filter((p) => p.stage === 'finished').length,
    glazedPieces: pieces.filter((p) => ['glazing', 'glaze-fired'].includes(p.stage)).length,
    bisqueFirings: firings.filter((f) => f.type === 'bisque').length,
    glazeFirings: firings.filter((f) => f.type === 'glaze').length,
    totalFirings: firings.length,
    piecesWithNotes: pieces.filter((p) => p.notes && p.notes.trim().length > 0).length,
    failedPieces: pieces.filter((p) => p.stage === 'cemetery' || ['cracked', 'warped'].includes(p.status ?? '')).length,
    giftedPieces: pieces.filter((p) => p.status === 'gifted').length,
    wheelPieces: pieces.filter((p) => p.formingMethod === 'wheel-thrown' || p.formingMethod === 'thrown-and-altered').length,
    handBuiltPieces: pieces.filter((p) => ['coiled', 'pinched', 'slab-built'].includes(p.formingMethod ?? '')).length,
    piecesWithPhoto: pieces.filter((p) => !!(p.photo || p.imgUrl)).length,
    soldPieces: pieces.filter((p) => p.status === 'sold').length,
  };
}

export function countEarnedBadges(ctx: BadgeContext): number {
  return BADGE_REGISTRY.filter((badge) => badge.current(ctx) >= badge.target).length;
}

export function computeBadgeStates(ctx: BadgeContext) {
  return BADGE_REGISTRY.map((badge) => {
    const current = badge.current(ctx);
    const unlocked = current >= badge.target;
    const progress = Math.min(1, current / badge.target);
    return { ...badge, current, unlocked, progress };
  });
}

export function getTitleForBadges(earned: number) {
  let current = PROFILE_TITLES[0];
  for (const title of PROFILE_TITLES) {
    if (earned >= title.min) current = title;
  }
  return current;
}

export function getNextTitle(earned: number) {
  for (const title of PROFILE_TITLES) {
    if (earned < title.min) return title;
  }
  return null;
}
