import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { BadgeState } from '../constants/badgeRegistry';

function BadgeIconStack({ badges }: { badges: BadgeState[] }) {
  const preview = useMemo(() => {
    const earned = badges.filter((badge) => badge.unlocked).slice(0, 4);
    const locked = badges
      .filter((badge) => !badge.unlocked)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, Math.max(0, 5 - earned.length));

    return [...earned, ...locked].slice(0, 5);
  }, [badges]);

  if (preview.length === 0) return null;

  return (
    <View className="flex-row items-center mt-3">
      {preview.map((badge, index) => {
        const Icon = badge.icon;
        const earned = badge.unlocked;

        return (
          <View
            key={badge.id}
            style={{
              marginLeft: index > 0 ? -9 : 0,
              zIndex: preview.length - index,
            }}
          >
            <View
              className={`w-9 h-9 rounded-full items-center justify-center border-2 ${
                earned ? 'bg-primary/10 border-primary/30' : 'bg-muted border-border opacity-90'
              }`}
            >
              <Icon size={15} color={badge.iconColor} />
            </View>
          </View>
        );
      })}
      {badges.length > preview.length ? (
        <View className="w-9 h-9 rounded-full items-center justify-center border-2 -ml-2 bg-muted border-border">
          <Text className="text-[10px] font-bold text-muted-foreground">
            +{badges.length - preview.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** @deprecated Prefer AchievementsPreview — kept for legacy call sites. */
export function ViewAllBadgesCard({
  badges,
  onPress,
}: {
  badges: BadgeState[];
  onPress: () => void;
}) {
  const earnedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View achievements, ${earnedCount} of ${badges.length} earned`}
      className="mb-4"
    >
      <Card className="rounded-2xl p-4 border-primary/20 bg-primary/5">
        <View className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full items-center justify-center bg-card border border-border">
          <ChevronRight size={16} color="hsl(39 57% 51%)" />
        </View>

        <View className="flex-row items-center justify-between gap-3 pr-8">
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Sparkles size={13} color="hsl(39 57% 51%)" />
              <Text className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Achievements
              </Text>
            </View>

            <Text className="font-serif text-[20px] leading-7 text-foreground">
              {earnedCount} of {badges.length} earned
            </Text>

            <Text className="text-[11px] mt-1 leading-4 pr-2 text-muted-foreground">
              Tap to browse all badges and track progress
            </Text>

            <BadgeIconStack badges={badges} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
