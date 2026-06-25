import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { milestoneVisual } from '../../journeyTheme';
import type { JourneyMilestone } from '../../utils/buildJourneyMilestones';

function formatTimelineDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function JourneyChronicleTimeline({
  milestones,
  hint,
}: {
  milestones: JourneyMilestone[];
  hint?: string;
}) {
  if (milestones.length === 0) return null;

  return (
    <View className="mx-6 mb-4">
      <View className="rounded-2xl border border-border bg-card overflow-hidden">
        <View className="px-4 py-4">
          {milestones.map((item, index) => {
            const visual = milestoneVisual(item.id);
            const Icon = visual.Icon;
            const isLast = index === milestones.length - 1;

            return (
              <View key={`${item.id}-${item.date.toISOString()}`} className="flex-row">
                <View className="items-center mr-3" style={{ width: 36 }}>
                  <View
                    className="w-9 h-9 rounded-2xl items-center justify-center border"
                    style={{ backgroundColor: visual.soft, borderColor: visual.accent + '44' }}
                  >
                    <Icon size={16} color={visual.accent} />
                  </View>
                  {!isLast ? (
                    <View className="flex-1 w-0.5 mt-1 bg-border" style={{ minHeight: 28 }} />
                  ) : null}
                </View>

                <View className="flex-1 pb-5">
                  <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: visual.accent }}>
                    {formatTimelineDate(item.date)}
                  </Text>
                  <Text className="text-sm leading-5 mt-1 text-foreground">
                    {item.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        {hint ? (
          <Text className="text-[11px] text-muted-foreground px-4 pb-4 -mt-1">
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
