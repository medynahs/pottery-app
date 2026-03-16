import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Switch } from '@/src/components/ui/switch';
import { Text } from '@/src/components/ui/text';
import { getDateKey, getUpcomingRhythmDates } from '@/src/screens/overview/studioRhythm';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { BellDot, CalendarDays, Plus, Target, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TRIM_DAY_OPTIONS = [2, 3, 4, 5];
const GOAL_TARGET_OPTIONS = [1, 2, 3];

const EVENT_PRESETS = [
  { type: 'market-drop' as const, title: 'Market Drop' },
  { type: 'open-studio' as const, title: 'Open Studio' },
  { type: 'sale-restock' as const, title: 'Restock Day' },
];

export default function StudioRhythmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const config = useAppStore((state) => state.studioRhythmConfig);
  const setStudioRhythmConfig = useAppStore((state) => state.setStudioRhythmConfig);
  const addStudioRhythmEvent = useAppStore((state) => state.addStudioRhythmEvent);
  const removeStudioRhythmEvent = useAppStore((state) => state.removeStudioRhythmEvent);
  const updateStudioRhythmEvent = useAppStore((state) => state.updateStudioRhythmEvent);
  const toggleStudioRhythmGoal = useAppStore((state) => state.toggleStudioRhythmGoal);
  const setStudioRhythmGoalTarget = useAppStore((state) => state.setStudioRhythmGoalTarget);
  const upcomingDays = useMemo(() => getUpcomingRhythmDates(7), []);
  const [selectedDateKey, setSelectedDateKey] = useState(() => getDateKey());
  const [customEventTitle, setCustomEventTitle] = useState('');

  const selectedDay = upcomingDays.find((day) => day.key === selectedDateKey) ?? upcomingDays[0];
  const selectedEvents = config.scheduledEvents.filter((event) => getDateKey(event.date) === selectedDateKey);
  const activeGoalsCount = config.weeklyGoals.filter((goal) => goal.active).length;

  function addPresetEvent(type: 'market-drop' | 'open-studio' | 'sale-restock', title: string) {
    addStudioRhythmEvent({
      type,
      title,
      date: selectedDay.date.toISOString(),
      notificationsEnabled: true,
    });
  }

  function addCustomEvent() {
    const trimmed = customEventTitle.trim();
    if (!trimmed) return;

    addStudioRhythmEvent({
      type: 'custom',
      title: trimmed,
      date: selectedDay.date.toISOString(),
      notificationsEnabled: true,
    });
    setCustomEventTitle('');
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Studio Rhythm
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            Shape gentle suggestions to match your weekly studio pace.
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-muted px-4 py-2 rounded-full">
          <Text className="text-sm font-medium text-foreground">Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6 mt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="w-9 h-9 rounded-xl items-center justify-center bg-amber-50 border border-amber-100">
                <CalendarDays size={18} color="hsl(24 75% 45%)" />
              </View>
              <View>
                <Text className="text-base font-serif font-bold text-foreground">Rhythm Planner</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {config.scheduledEvents.length} events • {activeGoalsCount} weekly goals active
                </Text>
              </View>
            </View>
            <Text className="text-xs text-primary font-medium">Feeds daily missions</Text>
          </View>

          <Text className="text-sm text-muted-foreground">
            Plan tomorrow, set weekly training goals, and shape the checklist that appears in Today Missions.
          </Text>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          <Text className="text-sm font-medium text-foreground mb-3">Upcoming Calendar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
            <View className="flex-row gap-2">
              {upcomingDays.map((day) => {
                const selected = day.key === selectedDateKey;
                const eventCount = config.scheduledEvents.filter((event) => getDateKey(event.date) === day.key).length;

                return (
                  <TouchableOpacity
                    key={day.key}
                    onPress={() => setSelectedDateKey(day.key)}
                    activeOpacity={0.8}
                    className={`rounded-2xl border px-3 py-3 min-w-[72px] ${selected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                  >
                    <Text className={`text-[11px] font-medium ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
                      {day.shortWeekday}
                    </Text>
                    <Text className={`text-lg font-serif font-bold mt-1 ${selected ? 'text-primary' : 'text-foreground'}`}>
                      {day.dayLabel}
                    </Text>
                    <Text className="text-[10px] text-muted-foreground mt-1">{eventCount} planned</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-sm font-medium text-foreground">Program for {selectedDay.fullLabel}</Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Add events that should send notifications and feed your mission list.
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-3">
            {EVENT_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.type}
                onPress={() => addPresetEvent(preset.type, preset.title)}
                activeOpacity={0.8}
                className="rounded-xl border border-border bg-background px-3 py-2"
              >
                <Text className="text-xs font-medium text-foreground">+ {preset.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center gap-2 mb-4">
            <View className="flex-1 rounded-xl border border-border bg-background px-3 py-2">
              <TextInput
                value={customEventTitle}
                onChangeText={setCustomEventTitle}
                placeholder="Add custom event"
                placeholderTextColor="hsl(24 10% 55%)"
                style={{ color: 'hsl(24 15% 18%)' }}
              />
            </View>
            <TouchableOpacity onPress={addCustomEvent} activeOpacity={0.8} className="w-11 h-11 rounded-xl bg-primary items-center justify-center">
              <Plus size={18} color="white" />
            </TouchableOpacity>
          </View>

          {selectedEvents.length === 0 ? (
            <View className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-4">
              <Text className="text-sm text-muted-foreground">Nothing planned yet for this day.</Text>
            </View>
          ) : (
            selectedEvents.map((event) => (
              <View key={event.id} className="rounded-xl border border-border bg-background px-3 py-3 mb-2">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">{event.title}</Text>
                    <Text className="text-xs text-muted-foreground mt-1">{event.type.replace('-', ' ')}</Text>
                  </View>

                  <TouchableOpacity onPress={() => removeStudioRhythmEvent(event.id)} className="w-8 h-8 rounded-lg items-center justify-center bg-muted/60">
                    <Trash2 size={14} color="hsl(0 55% 45%)" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between mt-3">
                  <View className="flex-row items-center gap-2">
                    <BellDot size={14} color="hsl(24 60% 45%)" />
                    <Text className="text-xs text-muted-foreground">Mission + notification cue</Text>
                  </View>
                  <Switch
                    checked={event.notificationsEnabled}
                    onCheckedChange={(checked) => updateStudioRhythmEvent(event.id, { notificationsEnabled: checked })}
                  />
                </View>
              </View>
            ))
          )}
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-9 h-9 rounded-xl items-center justify-center bg-blue-50 border border-blue-100">
              <Target size={18} color="hsl(213 70% 45%)" />
            </View>
            <View>
              <Text className="text-sm font-medium text-foreground">Weekly Goals</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                These goals help shape daily missions across the week.
              </Text>
            </View>
          </View>

          {config.weeklyGoals.map((goal) => (
            <View key={goal.id} className="rounded-xl border border-border bg-background px-3 py-3 mb-2">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">{goal.title}</Text>
                  <Text className="text-xs text-muted-foreground mt-1">{goal.frequency} goal</Text>
                </View>
                <Switch checked={goal.active} onCheckedChange={() => toggleStudioRhythmGoal(goal.id)} />
              </View>

              <View className="flex-row items-center gap-2 mt-3">
                <Text className="text-xs text-muted-foreground">Target</Text>
                {GOAL_TARGET_OPTIONS.map((count) => {
                  const selected = goal.targetCount === count;

                  return (
                    <TouchableOpacity
                      key={`${goal.id}-${count}`}
                      onPress={() => setStudioRhythmGoalTarget(goal.id, count)}
                      activeOpacity={0.8}
                      className={`rounded-full border px-2.5 py-1 ${selected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                    >
                      <Text className={`text-[11px] font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>{count}x</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-medium text-foreground">Wheel Practice Focus</Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Suggest short cylinder practice sessions when your rhythm calls for it.
              </Text>
            </View>
            <Switch
              checked={config.wheelPractice}
              onCheckedChange={(checked) => setStudioRhythmConfig({ wheelPractice: checked })}
            />
          </View>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-medium text-foreground">Reclaim Focus</Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Surface reclaim nudges when scraps start building up.
              </Text>
            </View>
            <Switch
              checked={config.reclaimFocus}
              onCheckedChange={(checked) => setStudioRhythmConfig({ reclaimFocus: checked })}
            />
          </View>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-4 mb-4">
          <Text className="text-sm font-medium text-foreground">Trim Suggestion Timing</Text>
          <Text className="text-xs text-muted-foreground mt-1 mb-3">
            When drying pieces pass this window, trimming suggestions may appear.
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {TRIM_DAY_OPTIONS.map((days) => {
              const selected = config.preferredTrimAfterDays === days;

              return (
                <TouchableOpacity
                  key={days}
                  onPress={() => setStudioRhythmConfig({ preferredTrimAfterDays: days })}
                  activeOpacity={0.75}
                  className={`rounded-xl px-3 py-2 border ${selected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                >
                  <Text className={`text-xs font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
                    {days} days
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Button variant="outline" className="rounded-xl self-start" onPress={() => router.back()}>
          <Text>Back to Studio</Text>
        </Button>
      </ScrollView>
    </View>
  );
}
