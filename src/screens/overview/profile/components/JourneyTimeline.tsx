import { Text } from '@/src/components/ui/text';
import { Clock } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import type { JourneyMilestone } from '../utils/buildJourneyMilestones';
import { ProfileSectionCard } from './ProfileSectionCard';

const DOT_COLORS: Record<string, string> = {
  'bg-green-400': '#6B9E78',
  'bg-emerald-400': '#5FAF7A',
  'bg-primary': 'hsl(39 57% 51%)',
  'bg-cyan-400': '#5B8FA8',
  'bg-green-500': '#4A9460',
  'bg-fuchsia-400': '#B87BB8',
  'bg-pink-400': '#D4648A',
  'bg-blue-400': '#6B8FC4',
  'bg-amber-400': 'hsl(39 57% 51%)',
};

function formatTimelineDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function JourneyTimeline({
  milestones,
  hint,
}: {
  milestones: JourneyMilestone[];
  hint?: string;
}) {
  if (milestones.length === 0) return null;

  return (
    <ProfileSectionCard
      title="Recent milestones"
      hint={hint ?? 'Key moments from your pottery journey'}
      icon={<Clock size={18} color="hsl(200 45% 42%)" />}
    >
      <View className="pl-1">
        {milestones.map((item, index) => {
          const dotColor = DOT_COLORS[item.color] ?? 'hsl(39 57% 51%)';
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
                    borderColor: 'hsl(40 30% 99%)',
                  }}
                />
                {!isLast ? (
                  <View className="flex-1 w-0.5 bg-border mt-0.5" style={{ minHeight: 32 }} />
                ) : null}
              </View>
              <View className="flex-1 pb-4">
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatTimelineDate(item.date)} · {item.year}
                </Text>
                <Text className="text-sm leading-5 mt-0.5 text-foreground">
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
