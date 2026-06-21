import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { generateSetupQuests } from '@/src/screens/overview/setupQuests/generateSetupQuests';
import { generateStudioRhythmSuggestions } from '@/src/screens/overview/studioRythm/generateStudioRhythmSuggestions';
import { getDateKey, isStudioRhythmConfigured } from '@/src/screens/overview/studioRythm/studioRhythm';
import { buildActivityFeed } from '@/src/screens/overview/utils/activityFeed';
import { getStudioSignals } from '@/src/screens/overview/utils/getStudioSignals';
import { getKilnkinNudge } from '@/src/screens/overview/utils/kilnkinNudge';
import { mapPiecesToStudioPositions } from '@/src/screens/overview/utils/mapPiecesToStudioPositions';
import { getTodayMissionKey } from '@/src/screens/overview/utils/missionDate';
import { buildQueuePreview } from '@/src/screens/overview/utils/buildQueuePreview';
import { ACTIVE_FIRING_STATES, buildOneThingCard } from '@/src/screens/overview/utils/oneThingCard';
import { getPetMood, PAT_REACTIONS } from '@/src/screens/overview/utils/petMood';
import { useAppStore, useVisiblePieces } from '@/src/store';
import { useNormalizedEnabledModules } from '@/src/store/appStore';
import { resolveKilnDestination } from '@/src/screens/overview/utils/kilnNavigation';
import {
  buildFiringQueueSnapshot,
  shouldShowFiringQueueWidget,
} from '@/src/screens/overview/utils/firingQueueUtils';
import { PremiumFeature } from '@/src/utils/premiumGate';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CustomTodo = {
  id: string;
  title: string;
  completed: boolean;
};

