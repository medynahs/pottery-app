import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Award, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import type { BadgeState } from '../../constants/badgeRegistry';

function EarnedBadgeChip({
  name,
  icon: Icon,
  iconColor,
}: Pick<BadgeState, 'name' | 'icon' | 'iconColor'>) {
  return (
    <View className="items-center" style={{ width: 72 }}>
      <View className="w-14 h-14 rounded-full items-center justify-center mb-1.5 bg-primary/10 border border-primary/25">
        <Icon size={24} color={iconColor} />
      </View>
      <Text className="text-[9px] font-semibold text-center leading-3 text-foreground" numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

function NextBadgeRow({
  name,
  icon: Icon,
  iconColor,
  current,
  target,
  progress,
}: Pick<BadgeState, 'name' | 'icon' | 'iconColor' | 'current' | 'target' | 'progress'>) {
  return (
    <View className="flex-row items-center gap-3 py-2.5 border-t border-border">
      <View className="w-10 h-10 rounded-full items-center justify-center bg-muted opacity-80">
        <Icon size={18} color={iconColor} />
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xs font-bold text-foreground flex-1 mr-2" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-[10px] font-semibold text-muted-foreground">
            {current}/{target}
          </Text>
        </View>
        <View className="h-1.5 rounded-full overflow-hidden bg-muted">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </View>
      </View>
    </View>
  );
}

export function AchievementsPreview({
  badges,
  onViewAll,
}: {
  badges: BadgeState[];
  onViewAll: () => void;
}) {
  const earned = useMemo(() => badges.filter((b) => b.unlocked), [badges]);
  const nextUp = useMemo(
    () => [...badges].filter((b) => !b.unlocked).sort((a, b) => b.progress - a.progress).slice(0, 2),
    [badges],
  );

  if (badges.length === 0) return null;

  return (
    <Card className="rounded-2xl mb-4 overflow-hidden">
      <TouchableOpacity
        onPress={onViewAll}
        activeOpacity={0.85}
        className="px-4 py-3.5 flex-row items-center gap-3 border-b border-border bg-muted/40"
      >
        <View className="w-10 h-10 rounded-2xl items-center justify-center bg-card border border-border">
          <Award size={18} color="hsl(39 57% 51%)" />
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-[15px] font-serif font-bold text-foreground">Achievements</Text>
          <Text className="text-[11px] mt-0.5 text-muted-foreground">
            {earned.length} of {badges.length} earned
          </Text>
        </View>
        <ChevronRight size={18} color="hsl(39 57% 51%)" />
      </TouchableOpacity>

      <View className="p-4">
        {earned.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
            className="mb-1"
          >
            {earned.slice(0, 6).map((badge) => (
              <EarnedBadgeChip key={badge.id} {...badge} />
            ))}
          </ScrollView>
        ) : (
          <Text className="text-sm text-muted-foreground mb-2">
            Log pieces and firings to start earning achievements.
          </Text>
        )}

        {nextUp.length > 0 ? (
          <View className={earned.length > 0 ? 'mt-2' : ''}>
            {earned.length > 0 ? (
              <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Up next
              </Text>
            ) : null}
            {nextUp.map((badge) => (
              <NextBadgeRow key={badge.id} {...badge} />
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}
