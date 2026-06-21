import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useRouter } from 'expo-router';
import { Award, Lock } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import type { BadgeState } from '../constants/badgeRegistry';
import { ProfileSectionCard } from './ProfileSectionCard';
import { ViewAllBadgesCard } from './ViewAllBadgesCard';

function EarnedBadgeCard({
  name,
  desc,
  icon: Icon,
  iconColor,
}: Pick<BadgeState, 'name' | 'desc' | 'icon' | 'iconColor'>) {
  return (
    <Card className="rounded-2xl p-3.5 items-center" style={{ width: 108 }}>
      <View className="w-12 h-12 rounded-2xl items-center justify-center mb-2.5 bg-muted">
        <Icon size={22} color={iconColor} />
      </View>
      <Text className="text-[11px] font-bold text-center leading-tight text-foreground">
        {name}
      </Text>
      <Text className="text-[9px] text-center mt-1 leading-3 text-muted-foreground">
        {desc}
      </Text>
    </Card>
  );
}

function LockedBadgeRow({
  name,
  desc,
  icon: Icon,
  iconColor,
  current,
  target,
  progress,
}: Pick<BadgeState, 'name' | 'desc' | 'icon' | 'iconColor' | 'current' | 'target' | 'progress'>) {
  return (
    <Card className="rounded-2xl px-3.5 py-3 flex-row items-center gap-3 mb-2.5">
      <View className="w-11 h-11 rounded-xl items-center justify-center bg-muted opacity-75">
        <Icon size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-xs font-bold text-foreground">{name}</Text>
          <Text className="text-[10px] font-semibold text-muted-foreground">
            {current}/{target}
          </Text>
        </View>
        <Text className="text-[10px] mb-2 leading-4 text-muted-foreground">{desc}</Text>
        <View className="h-1.5 rounded-full overflow-hidden bg-muted">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </View>
      </View>
    </Card>
  );
}

export function JourneyBadgesSection({ badges }: { badges: BadgeState[] }) {
  const router = useRouter();

  const unlocked = useMemo(() => badges.filter((badge) => badge.unlocked), [badges]);
  const locked = useMemo(() => badges.filter((badge) => !badge.unlocked), [badges]);
  const closest = useMemo(
    () => [...locked].sort((a, b) => b.progress - a.progress).slice(0, 3),
    [locked],
  );

  if (badges.length === 0) return null;

  return (
    <>
      {unlocked.length > 0 && (
        <ProfileSectionCard
          title={`Badges earned · ${unlocked.length}`}
          hint="Milestones unlocked across your studio practice"
          icon={<Award size={18} color="hsl(39 57% 51%)" />}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 4 }}
          >
            {unlocked.map((badge) => (
              <EarnedBadgeCard key={badge.id} {...badge} />
            ))}
          </ScrollView>
        </ProfileSectionCard>
      )}

      {closest.length > 0 && (
        <ProfileSectionCard
          title="Closest to unlock"
          hint="Your nearest badge milestones"
          icon={<Lock size={18} color="hsl(24 20% 40%)" />}
        >
          {closest.map((badge) => (
            <LockedBadgeRow key={badge.id} {...badge} />
          ))}
        </ProfileSectionCard>
      )}

      <ViewAllBadgesCard
        badges={badges}
        onPress={() => router.push('/profile/badges' as never)}
      />
    </>
  );
}
