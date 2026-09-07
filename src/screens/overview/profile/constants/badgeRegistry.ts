import { getGlazeRootId } from '@/src/screens/glazes/glazeVersionUtils';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import type { DailyMissionCompletion } from '@/src/store/appStore';
import type { Firing, Kiln } from '@/src/types/kiln';
import type { Piece } from '@/src/types/pieces';
import {
    Archive,
    ArchiveX,
    Award,
    BookOpen,
    CalendarCheck,
    Camera,
    Coins,
    Crown,
    Disc,
    Droplets,
    Flame,
    FlaskConical,
    Gem,
    Gift,
    Hammer,
    Heart,
    Layers,
    Medal,
    MessageCircle,
    Mountain,
    Palette,
    Scroll,
    ShoppingBag,
    Sparkles,
    Star,
    Store,
    Tag,
    TrendingUp,
    Trophy,
    Users,
    Wrench,
    Zap,
} from 'lucide-react-native';
import type React from 'react';

export type BadgeIconComponent = React.ComponentType<{ size?: number; color?: string }>;

export type BadgeCategory =
  | 'kiln'
  | 'atlas'
  | 'volume'
  | 'technique'
  | 'studio'
  | 'memorial'
  | 'sales'
  | 'mastery'
  | 'consistency'
  | 'community';

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  kiln: 'Kiln & firing',
  atlas: 'Glaze atlas',
  volume: 'Piece milestones',
  technique: 'Technique',
  studio: 'Studio habits',
  memorial: 'Memorial garden',
  sales: 'Sales & sharing',
  mastery: 'Mastery',
  consistency: 'Studio rhythm',
  community: 'Community',
};

export const BADGE_CATEGORY_ORDER: BadgeCategory[] = [
  'kiln',
  'atlas',
  'volume',
  'technique',
  'studio',
  'memorial',
  'sales',
  'mastery',
  'consistency',
  'community',
];

export interface BadgeContext {
  totalPieces: number;
  finishedPieces: number;
  glazedPieces: number;
  bisqueFirings: number;
  glazeFirings: number;
  lusterFirings: number;
  highFireFirings: number;
  totalFirings: number;
  piecesWithNotes: number;
  failedPieces: number;
  giftedPieces: number;
  wheelPieces: number;
  handBuiltPieces: number;
  slabPieces: number;
  coilPieces: number;
  pinchPieces: number;
  piecesWithPhoto: number;
  soldPieces: number;
  tradePieces: number;
  exhibitionPieces: number;
  pricedPieces: number;
  totalRevenue: number;
  atlasRecipeFamilies: number;
  glazeTests: number;
  glazeLinkedPieces: number;
  glazeOutcomesLogged: number;
  glazeOutcomeSuccesses: number;
  cemeteryPieces: number;
  piecesWithEpitaph: number;
  distinctClayBodies: number;
  distinctForms: number;
  studioQueueSubmissions: number;
  kilnMaintenanceLogs: number;
  missionDaysCompleted: number;
  totalMissionsCompleted: number;
  longestMissionStreak: number;
  communityPostsCreated: number;
  challengeEntriesSubmitted: number;
  challengeWins: number;
  clayFriendsCount: number;
}

export interface BadgeBuildExtras {
  glazeTests?: GlazeTestTile[];
  kilns?: Kiln[];
  dailyMissionCompletion?: DailyMissionCompletion;
  communityPostsCreated?: number;
  challengeEntriesSubmitted?: number;
  challengeWins?: number;
  clayFriendsCount?: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  category: BadgeCategory;
  icon: BadgeIconComponent;
  iconColor: string;
  bg: string;
  border: string;
  current: (ctx: BadgeContext) => number;
  target: number;
}

export type BadgeState = Omit<BadgeDef, 'current'> & {
  current: number;
  unlocked: boolean;
  progress: number;
};

