import { Text } from '@/src/components/ui/text';
import { Clock } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import type { JourneyMilestone } from '../utils/buildJourneyMilestones';
import { PROFILE_THEME } from '../profileTheme';
import { ProfileSectionCard } from './ProfileSectionCard';

const DOT_COLORS: Record<string, string> = {
  'bg-green-400': '#6B9E78',
  'bg-emerald-400': '#5FAF7A',
  'bg-primary': PROFILE_THEME.accent,
  'bg-cyan-400': '#5B8FA8',
  'bg-green-500': '#4A9460',
  'bg-fuchsia-400': '#B87BB8',
  'bg-pink-400': '#D4648A',
  'bg-blue-400': '#6B8FC4',
  'bg-amber-400': PROFILE_THEME.gold,
};

function formatTimelineDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function JourneyTimeline({ milestones }: { milestones: JourneyMilestone[] }) {
  if (milestones.length === 0) return null;

  return (
    <ProfileSectionCard
      title="Studio timeline"
      hint="Key moments from your pottery journey"
      accent="timeline"
      icon={<Clock size={18} color="#5B8FA8" />}
    >
      <View className="pl-1">
        {milestones.map((item, index) => {
          const dotColor = DOT_COLORS[item.color] ?? PROFILE_THEME.accent;
          const isLast = index === milestones.length - 1;
          return (
            <View key={item.id} className="flex-row">
              <View className="items-center mr-3" style={{ width: 14 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    backgroundColor: dotColor,
                    marginTop: 4,
                    borderWidth: 2,
                    borderColor: PROFILE_THEME.cardBg,
                  }}
                />
                {!isLast ? (
                  <View
                    style={{
                      flex: 1,
                      width: 2,
                      backgroundColor: PROFILE_THEME.accentSoft,
                      marginTop: 2,
                      minHeight: 32,
                    }}
                  />
                ) : null}
              </View>
              <View className="flex-1 pb-4">
                <Text className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: PROFILE_THEME.inkMuted }}>
                  {formatTimelineDate(item.date)} · {item.year}
                </Text>
                <Text className="text-sm leading-5 mt-0.5" style={{ color: PROFILE_THEME.ink }}>
                  {item.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ProfileSectionCard>
  );
}
