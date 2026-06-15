import { CeremonyOverlay } from '@/src/components/CeremonyOverlay';
import { Text } from '@/src/components/ui/text';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { getKilnkinVoiceLine } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import { generateSetupQuests, type SetupQuestKey } from '@/src/screens/overview/setupQuests/generateSetupQuests';
import { generateStudioRhythmSuggestions } from '@/src/screens/overview/studioRythm/generateStudioRhythmSuggestions';
import { STAGE_CONFIG, getDateKey, isStudioRhythmConfigured } from '@/src/screens/overview/studioRythm/studioRhythm';
import { getStudioSignals } from '@/src/screens/overview/utils/getStudioSignals';
import { mapPiecesToStudioPositions, type StudioPiecePositions } from '@/src/screens/overview/utils/mapPiecesToStudioPositions';
import { getTodayMissionKey } from '@/src/screens/overview/utils/missionDate';
import { useAppStore, useVisiblePieces } from '@/src/store';
import type { Piece } from '@/src/types/pieces';
import { PremiumFeature } from '@/src/utils/premiumGate';
import { useRouter } from 'expo-router';
import { BarChart2, Calculator, CalendarDays, Check, ChevronDown, ChevronRight, ChevronUp, Database, Flame, Hammer, Layers, LayoutGrid, MessageSquarePlus, Plus, Scissors, Sparkles, Trophy, Zap } from 'lucide-react-native';
import React from 'react';
import { Animated, Easing, Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedbackModal } from './components/FeedbackModal';


type MissionIcon = React.ComponentType<{ size?: number; color?: string }>;
const MISSION_META: Record<string, { title: string; Icon: MissionIcon; iconColor: string; chipClassName: string }> = {
  trim: { title: 'Trim Watch', Icon: Scissors, iconColor: 'hsl(39 57% 51%)', chipClassName: 'bg-primary/10' },
  reclaim: { title: 'Reclaim Loop', Icon: Hammer, iconColor: 'hsl(35 65% 42%)', chipClassName: 'bg-amber-50' },
  'wheel-practice': { title: 'Wheel Focus', Icon: Sparkles, iconColor: 'hsl(270 55% 52%)', chipClassName: 'bg-purple-50' },
  'kiln-check': { title: 'Kiln Check', Icon: Flame, iconColor: 'hsl(16 78% 52%)', chipClassName: 'bg-red-50' },
  'upcoming-event': { title: 'Calendar Nudge', Icon: CalendarDays, iconColor: 'hsl(213 70% 45%)', chipClassName: 'bg-blue-50' },
  'goal-focus': { title: 'Weekly Goal', Icon: Trophy, iconColor: 'hsl(44 70% 45%)', chipClassName: 'bg-yellow-50' },
};

