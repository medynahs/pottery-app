import { Text } from '@/src/components/ui/text';
import { useVisiblePieces, useAppStore } from '@/src/store/appStore';
import { Award, Flame, Layers, TrendingUp } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  buildBadgeContext,
  computeBadgeStates,
  type BadgeIconComponent,
} from '../constants/badgeRegistry';
import { buildJourneyMilestones } from '../utils/buildJourneyMilestones';

interface KeyStat {
  label: string;
  value: string;
  icon: BadgeIconComponent;
  color: string;
  bg: string;
}

export function JourneyTab() {
  const pieces = useVisiblePieces();
  const firings = useAppStore((s) => s.firings);
  const glazes = useAppStore((s) => s.glazes);

  const ctx = useMemo(() => buildBadgeContext(pieces, firings, glazes), [pieces, firings, glazes]);

  const badges = useMemo(() => computeBadgeStates(ctx), [ctx]);

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

  const unlocked = badges.filter((badge) => badge.unlocked);
  const locked = badges.filter((badge) => !badge.unlocked);

  const timeline = useMemo(
    () => buildJourneyMilestones(pieces, firings),
    [pieces, firings],
  );

  return (
    <View className="px-6">
      <Text className="text-base font-serif font-bold text-foreground mb-3">Craft Stats</Text>
      <View className="flex-row flex-wrap gap-3 mb-5">
        {keyStats.map(({ label, value, icon: Icon, color, bg }) => (
          <View key={label} className={`rounded-2xl border border-border p-4 ${bg}`} style={{ width: '47%' }}>
            <View className="mb-1.5">
              <Icon size={18} color={color} />
            </View>
            <Text className="text-2xl font-serif font-bold text-foreground">{value}</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">{label}</Text>
          </View>
        ))}
      </View>

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
            {timeline.map((item) => (
              <View key={item.id} className="rounded-2xl border border-border bg-card px-4 py-3 flex-row items-start gap-3">
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