const DOW_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function useOverviewPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useCurrentUser();
  const { requestAccess, PaywallGate } = usePremiumGate();
  const user = useAppStore((state) => state.user);
  const kilnkinCompanion = useAppStore((state) => state.kilnkinCompanion);
  const kilns = useAppStore((state) => state.kilns);
  const onboardingProfile = useAppStore((state) => state.onboardingProfile);
  const setupProgress = useAppStore((state) => state.setupProgress);
  const pricingOnboardingCompleted = useAppStore((state) => state.pricingOnboardingCompleted);
  const glazes = useAppStore((state) => state.glazes);
  const glazeTests = useAppStore((state) => state.glazeTests);
  const pieces = useVisiblePieces();
  const enabledModules = useNormalizedEnabledModules();
  const hasKilnTab = enabledModules.includes('kiln');
  const hasCommunityTab = enabledModules.includes('community');
  const firings = useAppStore((state) => state.firings);
  const rhythm = useAppStore((state) => state.studioRhythm);
  const rhythmConfigured = isStudioRhythmConfigured(rhythm);
  const dailyMissionCompletion = useAppStore((state) => state.dailyMissionCompletion);
  const toggleDailyMissionCompletion = useAppStore((state) => state.toggleDailyMissionCompletion);
  const todayMissionKey = getTodayMissionKey();
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [showJournalWidget, setShowJournalWidget] = React.useState(false);
  const [draftTodo, setDraftTodo] = React.useState('');
  const [showAddTodoComposer, setShowAddTodoComposer] = React.useState(false);
  const [customTodosByDay, setCustomTodosByDay] = React.useState<Record<string, CustomTodo[]>>({});
  const [showAllMissionTasks, setShowAllMissionTasks] = React.useState(false);

  const setupQuests = React.useMemo(
    () => generateSetupQuests({
      kilnCount: kilns.length,
      studioRhythmConfigured: rhythmConfigured,
      pieceCount: pieces.length,
      hasOwnKiln: onboardingProfile.hasOwnKiln,
      userType: onboardingProfile.userType,
      setupProgress,
      pricingOnboardingCompleted,
      glazeIds: glazes.map((g) => g.id),
    }),
    [kilns.length, rhythmConfigured, pieces.length, onboardingProfile.hasOwnKiln, onboardingProfile.userType, setupProgress, pricingOnboardingCompleted, glazes]
  );
  const initialSetupQuestCount = useAppStore((state) => state.initialSetupQuestCount);
  const setInitialSetupQuestCount = useAppStore((state) => state.setInitialSetupQuestCount);
  const prevQuestCountRef = React.useRef(setupQuests.length);

  React.useEffect(() => {
    if (setupQuests.length > 0 && initialSetupQuestCount === null) {
      setInitialSetupQuestCount(setupQuests.length);
    } else if (
      initialSetupQuestCount !== null &&
      setupQuests.length > prevQuestCountRef.current
    ) {
      const added = setupQuests.length - prevQuestCountRef.current;
      setInitialSetupQuestCount(initialSetupQuestCount + added);
    }
    prevQuestCountRef.current = setupQuests.length;
  }, [setupQuests.length, initialSetupQuestCount, setInitialSetupQuestCount]);

  const tomorrowRhythm = React.useMemo(() => {
    if (!rhythmConfigured) return { stages: [], events: [] };
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dow = (tomorrow.getDay() + 6) % 7;
    const tomorrowKey = getDateKey(tomorrow);
    const stages = rhythm.stageDays.filter((sd) => sd.days.includes(dow)).map((sd) => sd.stage);
    const events = rhythm.events.filter((e) => e.date.slice(0, 10) === tomorrowKey);
    return { stages, events };
  }, [rhythm, rhythmConfigured]);

  const missionsSummary = React.useMemo(() => {
    if (!rhythmConfigured) {
      return { total: 0, completedCount: 0, all: [], remaining: [], topMission: null };
    }
    const suggestions = generateStudioRhythmSuggestions({ pieces, firings, rhythm });
    const completed = dailyMissionCompletion[todayMissionKey] ?? [];
    const total = suggestions.length;
    const completedCount = completed.filter((t) => suggestions.some((s) => s.type === t)).length;
    const all = suggestions.map((s) => ({ ...s, completed: completed.includes(s.type) }));
    const remaining = all.filter((s) => !s.completed);
    return { total, completedCount, all, remaining, topMission: remaining[0] ?? null };
  }, [pieces, firings, rhythm, rhythmConfigured, dailyMissionCompletion, todayMissionKey]);

  const todayRhythm = React.useMemo(() => {
    if (!rhythmConfigured) {
      return { stages: [], events: [], isEmpty: true };
    }
    const dow = (new Date().getDay() + 6) % 7;
    const todayKey = getDateKey();
    const stages = rhythm.stageDays.filter((sd) => sd.days.includes(dow)).map((sd) => sd.stage);
    const events = rhythm.events.filter((e) => e.date.slice(0, 10) === todayKey);
    return { stages, events, isEmpty: stages.length === 0 && events.length === 0 };
  }, [rhythm, rhythmConfigured]);

  const isSetupMode = setupQuests.length > 0;

  const stagePositions = React.useMemo(() => mapPiecesToStudioPositions(pieces), [pieces]);
  const studioSignals = React.useMemo(() => getStudioSignals({ pieces, firings }), [pieces, firings]);
  const kilnkinNudge = React.useMemo(
    () => getKilnkinNudge({ ...studioSignals, stagePositions, pieces, personality: kilnkinCompanion.personality }),
    [studioSignals, stagePositions, pieces, kilnkinCompanion.personality]
  );

  const activeFiring = React.useMemo(
    () => firings.find((f) => ACTIVE_FIRING_STATES.has(f.state)) ?? null,
    [firings]
  );

  const petMood = React.useMemo(
    () => getPetMood({
      activeFiring: activeFiring !== null,
      kilnReady: studioSignals.kilnReady,
      dryingTooLong: studioSignals.dryingTooLong,
      scrapOverflow: studioSignals.scrapOverflow,
      isRestDay: todayRhythm.isEmpty,
      totalPieces: pieces.length,
    }),
    [activeFiring, studioSignals, todayRhythm.isEmpty, pieces.length]
  );

  const [patReaction, setPatReaction] = React.useState<string | null>(null);
  const patTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroReveal = React.useRef(new Animated.Value(0)).current;
  const focusReveal = React.useRef(new Animated.Value(0)).current;
  const secondaryReveal = React.useRef(new Animated.Value(0)).current;
  const journalReveal = React.useRef(new Animated.Value(0)).current;
  const testWallReveal = React.useRef(new Animated.Value(0)).current;

  const seenCeremonies = useAppStore((s) => s.seenCeremonies);
  const markCeremonyAsSeen = useAppStore((s) => s.markCeremonyAsSeen);
  const studioCreatedAt = useAppStore((s) => s.studioCreatedAt);
  const [overlayCeremony, setOverlayCeremony] = React.useState<{
    emoji: string; title: string; subtitle: string; tint: string;
  } | null>(null);

  React.useEffect(() => {
    const now = new Date();
    const mm = now.getMonth() + 1;
    const dd = now.getDate();
    const year = now.getFullYear();

    if (studioCreatedAt) {
      const created = new Date(studioCreatedAt);
      const createdYear = created.getFullYear();
      const yearsElapsed = year - createdYear;
      if (yearsElapsed > 0 && created.getMonth() + 1 === mm && created.getDate() === dd) {
        const key = `studio-anniversary-${year}`;
        if (!seenCeremonies.includes(key)) {
          markCeremonyAsSeen(key);
          setOverlayCeremony({
            emoji: '🏺',
            title: `${yearsElapsed} year${yearsElapsed > 1 ? 's' : ''} in the studio!`,
            subtitle: `Happy studio anniversary. Keep making things.`,
            tint: 'rgba(211, 165, 60, 1)',
          });
          return;
        }
      }
    }

    if (kilnkinCompanion?.bornOn) {
      const bornDate = new Date(kilnkinCompanion.bornOn);
      if (bornDate.getMonth() + 1 === mm && bornDate.getDate() === dd) {
        const key = `kilnkin-birthday-${year}`;
        if (!seenCeremonies.includes(key)) {
          markCeremonyAsSeen(key);
          setOverlayCeremony({
            emoji: '🎂',
            title: `Happy birthday, ${kilnkinCompanion.name}!`,
            subtitle: `Your companion turns ${year - bornDate.getFullYear()} today.`,
            tint: 'rgba(180, 130, 211, 1)',
          });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePat = React.useCallback(() => {
    if (patTimeoutRef.current) clearTimeout(patTimeoutRef.current);
    const reaction = PAT_REACTIONS[Math.floor(Math.random() * PAT_REACTIONS.length)];
    setPatReaction(reaction);
    patTimeoutRef.current = setTimeout(() => setPatReaction(null), 2000);
  }, []);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(heroReveal, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(focusReveal, {
        toValue: 1,
        duration: 440,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(secondaryReveal, {
        toValue: 1,
        duration: 420,
        delay: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(journalReveal, {
        toValue: 1,
        duration: 440,
        delay: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(testWallReveal, {
        toValue: 1,
        duration: 440,
        delay: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      if (patTimeoutRef.current) clearTimeout(patTimeoutRef.current);
    };
  }, [heroReveal, focusReveal, secondaryReveal, journalReveal, testWallReveal]);

  const oneThingCard = React.useMemo(
    () => buildOneThingCard(activeFiring, studioSignals, stagePositions, hasKilnTab),
    [activeFiring, studioSignals, stagePositions, hasKilnTab]
  );

  const queuePreview = React.useMemo(
    () => buildQueuePreview(firings, kilns, hasKilnTab),
    [firings, kilns, hasKilnTab]
  );


  const kilnQueueRoute = resolveKilnDestination(hasKilnTab);

  const firingQueueSnapshot = React.useMemo(
    () => buildFiringQueueSnapshot(pieces, stagePositions.glazeRack.length),
    [pieces, stagePositions.glazeRack.length],
  );

  const activeFiringSummary = React.useMemo(() => {
    if (!activeFiring) return null;
    const ready = activeFiring.expectedReadyAt;
    const hoursLeft = ready
      ? Math.max(0, Math.round((new Date(ready).getTime() - Date.now()) / (1000 * 60 * 60)))
      : null;
    const stateLabels: Record<string, string> = {
      loading: 'Loading the kiln',
      firing: 'Firing in progress',
      cooling: 'Cooling down',
      unloading: 'Ready to unload',
    };
    return {
      label: stateLabels[activeFiring.state] ?? activeFiring.state,
      subtitle: activeFiring.name + (hoursLeft != null ? ` · ~${hoursLeft}h until ready` : ''),
    };
  }, [activeFiring]);

  const showFiringQueueWidget = shouldShowFiringQueueWidget({
    snapshot: firingQueueSnapshot,
    activeFiring: activeFiringSummary,
    queuePreview,
  });

  const activityFeed = React.useMemo(() => buildActivityFeed(pieces), [pieces]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayLabel = DOW_LABELS[(new Date().getDay() + 6) % 7];
  const customTodos = customTodosByDay[todayMissionKey] ?? [];

  const addCustomTodo = React.useCallback(() => {
    const title = draftTodo.trim();
    if (!title) return;
    setCustomTodosByDay((prev) => {
      const current = prev[todayMissionKey] ?? [];
      return {
        ...prev,
        [todayMissionKey]: [{ id: `${Date.now()}`, title, completed: false }, ...current],
      };
    });
    setDraftTodo('');
    setShowAddTodoComposer(false);
  }, [draftTodo, todayMissionKey]);

  const toggleCustomTodo = React.useCallback((id: string) => {
    setCustomTodosByDay((prev) => {
      const current = prev[todayMissionKey] ?? [];
      return {
        ...prev,
        [todayMissionKey]: current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
      };
    });
  }, [todayMissionKey]);

  const stageChips = [
    { label: 'In Progress', piecesInSlot: stagePositions.workTable, route: '/(tabs)/pieces?stage=idea,forming,leather-hard,trimming', emoji: '🪆', urgent: false },
    { label: 'Drying', piecesInSlot: stagePositions.dryingShelf, route: '/(tabs)/pieces?stage=drying', emoji: '💨', urgent: studioSignals.dryingTooLong },
    { label: 'Kiln queue', piecesInSlot: stagePositions.kilnArea, route: '/(tabs)/pieces?stage=bone-dry,glazing', emoji: '🔥', urgent: studioSignals.kilnReady },
    { label: 'Ready to glaze', piecesInSlot: stagePositions.glazeRack, route: '/(tabs)/pieces?stage=bisque', emoji: '🎨', urgent: false },
    { label: 'Finished', piecesInSlot: stagePositions.finishedCabinet, route: '/(tabs)/pieces?stage=glaze-fired,finished', emoji: '✨', urgent: false },
  ].map((chip) => ({
    ...chip,
    count: chip.piecesInSlot.length,
  }));

  const missionChecklistCount = missionsSummary.total + customTodos.length;
  const missionChecklistDone = missionsSummary.completedCount + customTodos.filter((t) => t.completed).length;
  const visibleMissions = showAllMissionTasks ? missionsSummary.all : missionsSummary.all.slice(0, 3);
  const visibleCustomTodos = showAllMissionTasks ? customTodos : customTodos.slice(0, 2);
  const hiddenTaskCount = (missionsSummary.all.length - visibleMissions.length) + (customTodos.length - visibleCustomTodos.length);

  const navigate = React.useCallback((route: Href) => {
    router.push(route);
  }, [router]);

  return {
    insets,
    PaywallGate,
    user,
    kilnkinCompanion,
    feedbackOpen,
    setFeedbackOpen,
    overlayCeremony,
    setOverlayCeremony,
    greeting,
    todayLabel,
    isSetupMode,
    todayRhythm,
    tomorrowRhythm,
    setupQuests,
    initialSetupQuestCount,
    heroReveal,
    focusReveal,
    journalReveal,
    testWallReveal,
    glazeTests,
    glazes,
    oneThingCard,
    queuePreview,
    pieces,
    missionsSummary,
    stageChips,
    kilnkinNudge,
    petMood,
    patReaction,
    handlePat,
    rhythmConfigured,
    missionChecklistCount,
    missionChecklistDone,
    visibleMissions,
    visibleCustomTodos,
    customTodos,
    hiddenTaskCount,
    showAllMissionTasks,
    setShowAllMissionTasks,
    showAddTodoComposer,
    setShowAddTodoComposer,
    draftTodo,
    setDraftTodo,
    addCustomTodo,
    toggleCustomTodo,
    todayMissionKey,
    toggleDailyMissionCompletion,
    activityFeed,
    showJournalWidget,
    setShowJournalWidget,
    navigate,
    onAnalyticsPress: () => {
      if (requestAccess(PremiumFeature.Analytics)) {
        navigate('/analytics');
      }
    },
    onProfilePress: () => navigate('/(tabs)/profile'),
    onKilnkinPress: () => navigate('/kilnkin'),
    onChallengePress: () => navigate('/(tabs)/community?tab=challenges'),
    hasKilnTab,
    hasCommunityTab,
    kilnQueueRoute,
    firingQueueSnapshot,
    activeFiringSummary,
    showFiringQueueWidget,
  };
}