const SETUP_QUEST_META: Record<SetupQuestKey, { Icon: MissionIcon; iconColor: string; iconBg: string }> = {
  'customize-stages': { Icon: Layers, iconColor: 'hsl(213 55% 42%)', iconBg: 'hsl(213 50% 92%)' },
  'set-clay-bodies': { Icon: Database, iconColor: 'hsl(32 45% 38%)', iconBg: 'hsl(35 46% 88%)' },
  'set-bisque-cone': { Icon: Flame, iconColor: 'hsl(24 65% 42%)', iconBg: 'hsl(24 60% 90%)' },
  'set-glaze-cone': { Icon: Zap, iconColor: 'hsl(39 57% 45%)', iconBg: 'hsl(44 70% 88%)' },
  'set-pricing': { Icon: Calculator, iconColor: 'hsl(32 40% 38%)', iconBg: 'hsl(35 42% 88%)' },
  'configure-modules': { Icon: LayoutGrid, iconColor: 'hsl(32 40% 38%)', iconBg: 'hsl(35 42% 88%)' },
  'studio-rhythm': { Icon: CalendarDays, iconColor: 'hsl(160 40% 38%)', iconBg: 'hsl(150 35% 90%)' },
  'add-kiln': { Icon: Flame, iconColor: 'hsl(16 65% 42%)', iconBg: 'hsl(16 60% 90%)' },
  'log-first-piece': { Icon: Plus, iconColor: 'hsl(130 40% 36%)', iconBg: 'hsl(130 35% 90%)' },
  'create-glaze-recipe': { Icon: Sparkles, iconColor: 'hsl(270 40% 48%)', iconBg: 'hsl(270 35% 92%)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(timestamp: string, now: Date = new Date()): number {
  const t = new Date(timestamp);
  if (Number.isNaN(t.getTime())) return 0;
  return Math.floor((now.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
}

type ActivityEntry = {
  id: string;
  pieceName: string;
  piecePhoto?: string;
  stage: string;
  timestamp: string;
  daysAgo: number;
};

type CustomTodo = {
  id: string;
  title: string;
  completed: boolean;
};

const STAGE_LABELS: Record<string, string> = {
  idea: 'Idea',
  forming: 'Forming',
  'leather-hard': 'Leather Hard',
  trimming: 'Trimming',
  drying: 'Drying',
  'bone-dry': 'Bone Dry',
  bisque: 'Bisque',
  glazing: 'Glazing',
  'glaze-fired': 'Glaze Fired',
  finished: 'Finished',
  cemetery: 'Retired',
};

const STAGE_BADGE_COLORS: Record<string, { dot: string; text: string }> = {
  idea:          { dot: 'hsl(270 45% 52%)', text: 'hsl(270 40% 38%)' },
  forming:       { dot: 'hsl(24 60% 50%)',  text: 'hsl(24 55% 36%)' },
  'leather-hard':{ dot: 'hsl(30 55% 48%)',  text: 'hsl(30 50% 34%)' },
  trimming:      { dot: 'hsl(35 55% 48%)',  text: 'hsl(35 50% 34%)' },
  drying:        { dot: 'hsl(210 50% 52%)', text: 'hsl(210 45% 36%)' },
  'bone-dry':    { dot: 'hsl(210 45% 50%)', text: 'hsl(210 40% 34%)' },
  bisque:        { dot: 'hsl(16 55% 50%)',  text: 'hsl(16 50% 36%)' },
  glazing:       { dot: 'hsl(130 42% 46%)', text: 'hsl(130 40% 32%)' },
  'glaze-fired': { dot: 'hsl(44 60% 46%)',  text: 'hsl(44 55% 32%)' },
  finished:      { dot: 'hsl(130 45% 42%)', text: 'hsl(130 42% 28%)' },
  cemetery:      { dot: 'hsl(0 30% 52%)',   text: 'hsl(0 25% 38%)' },
};

function buildActivityFeed(pieces: Piece[], limit = 8): ActivityEntry[] {
  const now = new Date();
  const entries: ActivityEntry[] = [];
  for (const piece of pieces) {
    for (const entry of piece.timeline) {
      if (!entry.timestamp) continue;
      const t = new Date(entry.timestamp);
      if (Number.isNaN(t.getTime())) continue;
      entries.push({
        id: `${piece.id}-${entry.stage}-${entry.timestamp}`,
        pieceName: piece.name,
        piecePhoto: piece.photo ?? piece.imgUrl,
        stage: entry.stage,
        timestamp: entry.timestamp,
        daysAgo: Math.floor((now.getTime() - t.getTime()) / (1000 * 60 * 60 * 24)),
      });
    }
  }
  return entries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

type WidgetCardProps = {
  title: string;
  status?: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  accentColor?: string;
  children?: React.ReactNode;
};

function WidgetCard({
  title,
  status,
  description,
  primaryActionLabel,
  onPrimaryAction,
  expanded = true,
  onToggleExpand,
  accentColor = 'hsl(31 44% 34%)',
  children,
}: WidgetCardProps) {
  return (
    <View
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        backgroundColor: 'hsl(40 30% 99%)',
        shadowColor: '#3f2a12',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="px-4 py-3" style={{ backgroundColor: 'hsl(38 28% 96%)' }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.9, color: accentColor, textTransform: 'uppercase' }}>{title}</Text>
            {description ? <Text style={{ fontSize: 11, color: 'hsl(32 30% 42%)', marginTop: 3 }}>{description}</Text> : null}
          </View>
          <View className="flex-row items-center gap-2">
            {status ? <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(32 30% 42%)' }}>{status}</Text> : null}
            {onToggleExpand ? (
              <TouchableOpacity
                onPress={onToggleExpand}
                activeOpacity={0.82}
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: 'hsl(34 28% 90%)' }}
              >
                {expanded ? <ChevronUp size={15} color="hsl(31 40% 34%)" /> : <ChevronDown size={15} color="hsl(31 40% 34%)" />}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        {primaryActionLabel && onPrimaryAction ? (
          <TouchableOpacity
            onPress={onPrimaryAction}
            activeOpacity={0.82}
            className="rounded-full px-3 py-1.5 flex-row items-center gap-1 self-start mt-2"
            style={{ backgroundColor: 'hsl(35 42% 80%)' }}
          >
            <Plus size={12} color="hsl(33 42% 32%)" />
            <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(33 42% 32%)' }}>{primaryActionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {expanded ? children : null}
    </View>
  );
}



// ─── Pet mood ────────────────────────────────────────────────────────────────

type PetMood = 'excited' | 'happy' | 'worried' | 'cozy' | 'focused' | 'sleepy';

const PET_MOOD_META: Record<PetMood, {
  badge: string;
  label: string;
  cardBorder: string;
  cardBg: string;
  avatarBg: string;
}> = {
  excited: { badge: '✨', label: 'Feeling excited', cardBorder: 'hsl(44 65% 70%)', cardBg: 'rgba(255,251,235,0.9)', avatarBg: 'hsl(44 70% 88%)' },
  happy: { badge: '😊', label: 'Happy in the studio', cardBorder: 'hsl(130 42% 70%)', cardBg: 'rgba(240,252,244,0.9)', avatarBg: 'hsl(130 45% 88%)' },
  worried: { badge: '😟', label: 'A little worried', cardBorder: 'hsl(24 55% 70%)', cardBg: 'rgba(255,246,237,0.9)', avatarBg: 'hsl(24 60% 88%)' },
  cozy: { badge: '🧸', label: 'Cozy rest day', cardBorder: 'hsl(280 30% 74%)', cardBg: 'rgba(250,246,255,0.9)', avatarBg: 'hsl(280 35% 90%)' },
  focused: { badge: '🎯', label: 'Focused and ready', cardBorder: 'hsl(35 45% 72%)', cardBg: 'rgba(255,253,246,0.9)', avatarBg: 'hsl(35 65% 88%)' },
  sleepy: { badge: '😴', label: 'Waiting for clay…', cardBorder: 'hsl(35 30% 76%)', cardBg: 'rgba(253,252,249,0.9)', avatarBg: 'hsl(35 35% 90%)' },
};

function getPetMood(params: {
  activeFiring: boolean;
  kilnReady: boolean;
  dryingTooLong: boolean;
  scrapOverflow: boolean;
  isRestDay: boolean;
  totalPieces: number;
}): PetMood {
  if (params.activeFiring) return 'excited';
  if (params.kilnReady) return 'happy';
  if (params.dryingTooLong || params.scrapOverflow) return 'worried';
  if (params.isRestDay) return 'cozy';
  if (params.totalPieces === 0) return 'sleepy';
  return 'focused';
}

const PAT_REACTIONS = [
  'Purrr… 🐾',
  '*happy wiggle* 🌀',
  'You get me! 🫶',
  '*tail wag* ✨',
  'Warm and fuzzy 🧸',
  '*does a little spin* 🪆',
];

// ─── Firings ─────────────────────────────────────────────────────────────────

const ACTIVE_FIRING_STATES = new Set(['loading', 'firing', 'cooling', 'unloading']);

const FIRING_STATE_LABEL: Record<string, string> = {
  loading: 'Loading the kiln',
  firing: 'Firing in progress',
  cooling: 'Cooling down',
  unloading: 'Ready to unload',
};

const FIRING_STATE_EMOJI: Record<string, string> = {
  loading: '📦',
  firing: '🔥',
  cooling: '🌡️',
  unloading: '✨',
};

type PulseCard = {
  emoji: string;
  title: string;
  subtitle: string;
  route: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
};

type NudgeParams = {
  kilnReady: boolean;
  dryingTooLong: boolean;
  scrapOverflow: boolean;
  stagePositions: StudioPiecePositions;
  pieces: Piece[];
  personality?: import('@/src/screens/overview/kilnkin/kilnkinCompanion').KilnkinPersonality;
};

function getKilnkinNudge({ kilnReady, dryingTooLong, scrapOverflow, stagePositions, pieces, personality }: NudgeParams): string {
  const totalInFlight = pieces.filter((p) => p.stage.trim().toLowerCase() !== 'finished').length;
  let raw: string;
  if (kilnReady) {
    const n = stagePositions.kilnArea.length;
    raw = `${n} piece${n !== 1 ? 's' : ''} ${n !== 1 ? 'are' : 'is'} bone dry and ready for the kiln — ${n !== 1 ? "they've" : "it's"} been patient!`;
  } else if (dryingTooLong) {
    raw = 'Some pieces on the drying shelf have been sitting a while — are they bone dry yet?';
  } else if (scrapOverflow) {
    raw = "The reclaim bucket's getting full. A short reclaim session could really clear your headspace.";
  } else if (stagePositions.finishedCabinet.length > 0 && totalInFlight === 0) {
    const n = stagePositions.finishedCabinet.length;
    raw = `${n} finished piece${n !== 1 ? 's' : ''} in the cabinet — that's what it's all about! Time to start something new?`;
  } else if (totalInFlight === 0) {
    raw = 'The studio bench is clear — a blank slate. A great time to throw something.';
  } else if (totalInFlight === 1) {
    raw = "One piece in the works. Nice and focused — let's see it through.";
  } else {
    raw = `${totalInFlight} pieces moving through the studio. Looking good!`;
  }
  if (!personality) return raw;
  return getKilnkinVoiceLine({ personality } as never, raw);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OverviewPage() {
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
  const pieces = useVisiblePieces();
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
  const isSetupMode = setupQuests.length > 0;

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

  const stagePositions = React.useMemo(() => mapPiecesToStudioPositions(pieces), [pieces]);
  const studioSignals = React.useMemo(() => getStudioSignals({ pieces, firings }), [pieces, firings]);
  const kilnkinNudge = React.useMemo(
    () => getKilnkinNudge({ ...studioSignals, stagePositions, pieces, personality: kilnkinCompanion.personality }),
    [studioSignals, stagePositions, pieces, kilnkinCompanion.personality]
  );

  // Feature 4: kiln firing live state
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
  const moodMeta = PET_MOOD_META[petMood];

  const [patReaction, setPatReaction] = React.useState<string | null>(null);
  const patTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroReveal = React.useRef(new Animated.Value(0)).current;
  const focusReveal = React.useRef(new Animated.Value(0)).current;
  const secondaryReveal = React.useRef(new Animated.Value(0)).current;
  const journalReveal = React.useRef(new Animated.Value(0)).current;

  // ── Ceremony state (birthday / anniversary) ─────────────────────────────────
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

    // Studio anniversary (skip year 0 = same year as creation)
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

    // Kilnkin birthday
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
    ]).start();

    return () => {
      if (patTimeoutRef.current) clearTimeout(patTimeoutRef.current);
    };
  }, [heroReveal, focusReveal, secondaryReveal, journalReveal]);

  // Feature 1: "The One Thing" pulse card
  const oneThingCard = React.useMemo((): PulseCard | null => {
    if (activeFiring) {
      const ready = activeFiring.expectedReadyAt;
      const hoursLeft = ready ? Math.max(0, Math.round((new Date(ready).getTime() - Date.now()) / (1000 * 60 * 60))) : null;
      return {
        emoji: FIRING_STATE_EMOJI[activeFiring.state] ?? '🏺',
        title: FIRING_STATE_LABEL[activeFiring.state] ?? activeFiring.state,
        subtitle: activeFiring.name + (hoursLeft != null ? ` · ~${hoursLeft}h until ready` : ''),
        route: '/(tabs)/kiln',
        accentBg: 'hsl(16 70% 94%)',
        accentBorder: 'hsl(16 60% 78%)',
        accentText: 'hsl(16 65% 38%)',
      };
    }
    if (studioSignals.kilnReady) {
      const n = stagePositions.kilnArea.length;
      return {
        emoji: '🔥',
        title: `${n} piece${n !== 1 ? 's' : ''} ready for the kiln`,
        subtitle: 'Bone dry and waiting — load when you can',
        route: '/(tabs)/kiln',
        accentBg: 'hsl(24 70% 94%)',
        accentBorder: 'hsl(24 60% 78%)',
        accentText: 'hsl(24 65% 38%)',
      };
    }
    if (studioSignals.dryingTooLong) {
      const n = stagePositions.dryingShelf.length;
      return {
        emoji: '💨',
        title: 'Check the drying shelf',
        subtitle: `${n} piece${n !== 1 ? 's' : ''} ${n !== 1 ? 'have' : 'has'} been drying over 3 days`,
        route: '/(tabs)/pieces?stage=drying',
        accentBg: 'hsl(210 50% 94%)',
        accentBorder: 'hsl(210 40% 78%)',
        accentText: 'hsl(210 45% 38%)',
      };
    }
    if (studioSignals.scrapOverflow) {
      return {
        emoji: '♻️',
        title: 'Reclaim bucket filling up',
        subtitle: 'A quick session would clear the backlog',
        route: '/(tabs)/pieces?stage=trimming',
        accentBg: 'hsl(35 50% 92%)',
        accentBorder: 'hsl(35 45% 76%)',
        accentText: 'hsl(35 50% 36%)',
      };
    }
    return null;
  }, [activeFiring, studioSignals, stagePositions]);

  // Feature 2: activity feed
  const activityFeed = React.useMemo(() => buildActivityFeed(pieces), [pieces]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const personalizedGreeting = user.name ? `${greeting}, ${user.name.split(' ')[0]}` : greeting;
  const DOW_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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

  // Feature 3: stage chips with longest-days annotation
  const STAGE_CHIPS = [
    { label: 'In Progress', piecesInSlot: stagePositions.workTable, route: '/(tabs)/pieces?stage=idea,forming,leather-hard,trimming', emoji: '🪆', urgent: false },
    { label: 'Drying', piecesInSlot: stagePositions.dryingShelf, route: '/(tabs)/pieces?stage=drying,bone-dry', emoji: '💨', urgent: studioSignals.dryingTooLong },
    { label: 'Glaze Ready', piecesInSlot: stagePositions.kilnArea, route: '/(tabs)/pieces?stage=glazing,glaze-fired', emoji: '🔥', urgent: studioSignals.kilnReady },
    { label: 'Glazing', piecesInSlot: stagePositions.glazeRack, route: '/(tabs)/pieces?stage=bisque', emoji: '🎨', urgent: false },
    { label: 'Finished', piecesInSlot: stagePositions.finishedCabinet, route: '/(tabs)/pieces?stage=finished', emoji: '✨', urgent: false },
  ].map((chip) => ({
    ...chip,
    count: chip.piecesInSlot.length,
  }));

  const missionChecklistCount = missionsSummary.total + customTodos.length;
  const missionChecklistDone = missionsSummary.completedCount + customTodos.filter((t) => t.completed).length;
  const visibleMissions = showAllMissionTasks ? missionsSummary.all : missionsSummary.all.slice(0, 3);
  const visibleCustomTodos = showAllMissionTasks ? customTodos : customTodos.slice(0, 2);
  const hiddenTaskCount = (missionsSummary.all.length - visibleMissions.length) + (customTodos.length - visibleCustomTodos.length);

  return (
    <View className="flex-1 bg-background">
      <CeremonyOverlay
        visible={overlayCeremony !== null}
        emoji={overlayCeremony?.emoji ?? '🏺'}
        title={overlayCeremony?.title ?? ''}
        subtitle={overlayCeremony?.subtitle ?? ''}
        tint={overlayCeremony?.tint ?? 'rgba(130, 180, 110, 1)'}
        durationMs={3500}
        onDismiss={() => setOverlayCeremony(null)}
      />
      {/* ── Header ── */}
      <View style={{ backgroundColor: 'hsl(35 62% 93%)', paddingTop: insets.top + 14 }} className="px-5 pb-1">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-medium" style={{ color: 'hsl(32 45% 52%)' }}>{greeting}</Text>
            <Text className="text-[31px] font-serif font-bold text-foreground mt-0.5">Studio Ledger</Text>
            <View className="flex-row flex-wrap items-center gap-1.5 mt-2">
              {isSetupMode ? (
                <Text className="text-xs text-muted-foreground">{todayLabel} · Let&apos;s get your studio set up</Text>
              ) : todayRhythm.isEmpty ? (
                <View className="flex-row items-center gap-1">
                  <Text style={{ fontSize: 13 }}>☕</Text>
                  <Text className="text-xs text-muted-foreground">{todayLabel} · Rest day</Text>
                </View>
              ) : (
                <>
                  <Text className="text-xs text-muted-foreground">{todayLabel} ·</Text>
                  {todayRhythm.stages.map((s) => (
                    <View
                      key={s}
                      className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                      style={{ backgroundColor: 'hsl(35 55% 86%)' }}
                    >
                      <Text style={{ fontSize: 11 }}>{STAGE_CONFIG[s].emoji}</Text>
                      <Text className="text-[11px] font-medium" style={{ color: 'hsl(32 60% 35%)' }}>
                        {STAGE_CONFIG[s].label}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => {
                if (requestAccess(PremiumFeature.Analytics)) {
                  router.push('/analytics' as never);
                }
              }}
              activeOpacity={0.8}
              className="h-9 w-9 rounded-full items-center justify-center bg-card border border-border"
              accessibilityRole="button"
              accessibilityLabel="Open analytics"
            >
              <BarChart2 size={17} color="hsl(24 20% 45%)" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile' as never)}
            activeOpacity={0.8}
            className="h-10 w-10 rounded-full border-2 bg-primary items-center justify-center overflow-hidden"
            style={{ borderColor: 'hsl(35 45% 80%)' }}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            {user.avatarImageUri ? (
              <Image source={{ uri: user.avatarImageUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="text-primary-foreground font-semibold text-sm">{user.avatarInitial}</Text>
            )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Main feed ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 110, backgroundColor: 'hsl(35 62% 93%)' }}
      >
        {isSetupMode ? (
          <Animated.View
            style={{
              opacity: heroReveal,
              transform: [{
                translateY: heroReveal.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              }],
            }}
          >
            {/* Welcome — same visual language as Live Studio State */}
            <View
              className="rounded-[28px] mb-4 overflow-hidden"
              style={{
                backgroundColor: 'hsl(34 66% 89%)',
                shadowColor: '#4d3314',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <View style={{ position: 'absolute', right: -18, top: -24, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255, 248, 228, 0.75)' }} />
              <View style={{ position: 'absolute', left: -22, bottom: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(205, 172, 117, 0.22)' }} />

              <View className="px-4 pt-5 pb-4">
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: 'hsl(32 48% 36%)', textTransform: 'uppercase' }}>
                  Your Studio
                </Text>
                <Text className="font-serif text-[20px] leading-8 text-foreground mt-2">
                  {user.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome to your studio'}
                </Text>
                <Text className="text-[13px] leading-5 mt-2" style={{ color: 'hsl(31 34% 40%)' }}>
                  A few quick steps to shape the app around how you actually work.
                </Text>
                <View className="flex-row items-center gap-2 mt-4">
                  <View className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(35 40% 78%)' }}>
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: 'hsl(39 57% 51%)',
                        width: `${Math.max(8, Math.round((1 - setupQuests.length / 10) * 100))}%`,
                      }}
                    />
                  </View>
                  <Text className="text-[11px] font-semibold" style={{ color: 'hsl(32 40% 38%)' }}>
                    {setupQuests.length} left
                  </Text>
                </View>
              </View>
            </View>

            {/* Checklist — single warm panel */}
            <View
              className="rounded-[24px] mb-4 overflow-hidden"
              style={{ backgroundColor: 'hsl(36 55% 98%)', shadowColor: '#3f2a12', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
            >
              <View className="px-4 pt-4 pb-2">
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.9, color: 'hsl(32 48% 36%)', textTransform: 'uppercase' }}>
                  Setup checklist
                </Text>
                <Text style={{ fontSize: 11, color: 'hsl(32 30% 42%)', marginTop: 3 }}>
                  Tap a step when you&apos;re ready — no rush.
                </Text>
              </View>

              {setupQuests.map((quest, idx) => {
                const meta = SETUP_QUEST_META[quest.key];
                const Icon = meta.Icon;
                return (
                  <TouchableOpacity
                    key={quest.key}
                    onPress={() => router.push(quest.route as never)}
                    activeOpacity={0.78}
                    className="flex-row items-center gap-3 px-4 py-3.5"
                    style={{ backgroundColor: idx % 2 === 0 ? 'hsl(38 50% 97%)' : 'hsl(36 55% 98%)' }}
                    accessibilityRole="button"
                  >
                    <View
                      className="w-10 h-10 rounded-2xl items-center justify-center"
                      style={{ backgroundColor: meta.iconBg }}
                    >
                      <Icon size={17} color={meta.iconColor} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{quest.title}</Text>
                      <Text className="text-[11px] text-muted-foreground mt-0.5 leading-4" numberOfLines={2}>{quest.text}</Text>
                    </View>
                    <ChevronRight size={16} color="hsl(32 35% 55%)" />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Kilnkin — matches live-studio note card */}
            <View className="rounded-[24px] px-4 py-3.5 mb-2" style={{ backgroundColor: 'rgba(255, 252, 245, 0.92)' }}>
              <View className="flex-row items-start gap-3">
                <TouchableOpacity
                  onPress={() => router.push('/kilnkin' as never)}
                  onLongPress={handlePat}
                  delayLongPress={400}
                  activeOpacity={0.85}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'hsl(35 35% 90%)',
                  }}
                >
                  <Image
                    source={require('../../../assets/images/clay-pet.png')}
                    style={{ width: 22, height: 22 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-[10px] uppercase" style={{ letterSpacing: 0.8, color: 'hsl(32 35% 46%)' }}>Kilnkin note</Text>
                  <Text className="text-[12px] mt-1 leading-5 text-foreground">
                    Hi — I&apos;m {kilnkinCompanion.name}. I&apos;ll be right here while you get settled in.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/kilnkin' as never)}
                    activeOpacity={0.8}
                    className="self-start mt-2 rounded-full px-2.5 py-1"
                    style={{ backgroundColor: 'hsl(35 54% 87%)' }}
                  >
                    <Text className="text-[11px] font-medium" style={{ color: 'hsl(33 45% 30%)' }}>Visit {kilnkinCompanion.name}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        ) : null}

        {/* Live studio state hero */}
        {!isSetupMode ? (
        <Animated.View
          className="rounded-[28px] mb-4 overflow-hidden"
          style={{
            backgroundColor: 'hsl(34 66% 89%)',
            shadowColor: '#4d3314',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 4,
            opacity: heroReveal,
            transform: [{
              translateY: heroReveal.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            }],
          }}
        >
          <View style={{ position: 'absolute', right: -18, top: -24, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255, 248, 228, 0.75)' }} />
          <View style={{ position: 'absolute', left: -22, bottom: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(205, 172, 117, 0.22)' }} />

          <View className="px-4 pt-4 pb-3">
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: 'hsl(32 48% 36%)', textTransform: 'uppercase' }}>
              Live Studio State
            </Text>
            <View className="flex-row items-start gap-3 mt-2">
              <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: oneThingCard ? oneThingCard.accentBg : 'hsl(36 54% 85%)' }}>
                <Text style={{ fontSize: 21 }}>{oneThingCard?.emoji ?? '🏺'}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-serif text-[22px] leading-6 text-foreground">
                  {oneThingCard?.title ?? (pieces.length === 0 ? 'A quiet bench, ready to begin' : 'Steady clay day in motion')}
                </Text>
                <Text className="text-[12px] mt-1" style={{ color: oneThingCard?.accentText ?? 'hsl(31 34% 40%)' }}>
                  {oneThingCard?.subtitle ?? `${pieces.length} piece${pieces.length !== 1 ? 's' : ''} currently in your studio flow`}
                </Text>
              </View>
            </View>

            {oneThingCard ? (
              <TouchableOpacity
                onPress={() => router.push(oneThingCard.route as never)}
                activeOpacity={0.82}
                className="rounded-2xl px-3 py-2 mt-3 self-start"
                style={{ backgroundColor: 'hsl(32 45% 26%)' }}
              >
                <Text className="text-[11px] font-semibold text-white">Open live status</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View className="px-4 py-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] uppercase" style={{ letterSpacing: 0.8, color: 'hsl(32 34% 44%)' }}>Now · Next · Blocked</Text>
              <Text className="text-[11px]" style={{ color: 'hsl(32 32% 42%)' }}>{missionsSummary.completedCount}/{Math.max(missionsSummary.total, 1)} done</Text>
            </View>

            <View className="flex-row flex-wrap gap-1.5 mb-2.5">
              {STAGE_CHIPS.filter((c) => c.count > 0).slice(0, 4).map((chip) => (
                <TouchableOpacity
                  key={chip.label}
                  onPress={() => router.push(chip.route as never)}
                  activeOpacity={0.75}
                  className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                  style={{
                    backgroundColor: chip.urgent ? 'hsl(24 70% 88%)' : 'hsl(35 46% 84%)',
                    borderWidth: 1,
                    borderColor: chip.urgent ? 'hsl(24 55% 72%)' : 'hsl(35 40% 74%)',
                  }}
                >
                  <Text style={{ fontSize: 11 }}>{chip.emoji}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: chip.urgent ? 'hsl(24 60% 34%)' : 'hsl(32 40% 30%)' }}>{chip.count}</Text>
                  <Text style={{ fontSize: 10, color: chip.urgent ? 'hsl(24 50% 44%)' : 'hsl(32 30% 44%)' }}>{chip.label.toLowerCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="rounded-2xl px-3 py-2.5 mt-1" style={{ backgroundColor: 'rgba(255, 252, 245, 0.88)' }}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[10px] uppercase" style={{ letterSpacing: 0.8, color: 'hsl(32 35% 46%)' }}>Kilnkin note</Text>
                  <Text className="text-[12px] mt-1 leading-5 text-foreground">{kilnkinNudge}</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/kilnkin' as never)}
                    activeOpacity={0.8}
                    className="self-start mt-2 rounded-full px-2.5 py-1"
                    style={{ backgroundColor: 'hsl(35 54% 87%)' }}
                  >
                    <Text className="text-[11px] font-medium" style={{ color: 'hsl(33 45% 30%)' }}>Visit {kilnkinCompanion.name}</Text>
                  </TouchableOpacity>
                </View>

                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => router.push('/kilnkin' as never)}
                    onLongPress={handlePat}
                    delayLongPress={400}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`${kilnkinCompanion.name} — ${moodMeta.label}. Tap to visit.`}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: moodMeta.avatarBg,
                      borderWidth: 2,
                      borderColor: moodMeta.cardBorder,
                    }}
                  >
                    <Image
                      source={require('../../../assets/images/clay-pet.png')}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: moodMeta.cardBorder,
                      }}
                    >
                      <Text style={{ fontSize: 8 }}>{moodMeta.badge}</Text>
                    </View>
                  </TouchableOpacity>
                  {patReaction ? (
                    <Text
                      numberOfLines={1}
                      style={{ maxWidth: 92, marginTop: 6, fontSize: 10, color: 'hsl(32 60% 34%)', fontWeight: '600' }}
                    >
                      {patReaction}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
        ) : null}

        {!isSetupMode ? (
        <Animated.View
          style={{
            opacity: focusReveal,
            transform: [{
              translateY: focusReveal.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            }],
          }}
        >
          {missionChecklistCount > 0 ? (
          <View style={{ height: 5, borderRadius: 3, backgroundColor: 'hsl(35 35% 83%)', marginBottom: 14, overflow: 'hidden' }}>
            <View style={{ height: '100%', borderRadius: 3, backgroundColor: 'hsl(39 57% 51%)', width: `${Math.round((missionChecklistDone / Math.max(missionChecklistCount, 1)) * 100)}%` }} />
          </View>
          ) : null}

          <WidgetCard
            title="Today Missions"
            status={missionChecklistCount > 0 ? `${missionChecklistDone}/${missionChecklistCount} complete` : 'No missions yet'}
            description={rhythmConfigured ? 'Your task-focused to-do widget' : 'Set up Studio Rhythm to get a daily checklist'}
            primaryActionLabel="Add task"
            onPrimaryAction={() => setShowAddTodoComposer((v) => !v)}
            accentColor="hsl(32 48% 36%)"
          >
            {visibleMissions.map((mission, idx) => {
              const meta = MISSION_META[mission.type];
              if (!meta) return null;
              const Icon = meta.Icon;
              return (
                <TouchableOpacity
                  key={mission.type}
                  onPress={() => router.push(mission.route as never)}
                  activeOpacity={0.75}
                  className="flex-row items-center gap-3 px-4 py-3"
                  style={{ borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: 'hsl(34 25% 88%)' }}
                  accessibilityRole="button"
                  accessibilityLabel={`${meta.title}: ${mission.text}`}
                >
                  <View className={`w-8 h-8 rounded-xl items-center justify-center border border-border ${meta.chipClassName}`} style={{ opacity: mission.completed ? 0.45 : 1 }}>
                    <Icon size={15} color={meta.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-xs font-semibold${mission.completed ? ' text-muted-foreground line-through' : ' text-foreground'}`}>{meta.title}</Text>
                    <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>{mission.text}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleDailyMissionCompletion(todayMissionKey, mission.type)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
                    className={`w-6 h-6 rounded-full items-center justify-center${mission.completed ? ' bg-primary/20' : ' border-2 border-muted-foreground/30'}`}
                    accessibilityRole="checkbox"
                    accessibilityLabel={mission.completed ? 'Reopen' : 'Mark done'}
                  >
                    {mission.completed ? <Check size={11} color="hsl(36 70% 48%)" /> : null}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            {customTodos.length > 0 ? (
              <View style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 25% 86%)', backgroundColor: 'rgba(249, 245, 235, 0.9)' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.7, color: 'hsl(32 38% 42%)', textTransform: 'uppercase', paddingHorizontal: 16, paddingTop: 9 }}>Added by you</Text>
                {visibleCustomTodos.map((todo) => (
                  <View
                    key={todo.id}
                    className="flex-row items-center gap-3 px-4 py-3"
                    style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 24% 88%)' }}
                  >
                    <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: 'hsl(35 52% 88%)' }}>
                      <Text style={{ fontSize: 13 }}>•</Text>
                    </View>
                    <Text className={`flex-1 text-xs font-medium${todo.completed ? ' text-muted-foreground line-through' : ' text-foreground'}`}>{todo.title}</Text>
                    <TouchableOpacity
                      onPress={() => toggleCustomTodo(todo.id)}
                      activeOpacity={0.72}
                      hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
                      className={`w-6 h-6 rounded-full items-center justify-center${todo.completed ? ' bg-primary/20' : ' border-2 border-muted-foreground/30'}`}
                      accessibilityRole="checkbox"
                      accessibilityLabel={todo.completed ? 'Reopen task' : 'Mark task done'}
                    >
                      {todo.completed ? <Check size={11} color="hsl(36 70% 48%)" /> : null}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}

            {hiddenTaskCount > 0 ? (
              <TouchableOpacity
                onPress={() => setShowAllMissionTasks(true)}
                activeOpacity={0.82}
                className="px-4 py-2.5"
                style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 25% 86%)', backgroundColor: 'hsl(35 46% 94%)' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(31 44% 34%)' }}>Show {hiddenTaskCount} more task{hiddenTaskCount > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            ) : showAllMissionTasks && missionChecklistCount > 4 ? (
              <TouchableOpacity
                onPress={() => setShowAllMissionTasks(false)}
                activeOpacity={0.82}
                className="px-4 py-2.5"
                style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 25% 86%)', backgroundColor: 'hsl(35 46% 94%)' }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(31 44% 34%)' }}>Show fewer tasks</Text>
              </TouchableOpacity>
            ) : null}

            {showAddTodoComposer ? (
              <View className="px-4 py-3" style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 25% 86%)' }}>
                <TextInput
                  value={draftTodo}
                  onChangeText={setDraftTodo}
                  placeholder="Add a personal task for today"
                  placeholderTextColor="hsl(32 20% 58%)"
                  returnKeyType="done"
                  onSubmitEditing={addCustomTodo}
                  className="rounded-xl border px-3 py-2 text-[12px] text-foreground"
                  style={{ borderColor: 'hsl(34 28% 78%)', backgroundColor: 'white' }}
                />
                <View className="flex-row items-center justify-end gap-2 mt-2">
                  <TouchableOpacity
                    onPress={() => {
                      setDraftTodo('');
                      setShowAddTodoComposer(false);
                    }}
                    activeOpacity={0.8}
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: 'hsl(34 28% 86%)' }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(32 30% 38%)' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={addCustomTodo}
                    activeOpacity={0.8}
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: 'hsl(39 57% 51%)', opacity: draftTodo.trim() ? 1 : 0.5 }}
                    disabled={!draftTodo.trim()}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: 'white' }}>Add to list</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {!rhythmConfigured && missionChecklistCount === 0 ? (
              <TouchableOpacity
                onPress={() => router.push('/profile/studio-rhythm' as never)}
                activeOpacity={0.86}
                className="flex-row items-center gap-3 px-4 py-4"
                style={{ borderTopWidth: 1, borderTopColor: 'hsl(34 25% 86%)', backgroundColor: 'hsl(44 70% 96%)' }}
                accessibilityRole="button"
                accessibilityLabel="Set up Studio Rhythm"
              >
                <CalendarDays size={18} color="hsl(32 60% 40%)" />
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-foreground mb-0.5">No rhythm set yet</Text>
                  <Text className="text-[11px] text-muted-foreground leading-4">Set up Studio Rhythm to get a daily checklist.</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </WidgetCard>
        </Animated.View>
        ) : null}

        <Animated.View
          style={{
            opacity: journalReveal,
            transform: [{
              translateY: journalReveal.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            }],
          }}
        >
          {/* Studio journal widget */}
          {!isSetupMode && activityFeed.length > 0 ? (
            <WidgetCard
              title="Studio Journal"
              status={`${activityFeed.length} recent`}
              description="Recent movement across your pieces"
              expanded={showJournalWidget}
              onToggleExpand={() => setShowJournalWidget((v) => !v)}
              accentColor="hsl(210 45% 36%)"
            >
              <View className="px-4 pb-1 pt-3">
                <TouchableOpacity onPress={() => router.push('/(tabs)/pieces' as never)} activeOpacity={0.78} className="self-end mb-2">
                  <Text style={{ fontSize: 11, color: 'hsl(210 45% 36%)', fontWeight: '600' }}>View all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 24, gap: 10, marginBottom: 14 }}>
                {activityFeed.slice(0, 8).map((entry) => {
                  const stageKey = entry.stage.trim().toLowerCase();
                  const badge = STAGE_BADGE_COLORS[stageKey] ?? { dot: 'hsl(32 30% 55%)', text: 'hsl(32 25% 42%)' };
                  return (
                    <TouchableOpacity
                      key={entry.id}
                      activeOpacity={0.8}
                      onPress={() => router.push('/(tabs)/pieces' as never)}
                      className="rounded-2xl border p-3"
                      style={{ width: 205, borderColor: 'hsl(34 28% 82%)', backgroundColor: 'rgba(255, 252, 248, 0.96)' }}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                          {entry.piecePhoto ? (
                            <Image source={{ uri: entry.piecePhoto }} style={{ width: 36, height: 36, borderRadius: 10 }} resizeMode="cover" />
                          ) : (
                            <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(35 50% 90%)' }}>
                              <Text style={{ fontSize: 16 }}>🏺</Text>
                            </View>
                          )}
                          <Text style={{ fontSize: 10, color: 'hsl(32 25% 52%)' }}>
                            {entry.daysAgo === 0 ? 'today' : entry.daysAgo === 1 ? 'yesterday' : `${entry.daysAgo}d ago`}
                          </Text>
                        </View>
                      </View>

                      <Text className="font-serif text-[18px] leading-6 text-foreground" numberOfLines={2}>{entry.pieceName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: badge.dot }} />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: badge.text, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                          {STAGE_LABELS[stageKey] ?? entry.stage}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </WidgetCard>
          ) : null}
        </Animated.View>

      </ScrollView>

      {/* Feedback — absolute, bottom-right */}
      <TouchableOpacity
        onPress={() => setFeedbackOpen(true)}
        activeOpacity={0.86}
        className="absolute right-4 rounded-2xl border border-border bg-card/95 px-3 py-2 flex-row items-center gap-2"
        style={{ bottom: insets.bottom - 20 }}
        accessibilityRole="button"
        accessibilityLabel="Leave feedback"
      >
        <MessageSquarePlus size={15} color="hsl(24 20% 38%)" />
        <Text className="text-xs font-medium text-foreground">Feedback</Text>
      </TouchableOpacity>

      <FeedbackModal visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      {PaywallGate}
    </View>
  );
}

