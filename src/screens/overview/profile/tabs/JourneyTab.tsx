import { Text } from '@/src/components/ui/text';
import { useVisiblePieces, useAppStore } from '@/src/store/appStore';
import { Award, BookOpen, Camera, Crown, Disc, Flame, FlaskConical, Gem, Gift, Hammer, Layers, Medal, ShoppingBag, Sparkles, Star, Tag, TrendingUp, Trophy } from 'lucide-react-native';
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

interface KeyStat {
  label: string;
  value: string;
  icon: BadgeIconComponent;
  color: string;
  bg: string;
}

interface TimelineMilestone {
  year: string;
  label: string;
  color: string;
  date: Date;
}

const BADGE_REGISTRY: BadgeDef[] = [
  // ── Firings ──────────────────────────────────────────────
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
  // ── Pieces made ──────────────────────────────────────────
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
  // ── Technique ────────────────────────────────────────────
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
  // ── Documentation ────────────────────────────────────────
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
  // ── Story ────────────────────────────────────────────────
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

export function JourneyTab() {
  const user = useAppStore((s) => s.user);
  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);

  const ctx = useMemo<BadgeContext>(() => ({
    totalPieces:     pieces.length,
    finishedPieces:  pieces.filter((p) => p.stage === 'finished').length,
    glazedPieces:    pieces.filter((p) => ['glazing', 'glaze-fired'].includes(p.stage)).length,
    bisqueFirings:   firings.filter((f) => f.type === 'bisque').length,
    glazeFirings:    firings.filter((f) => f.type === 'glaze').length,
    totalFirings:    firings.length,
    piecesWithNotes: pieces.filter((p) => p.notes && p.notes.trim().length > 0).length,
    failedPieces:    pieces.filter((p) => p.stage === 'cemetery' || ['cracked', 'warped'].includes(p.status ?? '')).length,
    giftedPieces:    pieces.filter((p) => p.status === 'gifted').length,
    wheelPieces:     pieces.filter((p) => p.formingMethod === 'wheel-thrown' || p.formingMethod === 'thrown-and-altered').length,
    handBuiltPieces: pieces.filter((p) => ['coiled', 'pinched', 'slab-built'].includes(p.formingMethod ?? '')).length,
    piecesWithPhoto: pieces.filter((p) => !!(p.photo || p.imgUrl)).length,
    soldPieces:      pieces.filter((p) => p.status === 'sold').length,
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

  const survivalRate = useMemo(() => {
    if (ctx.totalPieces === 0) return 0;
    const survived = Math.max(0, ctx.totalPieces - ctx.failedPieces);
    return Math.round((survived / ctx.totalPieces) * 100);
  }, [ctx.failedPieces, ctx.totalPieces]);

  const keyStats = useMemo<KeyStat[]>(() => [
    { label: 'Total Pieces', value: `${ctx.totalPieces}`, icon: Layers, color: 'hsl(213 80% 55%)', bg: 'bg-blue-50' },
    { label: 'Survival Rate', value: `${survivalRate}%`, icon: TrendingUp, color: 'hsl(145 50% 45%)', bg: 'bg-emerald-50' },
    { label: 'Firings', value: `${ctx.totalFirings}`, icon: Flame, color: 'hsl(39 57% 51%)', bg: 'bg-primary/10' },
    { label: 'Finished', value: `${ctx.finishedPieces}`, icon: Award, color: 'hsl(100 40% 45%)', bg: 'bg-green-50' },
  ], [ctx.finishedPieces, ctx.totalFirings, ctx.totalPieces, survivalRate]);

  const achievements = badges;
  const unlocked = achievements.filter((b) => b.unlocked);
  const locked = achievements.filter((b) => !b.unlocked);

  const timeline = useMemo<TimelineMilestone[]>(() => {
    const timestamps = pieces.flatMap((piece) => {
      const values = [piece.createdAt, ...piece.timeline.map((entry) => entry.timestamp)];
      return values
        .map((raw) => new Date(raw))
        .filter((date) => !Number.isNaN(date.getTime()));
    });

    const startDate = timestamps.length
      ? new Date(Math.min(...timestamps.map((date) => date.getTime())))
      : null;

    const milestones: TimelineMilestone[] = [];

    if (startDate) {
      milestones.push({
        year: `${startDate.getFullYear()}`,
        label: 'Started pottery journey',
        color: 'bg-green-400',
        date: startDate,
      });
    }

    const now = new Date();

    if (ctx.totalPieces > 0) {
      milestones.push({
        year: `${now.getFullYear()}`,
        label: `Reached ${ctx.totalPieces} total pieces`,
        color: 'bg-primary',
        date: now,
      });
    }

    if (ctx.totalFirings > 0) {
      milestones.push({
        year: `${now.getFullYear()}`,
        label: `Logged ${ctx.totalFirings} kiln firings`,
        color: 'bg-primary',
        date: now,
      });
    }

    if (ctx.totalPieces > 0) {
      milestones.push({
        year: `${now.getFullYear()}`,
        label: `Current survival rate is ${survivalRate}%`,
        color: 'bg-emerald-400',
        date: now,
      });
    }

    return milestones.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [ctx.totalFirings, ctx.totalPieces, pieces, survivalRate]);

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
        {keyStats.map(({ label, value, icon: Icon, color, bg }) => (
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

      {timeline.length > 0 && (
        <>
          <Text className="text-base font-serif font-bold text-foreground mb-3">Milestones</Text>
          <View className="gap-2.5 mb-6">
            {timeline.map((item, index) => (
              <View key={`${item.label}-${index}`} className="rounded-2xl border border-border bg-card px-4 py-3 flex-row items-start gap-3">
                <View className={`w-2.5 h-2.5 rounded-full mt-1.5 ${item.color}`} />
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted-foreground mb-0.5">{item.year}</Text>
                  <Text className="text-sm text-foreground">{item.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