function normStatus(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function hasStatus(piece: Piece, ...statuses: string[]): boolean {
  const status = normStatus(piece.status);
  return statuses.some((s) => normStatus(s) === status);
}

function formingIncludes(piece: Piece, needle: string): boolean {
  return (piece.formingMethod ?? '').toLowerCase().includes(needle.toLowerCase());
}

function countDistinct(values: (string | undefined)[]): number {
  return new Set(values.filter((v) => v && v.trim().length > 0)).size;
}

function isHighFireCone(cone: string): boolean {
  return /\bcone\s*10\b/i.test(cone) || /\b(?:^|\s)10(?:\s|$)/i.test(cone);
}

function countMissionDays(completion: DailyMissionCompletion): number {
  return Object.values(completion).filter((missions) => missions.length > 0).length;
}

function countTotalMissions(completion: DailyMissionCompletion): number {
  return Object.values(completion).reduce((sum, missions) => sum + missions.length, 0);
}

function longestMissionStreak(completion: DailyMissionCompletion): number {
  const keys = Object.keys(completion)
    .filter((key) => (completion[key]?.length ?? 0) > 0)
    .sort();
  if (keys.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < keys.length; i += 1) {
    const prev = new Date(keys[i - 1]);
    const next = new Date(keys[i]);
    const dayGap = Math.round((next.getTime() - prev.getTime()) / 86_400_000);
    if (dayGap === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function pieceIsPriced(piece: Piece): boolean {
  if (typeof piece.soldPrice === 'number' && piece.soldPrice > 0) return true;
  if (typeof piece.suggestedPrice === 'number' && piece.suggestedPrice > 0) return true;
  if (typeof piece.retailPriceTarget === 'number' && piece.retailPriceTarget > 0) return true;
  return Boolean(piece.price && piece.price.trim().length > 0);
}

export const BADGE_REGISTRY: BadgeDef[] = [
  // ── Kiln & firing ─────────────────────────────────────────────
  {
    id: 'first-fire',
    name: 'First Fire',
    desc: '1 bisque firing',
    category: 'kiln',
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
    category: 'kiln',
    icon: Gem,
    iconColor: 'hsl(200 75% 48%)',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    current: (ctx) => ctx.glazeFirings,
    target: 1,
  },
  {
    id: 'bisque-batch',
    name: 'Bisque Batch',
    desc: '5 bisque firings',
    category: 'kiln',
    icon: Flame,
    iconColor: 'hsl(35 65% 42%)',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    current: (ctx) => ctx.bisqueFirings,
    target: 5,
  },
  {
    id: 'double-digits',
    name: 'Double Digits',
    desc: '10 firings logged',
    category: 'kiln',
    icon: Zap,
    iconColor: 'hsl(38 80% 48%)',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    current: (ctx) => ctx.totalFirings,
    target: 10,
  },
  {
    id: 'glaze-alchemist',
    name: 'Glaze Alchemist',
    desc: '10 glaze firings',
    category: 'kiln',
    icon: FlaskConical,
    iconColor: 'hsl(168 60% 40%)',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    current: (ctx) => ctx.glazeFirings,
    target: 10,
  },
  {
    id: 'glaze-pro',
    name: 'Glaze Pro',
    desc: '25 glaze firings',
    category: 'kiln',
    icon: Sparkles,
    iconColor: 'hsl(200 70% 45%)',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    current: (ctx) => ctx.glazeFirings,
    target: 25,
  },
  {
    id: 'luster-flame',
    name: 'Luster Flame',
    desc: '1 luster firing',
    category: 'kiln',
    icon: Star,
    iconColor: 'hsl(310 60% 55%)',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    current: (ctx) => ctx.lusterFirings,
    target: 1,
  },
  {
    id: 'kiln-master',
    name: 'Kiln Master',
    desc: '25 firings',
    category: 'kiln',
    icon: Trophy,
    iconColor: 'hsl(38 80% 50%)',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    current: (ctx) => ctx.totalFirings,
    target: 25,
  },
  {
    id: 'firing-regular',
    name: 'Firing Regular',
    desc: '50 firings logged',
    category: 'kiln',
    icon: Medal,
    iconColor: 'hsl(24 55% 35%)',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    current: (ctx) => ctx.totalFirings,
    target: 50,
  },
  {
    id: 'century-kiln',
    name: 'Century Kiln',
    desc: '100 firings logged',
    category: 'kiln',
    icon: Crown,
    iconColor: 'hsl(38 90% 42%)',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    current: (ctx) => ctx.totalFirings,
    target: 100,
  },
  {
    id: 'kiln-caretaker',
    name: 'Kiln Caretaker',
    desc: '5 kiln maintenance logs',
    category: 'kiln',
    icon: Wrench,
    iconColor: 'hsl(32 28% 40%)',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    current: (ctx) => ctx.kilnMaintenanceLogs,
    target: 5,
  },

  // ── Glaze atlas ───────────────────────────────────────────────
  {
    id: 'atlas-starter',
    name: 'Atlas Starter',
    desc: '5 recipes saved in atlas',
    category: 'atlas',
    icon: Droplets,
    iconColor: 'hsl(200 75% 48%)',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    current: (ctx) => ctx.atlasRecipeFamilies,
    target: 5,
  },
  {
    id: 'test-driver',
    name: 'Test Driver',
    desc: '5 glaze test tiles logged',
    category: 'atlas',
    icon: FlaskConical,
    iconColor: 'hsl(168 55% 38%)',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    current: (ctx) => ctx.glazeTests,
    target: 5,
  },
  {
    id: 'atlas-curator',
    name: 'Atlas Curator',
    desc: '15 recipes saved in atlas',
    category: 'atlas',
    icon: BookOpen,
    iconColor: 'hsl(213 70% 45%)',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    current: (ctx) => ctx.atlasRecipeFamilies,
    target: 15,
  },
  {
    id: 'tile-collector',
    name: 'Tile Collector',
    desc: '20 glaze test tiles logged',
    category: 'atlas',
    icon: Layers,
    iconColor: 'hsl(200 65% 42%)',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    current: (ctx) => ctx.glazeTests,
    target: 20,
  },
  {
    id: 'atlas-master',
    name: 'Atlas Master',
    desc: '30 recipes saved in atlas',
    category: 'atlas',
    icon: Gem,
    iconColor: 'hsl(270 60% 55%)',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    current: (ctx) => ctx.atlasRecipeFamilies,
    target: 30,
  },

  // ── Piece milestones ──────────────────────────────────────────
  {
    id: 'first-piece',
    name: 'First Piece',
    desc: '1 piece in your studio',
    category: 'volume',
    icon: Heart,
    iconColor: 'hsl(350 65% 55%)',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    current: (ctx) => ctx.totalPieces,
    target: 1,
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    desc: '10 pieces made',
    category: 'volume',
    icon: Layers,
    iconColor: 'hsl(213 70% 55%)',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    current: (ctx) => ctx.totalPieces,
    target: 10,
  },
  {
    id: 'momentum',
    name: 'Momentum',
    desc: '25 pieces made',
    category: 'volume',
    icon: TrendingUp,
    iconColor: 'hsl(145 50% 45%)',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    current: (ctx) => ctx.totalPieces,
    target: 25,
  },
  {
    id: 'centering',
    name: 'Centering',
    desc: '50 pieces made',
    category: 'volume',
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
    category: 'volume',
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
    category: 'volume',
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
    category: 'volume',
    icon: Crown,
    iconColor: 'hsl(38 90% 42%)',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    current: (ctx) => ctx.totalPieces,
    target: 300,
  },

  // ── Technique ─────────────────────────────────────────────────
  {
    id: 'wheel-warrior',
    name: 'Wheel Warrior',
    desc: '25 wheel-thrown pieces',
    category: 'technique',
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
    category: 'technique',
    icon: Hammer,
    iconColor: 'hsl(28 55% 45%)',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    current: (ctx) => ctx.handBuiltPieces,
    target: 25,
  },
  {
    id: 'slab-specialist',
    name: 'Slab Specialist',
    desc: '15 slab-built pieces',
    category: 'technique',
    icon: Archive,
    iconColor: 'hsl(30 45% 42%)',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    current: (ctx) => ctx.slabPieces,
    target: 15,
  },
  {
    id: 'coil-builder',
    name: 'Coil Builder',
    desc: '15 coiled pieces',
    category: 'technique',
    icon: Scroll,
    iconColor: 'hsl(35 55% 40%)',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    current: (ctx) => ctx.coilPieces,
    target: 15,
  },
  {
    id: 'pinch-potter',
    name: 'Pinch Potter',
    desc: '15 pinched pieces',
    category: 'technique',
    icon: Heart,
    iconColor: 'hsl(350 55% 50%)',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    current: (ctx) => ctx.pinchPieces,
    target: 15,
  },
  {
    id: 'form-explorer',
    name: 'Form Explorer',
    desc: '5 distinct piece forms',
    category: 'technique',
    icon: Palette,
    iconColor: 'hsl(270 55% 50%)',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    current: (ctx) => ctx.distinctForms,
    target: 5,
  },

  // ── Studio habits ───────────────────────────────────────────────
  {
    id: 'glazing-artist',
    name: 'Glazing Artist',
    desc: '50 pieces glazed',
    category: 'studio',
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
    category: 'studio',
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
    category: 'studio',
    icon: BookOpen,
    iconColor: 'hsl(213 70% 45%)',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    current: (ctx) => ctx.piecesWithNotes,
    target: 10,
  },
  {
    id: 'deep-notes',
    name: 'Deep Notes',
    desc: '25 pieces with notes',
    category: 'studio',
    icon: BookOpen,
    iconColor: 'hsl(213 60% 40%)',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    current: (ctx) => ctx.piecesWithNotes,
    target: 25,
  },
  {
    id: 'photo-story',
    name: 'Photo Story',
    desc: '10 pieces with photos',
    category: 'studio',
    icon: Camera,
    iconColor: 'hsl(240 30% 50%)',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    current: (ctx) => ctx.piecesWithPhoto,
    target: 10,
  },
  {
    id: 'photo-journal',
    name: 'Photo Journal',
    desc: '25 pieces with photos',
    category: 'studio',
    icon: Camera,
    iconColor: 'hsl(240 35% 45%)',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    current: (ctx) => ctx.piecesWithPhoto,
    target: 25,
  },
  {
    id: 'glaze-linked',
    name: 'Glaze Linked',
    desc: '10 pieces linked to atlas glazes',
    category: 'studio',
    icon: Droplets,
    iconColor: 'hsl(200 70% 45%)',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    current: (ctx) => ctx.glazeLinkedPieces,
    target: 10,
  },
  {
    id: 'studio-queue',
    name: 'Studio Queue',
    desc: '1 piece submitted to studio firing',
    category: 'studio',
    icon: Store,
    iconColor: 'hsl(28 50% 42%)',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    current: (ctx) => ctx.studioQueueSubmissions,
    target: 1,
  },
  {
    id: 'resilient',
    name: 'Resilient',
    desc: '5 pieces failed',
    category: 'studio',
    icon: Sparkles,
    iconColor: 'hsl(340 75% 50%)',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    current: (ctx) => ctx.failedPieces,
    target: 5,
  },
  {
    id: 'learning-curve',
    name: 'Learning Curve',
    desc: '10 pieces failed',
    category: 'studio',
    icon: Sparkles,
    iconColor: 'hsl(340 65% 45%)',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    current: (ctx) => ctx.failedPieces,
    target: 10,
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    desc: '15 pieces failed — still showing up',
    category: 'studio',
    icon: Flame,
    iconColor: 'hsl(15 70% 50%)',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    current: (ctx) => ctx.failedPieces,
    target: 15,
  },

  // ── Memorial garden ─────────────────────────────────────────────
  {
    id: 'first-sacrifice',
    name: 'First Sacrifice',
    desc: '1 piece in the cemetery',
    category: 'memorial',
    icon: ArchiveX,
    iconColor: 'hsl(32 28% 44%)',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    current: (ctx) => ctx.cemeteryPieces,
    target: 1,
  },
  {
    id: 'memorial-keeper',
    name: 'Memorial Keeper',
    desc: '5 pieces in the cemetery',
    category: 'memorial',
    icon: ArchiveX,
    iconColor: 'hsl(28 30% 38%)',
    bg: 'bg-stone-50',
    border: 'border-stone-300',
    current: (ctx) => ctx.cemeteryPieces,
    target: 5,
  },
  {
    id: 'garden-of-ten',
    name: 'Garden of Ten',
    desc: '10 pieces in the cemetery',
    category: 'memorial',
    icon: Mountain,
    iconColor: 'hsl(100 35% 40%)',
    bg: 'bg-green-50',
    border: 'border-green-200',
    current: (ctx) => ctx.cemeteryPieces,
    target: 10,
  },
  {
    id: 'epitaph-writer',
    name: 'Epitaph Writer',
    desc: '5 pieces with epitaphs',
    category: 'memorial',
    icon: Scroll,
    iconColor: 'hsl(32 28% 40%)',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    current: (ctx) => ctx.piecesWithEpitaph,
    target: 5,
  },

  // ── Sales & sharing ─────────────────────────────────────────────
  {
    id: 'first-sale',
    name: 'First Sale',
    desc: '1 piece sold',
    category: 'sales',
    icon: Tag,
    iconColor: 'hsl(145 55% 42%)',
    bg: 'bg-green-50',
    border: 'border-green-100',
    current: (ctx) => ctx.soldPieces,
    target: 1,
  },
  {
    id: 'first-trade',
    name: 'First Trade',
    desc: '1 piece traded',
    category: 'sales',
    icon: Gift,
    iconColor: 'hsl(200 55% 45%)',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    current: (ctx) => ctx.tradePieces,
    target: 1,
  },
  {
    id: 'exhibition-piece',
    name: 'Exhibition Piece',
    desc: '1 piece marked for exhibition',
    category: 'sales',
    icon: Star,
    iconColor: 'hsl(44 80% 46%)',
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
    current: (ctx) => ctx.exhibitionPieces,
    target: 1,
  },
  {
    id: 'priced-pro',
    name: 'Priced Pro',
    desc: '10 pieces with pricing set',
    category: 'sales',
    icon: Coins,
    iconColor: 'hsl(38 70% 45%)',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    current: (ctx) => ctx.pricedPieces,
    target: 10,
  },
  {
    id: 'first-payday',
    name: 'First Payday',
    desc: 'Earn $1+ from sold pieces',
    category: 'sales',
    icon: Coins,
    iconColor: 'hsl(145 55% 38%)',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    current: (ctx) => ctx.totalRevenue,
    target: 1,
  },
  {
    id: 'market-ready',
    name: 'Market Ready',
    desc: '10 pieces sold',
    category: 'sales',
    icon: ShoppingBag,
    iconColor: 'hsl(145 55% 35%)',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    current: (ctx) => ctx.soldPieces,
    target: 10,
  },
  {
    id: 'shop-regular',
    name: 'Shop Regular',
    desc: '25 pieces sold',
    category: 'sales',
    icon: Store,
    iconColor: 'hsl(145 50% 32%)',
    bg: 'bg-green-50',
    border: 'border-green-200',
    current: (ctx) => ctx.soldPieces,
    target: 25,
  },
  {
    id: 'giver',
    name: 'Giver',
    desc: '15 pieces gifted',
    category: 'sales',
    icon: Gift,
    iconColor: 'hsl(310 60% 55%)',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    current: (ctx) => ctx.giftedPieces,
    target: 15,
  },
  {
    id: 'generous-giver',
    name: 'Generous Giver',
    desc: '30 pieces gifted',
    category: 'sales',
    icon: Heart,
    iconColor: 'hsl(310 55% 50%)',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-100',
    current: (ctx) => ctx.giftedPieces,
    target: 30,
  },
  {
    id: 'merchant',
    name: 'Merchant',
    desc: '$500+ total sales revenue',
    category: 'sales',
    icon: TrendingUp,
    iconColor: 'hsl(38 80% 42%)',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    current: (ctx) => ctx.totalRevenue,
    target: 500,
  },

  // ── Mastery ─────────────────────────────────────────────────────
  {
    id: 'perfect-glaze',
    name: 'Perfect Glaze',
    desc: '10 successful glaze outcomes logged',
    category: 'mastery',
    icon: Gem,
    iconColor: 'hsl(168 55% 40%)',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    current: (ctx) => ctx.glazeOutcomeSuccesses,
    target: 10,
  },
  {
    id: 'glaze-troubleshooter',
    name: 'Glaze Troubleshooter',
    desc: '5 glaze outcomes logged',
    category: 'mastery',
    icon: FlaskConical,
    iconColor: 'hsl(200 60% 45%)',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    current: (ctx) => ctx.glazeOutcomesLogged,
    target: 5,
  },
  {
    id: 'clay-explorer',
    name: 'Clay Explorer',
    desc: '5 distinct clay bodies used',
    category: 'mastery',
    icon: Palette,
    iconColor: 'hsl(28 55% 45%)',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    current: (ctx) => ctx.distinctClayBodies,
    target: 5,
  },
  {
    id: 'form-master',
    name: 'Form Master',
    desc: '10 distinct piece forms made',
    category: 'mastery',
    icon: Layers,
    iconColor: 'hsl(213 65% 48%)',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    current: (ctx) => ctx.distinctForms,
    target: 10,
  },
  {
    id: 'high-fire',
    name: 'High Fire',
    desc: '1 cone 10 firing logged',
    category: 'mastery',
    icon: Flame,
    iconColor: 'hsl(15 70% 48%)',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    current: (ctx) => ctx.highFireFirings,
    target: 1,
  },

  // ── Studio rhythm ───────────────────────────────────────────────
  {
    id: 'week-streak',
    name: 'Week Streak',
    desc: '7-day studio mission streak',
    category: 'consistency',
    icon: CalendarCheck,
    iconColor: 'hsl(250 55% 55%)',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    current: (ctx) => ctx.longestMissionStreak,
    target: 7,
  },
  {
    id: 'mission-marathon',
    name: 'Mission Marathon',
    desc: '30 daily missions completed',
    category: 'consistency',
    icon: Zap,
    iconColor: 'hsl(250 50% 50%)',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    current: (ctx) => ctx.totalMissionsCompleted,
    target: 30,
  },

  // ── Community ───────────────────────────────────────────────────
  {
    id: 'first-post',
    name: 'First Post',
    desc: '1 community post shared',
    category: 'community',
    icon: MessageCircle,
    iconColor: 'hsl(200 65% 48%)',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    current: (ctx) => ctx.communityPostsCreated,
    target: 1,
  },
  {
    id: 'community-voice',
    name: 'Community Voice',
    desc: '10 community posts shared',
    category: 'community',
    icon: MessageCircle,
    iconColor: 'hsl(213 60% 45%)',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    current: (ctx) => ctx.communityPostsCreated,
    target: 10,
  },
  {
    id: 'challenge-entrant',
    name: 'Challenge Entrant',
    desc: '1 festival challenge entered',
    category: 'community',
    icon: Trophy,
    iconColor: 'hsl(38 80% 48%)',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    current: (ctx) => ctx.challengeEntriesSubmitted,
    target: 1,
  },
  {
    id: 'festival-regular',
    name: 'Festival Regular',
    desc: '5 festival challenges entered',
    category: 'community',
    icon: Medal,
    iconColor: 'hsl(38 75% 42%)',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    current: (ctx) => ctx.challengeEntriesSubmitted,
    target: 5,
  },
  {
    id: 'clay-circle',
    name: 'Clay Circle',
    desc: '5 clay friends',
    category: 'community',
    icon: Users,
    iconColor: 'hsl(350 55% 52%)',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    current: (ctx) => ctx.clayFriendsCount,
    target: 5,
  },
  {
    id: 'hall-of-fame',
    name: 'Hall of Fame',
    desc: '1 challenge win',
    category: 'community',
    icon: Crown,
    iconColor: 'hsl(44 85% 45%)',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    current: (ctx) => ctx.challengeWins,
    target: 1,
  },
];

export const PROFILE_TITLES: { min: number; title: string }[] = [
  { min: 0, title: 'Clay Beginner' },
  { min: 5, title: 'First Thrower' },
  { min: 12, title: 'Apprentice Potter' },
  { min: 20, title: 'Craft Artisan' },
  { min: 30, title: 'Skilled Potter' },
  { min: 40, title: 'Studio Craftsman' },
  { min: 55, title: 'Master Potter' },
  { min: 70, title: 'Studio Legend' },
];

export function buildBadgeContext(
  pieces: Piece[],
  firings: Firing[],
  glazes: GlazeLibraryItem[] = [],
  extras: BadgeBuildExtras = {},
): BadgeContext {
  const atlasRecipeFamilies = new Set(glazes.map((glaze) => getGlazeRootId(glaze))).size;
  const glazeTests = extras.glazeTests ?? [];
  const kilns = extras.kilns ?? [];
  const dailyMissionCompletion = extras.dailyMissionCompletion ?? {};

  const soldPiecesList = pieces.filter((p) => hasStatus(p, 'sold'));

  return {
    totalPieces: pieces.length,
    finishedPieces: pieces.filter((p) => p.stage === 'finished').length,
    glazedPieces: pieces.filter((p) => ['glazing', 'glaze-fired'].includes(p.stage)).length,
    bisqueFirings: firings.filter((f) => f.type === 'bisque').length,
    glazeFirings: firings.filter((f) => f.type === 'glaze').length,
    lusterFirings: firings.filter((f) => f.type === 'luster').length,
    highFireFirings: firings.filter((f) => isHighFireCone(f.cone ?? '')).length,
    totalFirings: firings.length,
    piecesWithNotes: pieces.filter((p) => p.notes && p.notes.trim().length > 0).length,
    failedPieces: pieces.filter(
      (p) =>
        p.stage === 'cemetery'
        || ['cracked', 'warped'].includes(normStatus(p.status)),
    ).length,
    giftedPieces: pieces.filter((p) => hasStatus(p, 'gifted')).length,
    wheelPieces: pieces.filter(
      (p) => formingIncludes(p, 'wheel-thrown') || formingIncludes(p, 'thrown-and-altered'),
    ).length,
    handBuiltPieces: pieces.filter((p) =>
      ['coiled', 'pinched', 'slab-built'].some((method) => formingIncludes(p, method)),
    ).length,
    slabPieces: pieces.filter((p) => formingIncludes(p, 'slab')).length,
    coilPieces: pieces.filter((p) => formingIncludes(p, 'coil')).length,
    pinchPieces: pieces.filter((p) => formingIncludes(p, 'pinch')).length,
    piecesWithPhoto: pieces.filter((p) => !!(p.photo || p.imgUrl)).length,
    soldPieces: soldPiecesList.length,
    tradePieces: pieces.filter((p) => hasStatus(p, 'trade')).length,
    exhibitionPieces: pieces.filter((p) => hasStatus(p, 'exhibition')).length,
    pricedPieces: pieces.filter(pieceIsPriced).length,
    totalRevenue: soldPiecesList.reduce((sum, p) => sum + (p.soldPrice ?? 0), 0),
    atlasRecipeFamilies,
    glazeTests: glazeTests.length,
    glazeLinkedPieces: pieces.filter((p) => Boolean(p.glazeId?.trim())).length,
    glazeOutcomesLogged: pieces.filter((p) => Boolean(p.glazeOutcome)).length,
    glazeOutcomeSuccesses: pieces.filter((p) => p.glazeOutcome === 'success').length,
    cemeteryPieces: pieces.filter((p) => p.stage === 'cemetery').length,
    piecesWithEpitaph: pieces.filter((p) => Boolean(p.epitaph?.trim())).length,
    distinctClayBodies: countDistinct(pieces.map((p) => p.clay)),
    distinctForms: countDistinct(pieces.map((p) => p.form)),
    studioQueueSubmissions: pieces.filter((p) => Boolean(p.studioQueueStatus)).length,
    kilnMaintenanceLogs: kilns.reduce((sum, kiln) => sum + (kiln.maintenanceLogs?.length ?? 0), 0),
    missionDaysCompleted: countMissionDays(dailyMissionCompletion),
    totalMissionsCompleted: countTotalMissions(dailyMissionCompletion),
    longestMissionStreak: longestMissionStreak(dailyMissionCompletion),
    communityPostsCreated: extras.communityPostsCreated ?? 0,
    challengeEntriesSubmitted: extras.challengeEntriesSubmitted ?? 0,
    challengeWins: extras.challengeWins ?? 0,
    clayFriendsCount: extras.clayFriendsCount ?? 0,
  };
}

export function countEarnedBadges(ctx: BadgeContext): number {
  return BADGE_REGISTRY.filter((badge) => badge.current(ctx) >= badge.target).length;
}

export function computeBadgeStates(ctx: BadgeContext): BadgeState[] {
  return BADGE_REGISTRY.map((badge) => {
    const current = badge.current(ctx);
    const unlocked = current >= badge.target;
    const progress = Math.min(1, current / badge.target);
    return { ...badge, current, unlocked, progress };
  });
}

export function groupBadgesByCategory(badges: BadgeState[]) {
  const grouped = new Map<BadgeCategory, BadgeState[]>();

  for (const badge of badges) {
    const list = grouped.get(badge.category) ?? [];
    list.push(badge);
    grouped.set(badge.category, list);
  }

  return BADGE_CATEGORY_ORDER
    .map((category) => {
      const categoryBadges = grouped.get(category) ?? [];
      const sorted = [...categoryBadges].sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return b.progress - a.progress;
      });
      return { category, label: BADGE_CATEGORY_LABELS[category], badges: sorted };
    })
    .filter((group) => group.badges.length > 0);
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
