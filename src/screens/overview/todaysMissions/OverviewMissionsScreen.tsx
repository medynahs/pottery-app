import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
  generateStudioRhythmSuggestions,
  type StudioRhythmSuggestion,
  type StudioRhythmSuggestionType,
} from '@/src/screens/overview/studioRythm/generateStudioRhythmSuggestions';
import { getTodayMissionKey } from '@/src/screens/overview/utils/missionDate';
import { useAppStore, useVisiblePieces } from '@/src/store';
import { useRouter } from 'expo-router';
import { CalendarDays, Check, Flame, Hammer, Scissors, Sparkles, Trophy } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MISSION_META: Record<
  StudioRhythmSuggestionType,
  {
    title: string;
    Icon: typeof Trophy;
    iconColor: string;
    chipClassName: string;
  }
> = {
  trim: {
    title: 'Trim Watch',
    Icon: Scissors,
    iconColor: 'hsl(39 57% 51%)',
    chipClassName: 'bg-primary/10',
  },
  reclaim: {
    title: 'Reclaim Loop',
    Icon: Hammer,
    iconColor: 'hsl(35 65% 42%)',
    chipClassName: 'bg-amber-50',
  },
  'wheel-practice': {
    title: 'Wheel Focus',
    Icon: Sparkles,
    iconColor: 'hsl(270 55% 52%)',
    chipClassName: 'bg-purple-50',
  },
  'kiln-check': {
    title: 'Kiln Check',
    Icon: Flame,
    iconColor: 'hsl(16 78% 52%)',
    chipClassName: 'bg-red-50',
  },
  'upcoming-event': {
    title: 'Calendar Nudge',
    Icon: CalendarDays,
    iconColor: 'hsl(213 70% 45%)',
    chipClassName: 'bg-blue-50',
  },
  'goal-focus': {
    title: 'Weekly Goal',
    Icon: Trophy,
    iconColor: 'hsl(44 70% 45%)',
    chipClassName: 'bg-yellow-50',
  },
};

function getProgressPct(current: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((current / total) * 100);
}

export default function OverviewMissionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pieces = useVisiblePieces();
  const firings = useAppStore((state) => state.firings);
  const rhythm = useAppStore((state) => state.studioRhythm);
  const dailyMissionCompletion = useAppStore((state) => state.dailyMissionCompletion);
  const toggleDailyMissionCompletion = useAppStore((state) => state.toggleDailyMissionCompletion);
  const todayMissionKey = getTodayMissionKey();

  const suggestions = React.useMemo<StudioRhythmSuggestion[]>(
    () =>
      generateStudioRhythmSuggestions({
        pieces,
        firings,
        rhythm,
      }),
    [firings, pieces, rhythm]
  );

  const completedTypes = dailyMissionCompletion[todayMissionKey] ?? [];
  const missions = React.useMemo(
    () =>
      suggestions.map((suggestion) => ({
        ...suggestion,
        completed: completedTypes.includes(suggestion.type),
        meta: MISSION_META[suggestion.type],
      })),
    [completedTypes, suggestions]
  );

  const completedCount = missions.filter((mission) => mission.completed).length;
  const remainingCount = Math.max(missions.length - completedCount, 0);
  const progressPct = getProgressPct(completedCount, missions.length);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Today's Missions
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">Today&apos;s checklist shaped by your Studio Rhythm.</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-muted px-4 py-2 rounded-full">
          <Text className="text-sm font-medium text-foreground">Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {missions.length === 0 ? (
          <Card className="rounded-2xl border-border bg-card p-5">
            <Text className="text-base font-serif font-bold text-foreground mb-1">No Missions Yet</Text>
            <Text className="text-sm text-muted-foreground mb-4">
              Tune your Studio Rhythm and missions will appear here as a daily checklist.
            </Text>
            <Button size="sm" variant="outline" className="self-start rounded-xl px-4" onPress={() => router.push('/profile/studio-rhythm')}>
              <Text className="text-sm">Edit Rhythm</Text>
            </Button>
          </Card>
        ) : (
          <>
            <Card className="rounded-2xl border-border bg-card p-4 mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-9 h-9 rounded-xl items-center justify-center bg-amber-50 border border-amber-100">
                    <Trophy size={18} color="hsl(36 70% 48%)" />
                  </View>
                  <View>
                    <Text className="text-base font-serif font-bold text-foreground">Daily Quest Board</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">{completedCount}/{missions.length} completed</Text>
                  </View>
                </View>
                <Text className="text-xs text-primary font-medium">{remainingCount} left</Text>
              </View>

              <View className="h-2 rounded-full bg-muted overflow-hidden">
                <View className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
              </View>
            </Card>

            {missions.map((mission, index) => {
              const Icon = mission.meta.Icon;

              return (
                <Card
                  key={mission.type}
                  className={`rounded-2xl p-4 mb-3 border ${mission.completed ? 'border-primary/35 bg-primary/5' : 'border-border bg-card'}`}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View className={`w-10 h-10 rounded-xl items-center justify-center border border-border ${mission.meta.chipClassName}`}>
                        <Icon size={18} color={mission.meta.iconColor} />
                      </View>

                      <View className="flex-1">
                        <Text className={`text-sm font-semibold ${mission.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
                          Quest {index + 1}: {mission.meta.title}
                        </Text>
                        <Text className={`text-xs mt-1 ${mission.completed ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                          {mission.text}
                        </Text>
                      </View>
                    </View>

                    <View className={`rounded-full px-2 py-1 border ${mission.completed ? 'bg-green-50 border-green-200' : 'bg-muted border-border'}`}>
                      <Text className={`text-[10px] font-medium ${mission.completed ? 'text-green-700' : 'text-muted-foreground'}`}>
                        {mission.completed ? 'Concluded' : 'Active'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl px-4"
                      onPress={() => router.push(mission.route as never)}
                    >
                      <Text className="text-sm">{mission.actionLabel}</Text>
                    </Button>

                    <Button
                      size="sm"
                      variant={mission.completed ? 'secondary' : 'default'}
                      className="rounded-xl px-4"
                      onPress={() => toggleDailyMissionCompletion(todayMissionKey, mission.type)}
                    >
                      <View className="flex-row items-center gap-1.5">
                        <Check size={14} color={mission.completed ? 'hsl(24 20% 35%)' : 'white'} />
                        <Text className="text-sm">{mission.completed ? 'Reopen' : 'Conclude'}</Text>
                      </View>
                    </Button>
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}
