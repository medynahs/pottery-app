import { Text } from '@/src/components/ui/text';
import { Award, Lock } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import type { BadgeIconComponent } from '../constants/badgeRegistry';
import { PROFILE_THEME } from '../profileTheme';
import { ProfileSectionCard } from './ProfileSectionCard';

export type BadgeState = {
  id: string;
  name: string;
  desc: string;
  icon: BadgeIconComponent;
  iconColor: string;
  bg: string;
  border: string;
  current: number;
  target: number;
  unlocked: boolean;
  progress: number;
};

function EarnedBadgeCard({
  name,
  desc,
  icon: Icon,
  iconColor,
}: Pick<BadgeState, 'name' | 'desc' | 'icon' | 'iconColor'>) {
  return (
    <View
      className="rounded-[20px] border p-3.5 items-center"
      style={{
        width: 108,
        backgroundColor: PROFILE_THEME.cardBg,
        borderColor: PROFILE_THEME.cardBorder,
      }}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mb-2.5"
        style={{ backgroundColor: PROFILE_THEME.accentSoft }}
      >
        <Icon size={22} color={iconColor} />
      </View>
      <Text className="text-[11px] font-bold text-center leading-tight" style={{ color: PROFILE_THEME.ink }}>
        {name}
      </Text>
      <Text className="text-[9px] text-center mt-1 leading-3" style={{ color: PROFILE_THEME.inkMuted }}>
        {desc}
      </Text>
    </View>
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
    <View
      className="rounded-[18px] border px-3.5 py-3 flex-row items-center gap-3 mb-2.5"
      style={{ backgroundColor: 'hsl(38 45% 97%)', borderColor: PROFILE_THEME.cardBorder }}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center"
        style={{ backgroundColor: PROFILE_THEME.accentSoft, opacity: 0.75 }}
      >
        <Icon size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-xs font-bold" style={{ color: PROFILE_THEME.ink }}>{name}</Text>
          <Text className="text-[10px] font-semibold" style={{ color: PROFILE_THEME.inkMuted }}>
            {current}/{target}
          </Text>
        </View>
        <Text className="text-[10px] mb-2 leading-4" style={{ color: PROFILE_THEME.inkMuted }}>{desc}</Text>
        <View className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: PROFILE_THEME.accentSoft }}>
          <View
            className="h-full rounded-full"
            style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: PROFILE_THEME.accent }}
          />
        </View>
      </View>
    </View>
  );
}

export function JourneyBadgesSection({
  unlocked,
  locked,
}: {
  unlocked: BadgeState[];
  locked: BadgeState[];
}) {
  const nextUp = [...locked].sort((a, b) => b.progress - a.progress).slice(0, 4);

  if (unlocked.length === 0 && locked.length === 0) return null;

  return (
    <>
      {unlocked.length > 0 && (
        <ProfileSectionCard
          title={`Badges earned · ${unlocked.length}`}
          hint="Milestones unlocked across your studio practice"
          accent="badges"
          icon={<Award size={18} color={PROFILE_THEME.accent} />}
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

      {nextUp.length > 0 && (
        <ProfileSectionCard
          title="Next up"
          hint="Closest badges to unlock"
          accent="badges"
          icon={<Lock size={18} color={PROFILE_THEME.inkSoft} />}
          trailing={
            locked.length > nextUp.length ? (
              <Text className="text-[10px] font-semibold" style={{ color: PROFILE_THEME.inkMuted }}>
                +{locked.length - nextUp.length} more
              </Text>
            ) : undefined
          }
        >
          {nextUp.map((badge) => (
            <LockedBadgeRow key={badge.id} {...badge} />
          ))}
        </ProfileSectionCard>
      )}
    </>
  );
}
