import { Text } from '@/src/components/ui/text';
import { generateStudioRhythmSuggestions } from '@/src/screens/overview/generateStudioRhythmSuggestions';
import { getStudioAlerts } from '@/src/screens/overview/getStudioAlerts';
import { getTodayMissionKey } from '@/src/screens/overview/missionDate';
import { getDateKey } from '@/src/screens/overview/studioRhythm';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { BarChart3, BellRing, CalendarDays, ClipboardList, MessageSquarePlus, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, Linking, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudioScene } from './components/StudioScene';

const FEEDBACK_EMAIL = process.env.EXPO_PUBLIC_FEEDBACK_EMAIL ?? 'support@pottery-life.app';

export function OverviewPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAppStore((state) => state.user);
  const kilnkinCompanion = useAppStore((state) => state.kilnkinCompanion);
  const pieces = useAppStore((state) => state.pieces);
  const firings = useAppStore((state) => state.firings);
  const studioRhythmConfig = useAppStore((state) => state.studioRhythmConfig);
  const dailyMissionCompletion = useAppStore((state) => state.dailyMissionCompletion);
  const [sceneHeight, setSceneHeight] = React.useState(0);
  const todayMissionKey = getTodayMissionKey();
  const topOverlayOffset = insets.top + 8;
  const hudRailOffset = insets.top + 60;
  const activeCommunityChallenge = React.useMemo(
    () => ({
      title: 'Underwater Forms Festival',
      track: 'Beginner Track',
      phase: 'Submissions open',
      daysLeft: 6,
    }),
    []
  );

  const missionsCount = React.useMemo(
    () => {
      const suggestions = generateStudioRhythmSuggestions({
        pieces,
        firings,
        routineConfiguration: studioRhythmConfig,
        upcomingEvents: studioRhythmConfig.scheduledEvents,
      });
      const completed = dailyMissionCompletion[todayMissionKey] ?? [];

      return suggestions.filter((suggestion) => !completed.includes(suggestion.type)).length;
    },
    [dailyMissionCompletion, firings, pieces, studioRhythmConfig, todayMissionKey]
  );

  const analyticsAlerts = React.useMemo(() => {
    const inProgress = pieces.filter((piece) => ['idea', 'forming', 'leather-hard', 'trimming'].includes(piece.stage)).length;
    const finished = pieces.filter((piece) => piece.stage === 'finished').length;
    const glazeReady = pieces.filter((piece) => piece.stage === 'glaze-fired' || piece.stage === 'bone-dry').length;

    const completedBadges = [
      { current: inProgress, target: 8 },
      { current: glazeReady, target: 5 },
      { current: finished, target: 12 },
    ].filter((badge) => badge.current >= badge.target).length;

    return completedBadges;
  }, [pieces]);

  const calendarNudge = React.useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = getDateKey(tomorrow);
    const plannedTomorrow = studioRhythmConfig.scheduledEvents.filter((event) => getDateKey(event.date) === tomorrowKey).length;
    const isDefaultRhythm =
      studioRhythmConfig.wheelPractice &&
      !studioRhythmConfig.reclaimFocus &&
      studioRhythmConfig.preferredTrimAfterDays === 3 &&
      studioRhythmConfig.weeklyGoals.filter((goal) => goal.active).length <= 1 &&
      studioRhythmConfig.scheduledEvents.length === 0;

    if (plannedTomorrow > 0) {
      return plannedTomorrow;
    }

    return isDefaultRhythm ? 1 : 0;
  }, [studioRhythmConfig]);

  const studioAlerts = React.useMemo(
    () => getStudioAlerts({ companion: kilnkinCompanion, pieces, firings, studioRhythmConfig }),
    [firings, kilnkinCompanion, pieces, studioRhythmConfig]
  );

  const handleFeedbackPress = React.useCallback(async () => {
    const feedbackUrl = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Pottery Life Feedback')}`;

    try {
      const supported = await Linking.canOpenURL(feedbackUrl);
      if (!supported) {
        Alert.alert('Feedback unavailable', 'Email is not available on this device right now.');
        return;
      }

      await Linking.openURL(feedbackUrl);
    } catch {
      Alert.alert('Feedback unavailable', 'Could not open feedback email right now.');
    }
  }, []);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: '#EBB23F' }}
      onLayout={(event) => {
        const nextHeight = Math.round(event.nativeEvent.layout.height);
        setSceneHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
      }}
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

        {/* {activeCommunityChallenge ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/community')}
            activeOpacity={0.86}
            className="absolute left-4 rounded-2xl border border-green-200 bg-card/92 px-3 py-2"
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
        ) : null} */}

        <View
          className="absolute right-3 rounded-3xl bg-card/85 border border-border px-2 py-2 gap-2"
          style={{ top: hudRailOffset }}
        >
          <TouchableOpacity
            onPress={() => router.push('/overview-alerts')}
            activeOpacity={0.8}
            className="relative w-11 h-11 rounded-2xl bg-background border border-border items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Open studio alerts"
          >
            <BellRing size={20} color="hsl(24 20% 35%)" />
            {studioAlerts.length > 0 ? (
              <View className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-destructive items-center justify-center px-1">
                <Text className="text-[10px] text-destructive-foreground font-medium">{studioAlerts.length}</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/overview-missions')}
            activeOpacity={0.8}
            className="relative w-11 h-11 rounded-2xl bg-background border border-border items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Open today missions"
          >
            <ClipboardList size={20} color="hsl(24 20% 35%)" />
            {missionsCount > 0 ? (
              <View className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-destructive items-center justify-center px-1">
                <Text className="text-[10px] text-destructive-foreground font-medium">{missionsCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/overview-analytics')}
            activeOpacity={0.8}
            className="relative w-11 h-11 rounded-2xl bg-background border border-border items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Open studio analytics and badges"
          >
            <BarChart3 size={20} color="hsl(24 20% 35%)" />
            {analyticsAlerts > 0 ? (
              <View className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-destructive items-center justify-center px-1">
                <Text className="text-[10px] text-destructive-foreground font-medium">{analyticsAlerts}</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/profile/studio-rhythm')}
            activeOpacity={0.8}
            className="relative w-11 h-11 rounded-2xl bg-background border border-border items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Open routine calendar"
          >
            <CalendarDays size={20} color="hsl(24 20% 35%)" />
            {calendarNudge > 0 ? (
              <View className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-destructive items-center justify-center px-1">
                <Text className="text-[10px] text-destructive-foreground font-medium">{calendarNudge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/app-customization')}
            activeOpacity={0.8}
            className="relative w-11 h-11 rounded-2xl bg-background border border-border items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Open app customization"
          >
            <SlidersHorizontal size={18} color="hsl(24 20% 35%)" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleFeedbackPress}
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
    </View>
  );
}
