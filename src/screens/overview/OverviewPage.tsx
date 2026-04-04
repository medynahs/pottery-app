import { Text } from '@/src/components/ui/text';
import { generateStudioRhythmSuggestions } from '@/src/screens/overview/studioRythm/generateStudioRhythmSuggestions';
import { EVENT_CATEGORIES, STAGE_CONFIG, getDateKey } from '@/src/screens/overview/studioRythm/studioRhythm';
import { getTodayMissionKey } from '@/src/screens/overview/utils/missionDate';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { CalendarDays, Check, Flame, Hammer, MessageSquarePlus, Scissors, Sparkles, Trophy } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedbackModal } from './components/FeedbackModal';
import { StudioScene } from './components/StudioScene';


type MissionIcon = React.ComponentType<{ size?: number; color?: string }>;
const MISSION_META: Record<string, { title: string; Icon: MissionIcon; iconColor: string; chipClassName: string }> = {
  trim: { title: 'Trim Watch', Icon: Scissors, iconColor: 'hsl(24 75% 45%)', chipClassName: 'bg-orange-50' },
  reclaim: { title: 'Reclaim Loop', Icon: Hammer, iconColor: 'hsl(35 65% 42%)', chipClassName: 'bg-amber-50' },
  'wheel-practice': { title: 'Wheel Focus', Icon: Sparkles, iconColor: 'hsl(270 55% 52%)', chipClassName: 'bg-purple-50' },
  'kiln-check': { title: 'Kiln Check', Icon: Flame, iconColor: 'hsl(16 78% 52%)', chipClassName: 'bg-red-50' },
  'upcoming-event': { title: 'Calendar Nudge', Icon: CalendarDays, iconColor: 'hsl(213 70% 45%)', chipClassName: 'bg-blue-50' },
  'goal-focus': { title: 'Weekly Goal', Icon: Trophy, iconColor: 'hsl(44 70% 45%)', chipClassName: 'bg-yellow-50' },
};

