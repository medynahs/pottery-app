import { Award, BookOpen, Flame, Heart, Layers, Sparkles, Star, TrendingUp, Trophy } from 'lucide-react-native';

export type Tab = 'portfolio' | 'journey' | 'posts';

export const KEY_STATS = [
  { label: 'Total Pieces',  value: '142', icon: Layers,     color: 'hsl(213 80% 55%)', bg: 'bg-blue-50' },
  { label: 'Finished',      value: '89',  icon: Award,      color: 'hsl(100 40% 45%)', bg: 'bg-green-50' },
  { label: 'Kiln Loads',    value: '18',  icon: Flame,      color: 'hsl(25 90% 55%)',  bg: 'bg-orange-50' },
  { label: 'Survival Rate', value: '87%', icon: TrendingUp, color: 'hsl(145 50% 45%)', bg: 'bg-emerald-50' },
];

export const PORTFOLIO_PIECES = [
  { id: 1, name: 'Speckled Mug',    type: 'Mug',    emoji: '🏺', bg: 'bg-amber-100',  accent: 'hsl(38 55% 55%)' },
  { id: 2, name: 'Large Bowl',      type: 'Bowl',   emoji: '🥣', bg: 'bg-stone-200',  accent: 'hsl(15 50% 50%)' },
  { id: 3, name: 'Teapot Set',      type: 'Set',    emoji: '🫖', bg: 'bg-blue-100',   accent: 'hsl(213 80% 55%)' },
  { id: 4, name: 'Vase No. 7',      type: 'Vase',   emoji: '🏛️', bg: 'bg-green-100',  accent: 'hsl(100 40% 45%)' },
  { id: 5, name: 'Pinch Pot',       type: 'Pot',    emoji: '🫙', bg: 'bg-rose-100',   accent: 'hsl(340 60% 50%)' },
  { id: 6, name: 'Raku Cup',        type: 'Cup',    emoji: '☕', bg: 'bg-orange-100', accent: 'hsl(25 90% 55%)' },
  { id: 7, name: 'Serving Platter', type: 'Plate',  emoji: '🍽️', bg: 'bg-stone-100',  accent: 'hsl(24 30% 45%)' },
  { id: 8, name: 'Bud Vase',        type: 'Vase',   emoji: '🌸', bg: 'bg-pink-100',   accent: 'hsl(340 75% 50%)' },
  { id: 9, name: 'Oil Bottle',      type: 'Bottle', emoji: '🧴', bg: 'bg-emerald-100', accent: 'hsl(145 50% 45%)' },
];

export const ACHIEVEMENTS = [
  { icon: Trophy,   name: 'Centering Pro',  desc: '500 pieces',    bg: 'bg-amber-50',  border: 'border-amber-200',  iconColor: 'hsl(38 80% 50%)',  unlocked: true  },
  { icon: Flame,    name: 'Kiln Master',    desc: '50 firings',    bg: 'bg-orange-50', border: 'border-orange-200', iconColor: 'hsl(25 90% 55%)',  unlocked: true  },
  { icon: Star,     name: 'Glazing Artist', desc: '100 glazed',    bg: 'bg-blue-50',   border: 'border-blue-200',   iconColor: 'hsl(213 80% 55%)', unlocked: true  },
  { icon: Heart,    name: 'Resilient',      desc: '50 failures',   bg: 'bg-pink-50',   border: 'border-pink-200',   iconColor: 'hsl(340 75% 50%)', unlocked: true  },
  { icon: BookOpen, name: 'Record Keeper',  desc: '1 yr journal',  bg: 'bg-green-50',  border: 'border-green-200',  iconColor: 'hsl(145 50% 45%)', unlocked: false },
  { icon: Sparkles, name: 'Perfectionist',  desc: '10 to gallery', bg: 'bg-purple-50', border: 'border-purple-200', iconColor: 'hsl(270 60% 55%)', unlocked: false },
  { icon: Sparkles, name: 'Giver',  desc: '15 pieces gifted', bg: 'bg-purple-50', border: 'border-purple-200', iconColor: 'hsl(270 60% 55%)', unlocked: false },
];

export const TIMELINE = [
  { year: '2024', label: 'Reached 142 total pieces',        color: 'bg-primary' },
  { year: '2024', label: 'First successful Raku firing',     color: 'bg-orange-400' },
  { year: '2023', label: 'Joined community studio',         color: 'bg-blue-400' },
  { year: '2022', label: 'Started pottery journey',         color: 'bg-green-400' },
];
