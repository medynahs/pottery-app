import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import { Award, BookOpen, Flame, Layers, Sparkles, Star, TrendingUp, Trophy } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View } from 'react-native';

type BadgeIconComponent = React.ComponentType<{ size?: number; color?: string }>;

interface BadgeDef {
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

interface BadgeContext {
  totalPieces: number;
  finishedPieces: number;
  glazedPieces: number;
  bisqueFirings: number;
  totalFirings: number;
  piecesWithNotes: number;
  failedPieces: number;
}

const BADGE_REGISTRY: BadgeDef[] = [
  {
    id: 'first-fire',
    name: 'First Fire',
    desc: '1 bisque firing',
    icon: Flame,
    iconColor: 'hsl(25 90% 55%)',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    current: (ctx) => ctx.bisqueFirings,
    target: 1,
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
    id: 'giver',
    name: 'Giver',
    desc: '15 pieces gifted',
    icon: Sparkles,
    iconColor: 'hsl(340 75% 50%)',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    current: (ctx) => ctx.failedPieces,
    target: 5,
  },
];

export function JourneyTab() {
  const user = useAppStore((s) => s.user);
  const pieces = useAppStore((s) => s.pieces);
  const firings = useAppStore((s) => s.firings);

  const ctx = useMemo<BadgeContext>(() => ({
    totalPieces: pieces.length,
    finishedPieces: pieces.filter((p) => p.stage === 'finished').length,
    glazedPieces: pieces.filter((p) => ['glazing', 'glaze-fired'].includes(p.stage)).length,
    bisqueFirings: firings.filter((f) => f.type === 'bisque').length,
    totalFirings: firings.length,
    piecesWithNotes: pieces.filter((p) => p.notes && p.notes.trim().length > 0).length,
    failedPieces: pieces.filter((p) => p.stage === 'cemetery' || ['cracked', 'warped'].includes(p.status ?? '')).length,
  }), [pieces, firings]);

  const badges = useMemo(() =>
    BADGE_REGISTRY.map((b) => {
      const current = b.current(ctx);
      const unlocked = current >= b.target;
      const progress = Math.min(1, current / b.target);
      return { ...b, current, unlocked, progress };
    }),
    [ctx]
  );

  const unlocked = badges.filter((b) => b.unlocked);
  const locked = badges.filter((b) => !b.unlocked);

  return (
    <View className="px-6">
      {/* Studio Motto */}
      <View className="bg-accent/10 border border-accent/25 rounded-2xl px-4 py-4 mb-5">
        <Text className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Studio Motto</Text>
        <Text className="text-sm text-foreground font-serif italic">
          {user.bio ? `"${user.bio}"` : '"Each imperfection is a signature."'}
        </Text>
      </View>

      {/* Live stats row */}
      <Text className="text-base font-serif font-bold text-foreground mb-3">Craft Stats</Text>
      <View className="flex-row flex-wrap gap-3 mb-5">
        {[
          { label: 'Total Pieces', value: ctx.totalPieces, icon: Layers, color: 'hsl(213 80% 55%)', bg: 'bg-blue-50' },
          { label: 'Finished', value: ctx.finishedPieces, icon: Award, color: 'hsl(100 40% 45%)', bg: 'bg-green-50' },
          { label: 'Firings', value: ctx.totalFirings, icon: Flame, color: 'hsl(25 90% 55%)', bg: 'bg-orange-50' },
          { label: 'With Notes', value: ctx.piecesWithNotes, icon: BookOpen, color: 'hsl(213 70% 45%)', bg: 'bg-sky-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <View key={label} className={`rounded-2xl border border-border p-4 ${bg}`} style={{ width: '47%' }}>
            <Icon size={18} color={color} style={{ marginBottom: 6 }} />
            <Text className="text-2xl font-serif font-bold text-foreground">{value}</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{label}</Text>
          </View>
        ))}
      </View>

      {/* Earned badges */}
      {unlocked.length > 0 && (
        <>
          <Text className="text-base font-serif font-bold text-foreground mb-3">
            Badges Earned · {unlocked.length}
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-5">
            {unlocked.map(({ id, name, desc, icon: Icon, iconColor, bg, border }) => (
              <View
                key={id}
                className={`rounded-2xl border px-3 pt-4 pb-3 items-center ${bg} ${border}`}
                style={{ width: '30%' }}
              >
                <View className="w-11 h-11 rounded-full bg-white/70 items-center justify-center mb-2">
                  <Icon size={20} color={iconColor} />
                </View>
                <Text className="text-xs font-bold text-foreground text-center leading-tight">{name}</Text>
                <Text className="text-[10px] text-muted-foreground text-center mt-0.5">{desc}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Locked badges with progress */}
      {locked.length > 0 && (
        <>
          <Text className="text-base font-serif font-bold text-foreground mb-3">
            In Progress · {locked.length}
          </Text>
          <View className="gap-2.5 mb-6">
            {locked.map(({ id, name, desc, icon: Icon, iconColor, bg, border, current, target, progress }) => (
              <View key={id} className={`rounded-2xl border px-4 py-3 flex-row items-center gap-3 ${bg} ${border}`}>
                <View className="w-10 h-10 rounded-xl bg-white/60 items-center justify-center opacity-60">
                  <Icon size={18} color={iconColor} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs font-bold text-foreground">{name}</Text>
                    <Text className="text-[10px] text-muted-foreground">{current}/{target}</Text>
                  </View>
                  <Text className="text-[10px] text-muted-foreground mb-1.5">{desc}</Text>
                  <View className="h-1.5 rounded-full bg-black/10 overflow-hidden">
                    <View
                      className="h-full rounded-full bg-foreground/25"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