export function OverviewPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAppStore((state) => state.user);
  const kilnkinCompanion = useAppStore((state) => state.kilnkinCompanion);
  const pieces = useAppStore((state) => state.pieces);
  const firings = useAppStore((state) => state.firings);
  const rhythm = useAppStore((state) => state.studioRhythm);
  const dailyMissionCompletion = useAppStore((state) => state.dailyMissionCompletion);
  const toggleDailyMissionCompletion = useAppStore((state) => state.toggleDailyMissionCompletion);
  const todayMissionKey = getTodayMissionKey();
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const topOverlayOffset = insets.top + 8;
  const missionsTop = insets.top + 60;
  const activeCommunityChallenge = React.useMemo(
    () => ({
      title: 'Underwater Forms Festival',
      track: 'Beginner Track',
      phase: 'Submissions open',
      daysLeft: 6,
    }),
    []
  );

  const missionsSummary = React.useMemo(() => {
    const suggestions = generateStudioRhythmSuggestions({ pieces, firings, rhythm });
    const completed = dailyMissionCompletion[todayMissionKey] ?? [];
    const total = suggestions.length;
    const completedCount = completed.filter((t) => suggestions.some((s) => s.type === t)).length;
    const all = suggestions.map((s) => ({ ...s, completed: completed.includes(s.type) }));
    const remaining = all.filter((s) => !s.completed);
    return { total, completedCount, all, remaining, topMission: remaining[0] ?? null };
  }, [pieces, firings, rhythm, dailyMissionCompletion, todayMissionKey]);

  const todayRhythm = React.useMemo(() => {
    const dow = (new Date().getDay() + 6) % 7;
    const todayKey = getDateKey();
    const stages = rhythm.stageDays.filter((sd) => sd.days.includes(dow)).map((sd) => sd.stage);
    const events = rhythm.events.filter((e) => e.date.slice(0, 10) === todayKey);
    return { stages, events, isEmpty: stages.length === 0 && events.length === 0 };
  }, [rhythm]);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: '#EBB23F' }}
    >
      <View className="relative flex-1 overflow-hidden">
        <StudioScene height={890}  />

        <View
          className="absolute left-4 rounded-2xl border border-border bg-card/85 px-4 py-2"
          style={{ top: topOverlayOffset }}
        >
          <Text className="text-base font-serif font-bold text-foreground">The Pottery Nook</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/kilnkin')}
          activeOpacity={0.85}
          className="absolute left-4 bottom-4 rounded-3xl border border-border bg-card/90 px-3 py-2 flex-row items-center gap-2"
          accessibilityRole="button"
          accessibilityLabel={`Open ${kilnkinCompanion.name} profile`}
        >
          <View className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 items-center justify-center overflow-hidden">
            <Image source={require('../../../assets/images/clay-pet.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
          </View>
          <View>
            <Text className="text-xs text-muted-foreground">Companion</Text>
            <Text className="text-sm font-medium text-foreground">{kilnkinCompanion.name}</Text>
          </View>
        </TouchableOpacity>

        {activeCommunityChallenge ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/community')}
            activeOpacity={0.86}
            className="absolute left-4 rounded-2xl border border-green-200 bg-green-50 px-3 py-2"
            style={{ bottom: 78 }}
            accessibilityRole="button"
            accessibilityLabel="Open active community challenge"
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Trophy size={12} color="hsl(100 35% 44%)" />
              <Text className="text-[10px] font-semibold uppercase" style={{ color: 'hsl(100 35% 44%)' }}>
                Active Challenge
              </Text>
            </View>
            <Text className="text-xs font-semibold text-foreground">{activeCommunityChallenge.title}</Text>
            <Text className="text-[11px] text-muted-foreground mt-0.5">
              {activeCommunityChallenge.track} · {activeCommunityChallenge.phase}
            </Text>
            <Text className="text-[11px] text-primary mt-1">{activeCommunityChallenge.daysLeft} days left · Open in Community</Text>
          </TouchableOpacity>
        ) : null}

        {/* Missions widget — top-left, full interactive quest board */}
        {missionsSummary.total === 0 ? (
          <TouchableOpacity
            onPress={() => router.push('/profile/studio-rhythm')}
            activeOpacity={0.86}
            className="absolute left-4 rounded-2xl border border-dashed border-primary/40 bg-card/92 px-4 py-4"
            style={{ top: missionsTop, right: 16 }}
            accessibilityRole="button"
            accessibilityLabel="Set up Studio Rhythm to get daily missions"
          >
            <View className="flex-row items-center gap-2 mb-1.5">
              <Trophy size={14} color="hsl(36 70% 48%)" />
              <Text className="text-sm font-serif font-bold text-foreground">Daily Quest Board</Text>
            </View>
            <Text className="text-xs text-muted-foreground leading-5 mb-3">
              No missions yet. Set up your Studio Rhythm to get a daily checklist shaped around your pottery practice.
            </Text>
            <View className="flex-row items-center gap-1.5 self-start bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5">
              <CalendarDays size={12} color="hsl(38 80% 45%)" />
              <Text className="text-xs font-semibold text-primary">Set up Studio Rhythm →</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View
            className="absolute left-4 rounded-2xl border border-border bg-card/95 overflow-hidden"
            style={{ top: missionsTop, right: 16, maxHeight: 480 }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
              <View className="flex-row items-center gap-2">
                <Trophy size={14} color="hsl(36 70% 48%)" />
                <Text className="text-sm font-serif font-bold text-foreground">Daily Quest Board</Text>
              </View>
              <Text className="text-xs font-semibold text-primary">
                {missionsSummary.completedCount}/{missionsSummary.total}
              </Text>
            </View>

            {/* Progress bar */}
            <View className="h-1 rounded-full bg-muted mx-4 mb-3 overflow-hidden">
              <View
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${missionsSummary.total > 0
                    ? Math.round((missionsSummary.completedCount / missionsSummary.total) * 100)
                    : 0}%`,
                }}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
              nestedScrollEnabled
            >
              {missionsSummary.all.map((mission) => {
                const meta = MISSION_META[mission.type];
                if (!meta) return null;
                const Icon = meta.Icon;
                return (
                  <View
                    key={mission.type}
                    className={`rounded-2xl p-3 mb-2.5 border ${
                      mission.completed ? 'border-primary/35 bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <View className="flex-row items-start gap-2.5 mb-2">
                      <View className={`w-9 h-9 rounded-xl items-center justify-center border border-border ${meta.chipClassName}`}>
                        <Icon size={16} color={meta.iconColor} />
                      </View>
                      <View className="flex-1">
                        <Text className={`text-xs font-semibold ${mission.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {meta.title}
                        </Text>
                        <Text
                          className={`text-[11px] mt-0.5 leading-4 ${
                            mission.completed ? 'text-muted-foreground line-through' : 'text-muted-foreground'
                          }`}
                        >
                          {mission.text}
                        </Text>
                      </View>
                      <View
                        className={`rounded-full px-2 py-0.5 self-start border ${
                          mission.completed ? 'bg-green-50 border-green-200' : 'bg-muted border-border'
                        }`}
                      >
                        <Text className={`text-[9px] font-medium ${mission.completed ? 'text-green-700' : 'text-muted-foreground'}`}>
                          {mission.completed ? 'Done' : 'Active'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => router.push(mission.route as never)}
                        activeOpacity={0.8}
                        className="flex-1 rounded-xl border border-border bg-background py-1.5 items-center justify-center"
                      >
                        <Text className="text-[11px] font-medium text-foreground">{mission.actionLabel}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleDailyMissionCompletion(todayMissionKey, mission.type)}
                        activeOpacity={0.8}
                        className={`flex-1 rounded-xl py-1.5 items-center justify-center flex-row gap-1 ${
                          mission.completed ? 'bg-muted border border-border' : 'bg-primary'
                        }`}
                      >
                        <Check size={12} color={mission.completed ? 'hsl(24 20% 35%)' : 'white'} />
                        <Text className={`text-[11px] font-medium ${mission.completed ? 'text-foreground' : 'text-white'}`}>
                          {mission.completed ? 'Reopen' : 'Conclude'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Today's Rhythm widget — always visible */}
        <TouchableOpacity
          onPress={() => router.push('/profile/studio-rhythm')}
          activeOpacity={0.86}
          className="absolute right-4 rounded-2xl border border-border bg-card/92 px-3 py-2.5"
          style={{ bottom: 60 }}
          accessibilityRole="button"
          accessibilityLabel="Open Studio Rhythm planner"
        >
          <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Today</Text>
          {todayRhythm.isEmpty ? (
            <View className="flex-row items-center gap-1.5">
              <Text style={{ fontSize: 14 }}>☕</Text>
              <Text className="text-xs text-muted-foreground">Rest day</Text>
            </View>
          ) : (
            <>
              {todayRhythm.stages.map((stage) => (
                <View key={stage} className="flex-row items-center gap-1.5 mb-1">
                  <Text style={{ fontSize: 14 }}>{STAGE_CONFIG[stage].emoji}</Text>
                  <Text className="text-xs text-foreground font-medium">{STAGE_CONFIG[stage].label}</Text>
                </View>
              ))}
              {todayRhythm.events.map((event) => {
                const cat = EVENT_CATEGORIES.find((c) => c.id === event.categoryId);
                return (
                  <View key={event.id} className="flex-row items-center gap-1.5 mb-1">
                    <Text style={{ fontSize: 14 }}>{cat?.emoji ?? '📅'}</Text>
                    <Text className="text-xs text-foreground font-medium" numberOfLines={1}>{event.name}</Text>
                  </View>
                );
              })}
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFeedbackOpen(true)}
          activeOpacity={0.86}
          className="absolute right-4 bottom-4 rounded-2xl border border-border bg-card/92 px-3 py-2 flex-row items-center gap-2"
          accessibilityRole="button"
          accessibilityLabel="Leave feedback"
        >
          <MessageSquarePlus size={16} color="hsl(24 20% 35%)" />
          <Text className="text-xs font-medium text-foreground">Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
          className="absolute right-4 h-12 w-12 rounded-full border-2 border-background bg-primary items-center justify-center overflow-hidden"
          style={{ top: topOverlayOffset }}
        >
          {user.avatarImageUri ? (
            <Image
              source={{ uri: user.avatarImageUri }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityLabel="Open profile"
            />
          ) : (
            <Text className="text-primary-foreground font-semibold">{user.avatarInitial}</Text>
          )}
        </TouchableOpacity>
      </View>
      <FeedbackModal visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </View>
  );
}
