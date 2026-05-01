import { Text } from '@/src/components/ui/text';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { getKilnkinVoiceLine } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import { generateSetupQuests, type SetupQuestKey } from '@/src/screens/overview/setupQuests/generateSetupQuests';
import { generateStudioRhythmSuggestions } from '@/src/screens/overview/studioRythm/generateStudioRhythmSuggestions';
import { STAGE_CONFIG, getDateKey } from '@/src/screens/overview/studioRythm/studioRhythm';
import { getStudioSignals } from '@/src/screens/overview/utils/getStudioSignals';
import { mapPiecesToStudioPositions, type StudioPiecePositions } from '@/src/screens/overview/utils/mapPiecesToStudioPositions';
import { getTodayMissionKey } from '@/src/screens/overview/utils/missionDate';
import { useAppStore } from '@/src/store';
import type { Piece } from '@/src/types/pieces';
import { useRouter } from 'expo-router';
import { BarChart2, CalendarDays, Check, Flame, Hammer, MessageSquarePlus, Plus, Scissors, Sparkles, Trophy, Wallet } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedbackModal } from './components/FeedbackModal';


type MissionIcon = React.ComponentType<{ size?: number; color?: string }>;
const MISSION_META: Record<string, { title: string; Icon: MissionIcon; iconColor: string; chipClassName: string }> = {
  trim: { title: 'Trim Watch', Icon: Scissors, iconColor: 'hsl(24 75% 45%)', chipClassName: 'bg-orange-50' },
  reclaim: { title: 'Reclaim Loop', Icon: Hammer, iconColor: 'hsl(35 65% 42%)', chipClassName: 'bg-amber-50' },
  'wheel-practice': { title: 'Wheel Focus', Icon: Sparkles, iconColor: 'hsl(270 55% 52%)', chipClassName: 'bg-purple-50' },
  'kiln-check': { title: 'Kiln Check', Icon: Flame, iconColor: 'hsl(16 78% 52%)', chipClassName: 'bg-red-50' },
  'upcoming-event': { title: 'Calendar Nudge', Icon: CalendarDays, iconColor: 'hsl(213 70% 45%)', chipClassName: 'bg-blue-50' },
  'goal-focus': { title: 'Weekly Goal', Icon: Trophy, iconColor: 'hsl(44 70% 45%)', chipClassName: 'bg-yellow-50' },
};

const SETUP_QUEST_META: Record<SetupQuestKey, { Icon: MissionIcon; iconColor: string; chipClassName: string }> = {
  'pricing-profile': { Icon: Wallet, iconColor: 'hsl(44 70% 45%)', chipClassName: 'bg-yellow-50' },
  'studio-rhythm': { Icon: CalendarDays, iconColor: 'hsl(213 70% 45%)', chipClassName: 'bg-blue-50' },
  'add-kiln': { Icon: Flame, iconColor: 'hsl(16 78% 52%)', chipClassName: 'bg-red-50' },
  'log-first-piece': { Icon: Plus, iconColor: 'hsl(135 45% 35%)', chipClassName: 'bg-green-50' },
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
  const user = useAppStore((state) => state.user);
  const kilnkinCompanion = useAppStore((state) => state.kilnkinCompanion);
  const kilns = useAppStore((state) => state.kilns);
  const pricingOnboardingCompleted = useAppStore((state) => state.pricingOnboardingCompleted);
  const pieces = useAppStore((state) => state.pieces);
  const firings = useAppStore((state) => state.firings);
  const rhythm = useAppStore((state) => state.studioRhythm);
  const dailyMissionCompletion = useAppStore((state) => state.dailyMissionCompletion);
  const toggleDailyMissionCompletion = useAppStore((state) => state.toggleDailyMissionCompletion);
  const todayMissionKey = getTodayMissionKey();
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  const activeCommunityChallenge = React.useMemo(
    () => ({ title: 'Underwater Forms Festival', track: 'Beginner Track', phase: 'Submissions open', daysLeft: 6 }),
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

  const setupQuests = React.useMemo(
    () => generateSetupQuests({
      kilnCount: kilns.length,
      studioRhythmConfigured: rhythm.stageDays.length > 0,
      pricingOnboardingCompleted,
      pieceCount: pieces.length,
    }),
    [kilns.length, rhythm.stageDays.length, pricingOnboardingCompleted, pieces.length]
  );

  const todayRhythm = React.useMemo(() => {
    const dow = (new Date().getDay() + 6) % 7;
    const todayKey = getDateKey();
    const stages = rhythm.stageDays.filter((sd) => sd.days.includes(dow)).map((sd) => sd.stage);
    const events = rhythm.events.filter((e) => e.date.slice(0, 10) === todayKey);
    return { stages, events, isEmpty: stages.length === 0 && events.length === 0 };
  }, [rhythm]);

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
  const handlePat = React.useCallback(() => {
    if (patTimeoutRef.current) clearTimeout(patTimeoutRef.current);
    const reaction = PAT_REACTIONS[Math.floor(Math.random() * PAT_REACTIONS.length)];
    setPatReaction(reaction);
    patTimeoutRef.current = setTimeout(() => setPatReaction(null), 2000);
  }, []);

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
  const totalTasks = setupQuests.length + missionsSummary.total;
  const totalDone = missionsSummary.completedCount;

  // Feature 3: stage chips with longest-days annotation
  const STAGE_CHIPS = [
    { label: 'In Progress', piecesInSlot: stagePositions.workTable, route: '/(tabs)/pieces?stage=in-progress', emoji: '🪆', urgent: false },
    { label: 'Drying', piecesInSlot: stagePositions.dryingShelf, route: '/(tabs)/pieces?stage=drying', emoji: '💨', urgent: studioSignals.dryingTooLong },
    { label: 'Glaze Ready', piecesInSlot: stagePositions.kilnArea, route: '/(tabs)/pieces?stage=bone-dry', emoji: '🔥', urgent: studioSignals.kilnReady },
    { label: 'Glazing', piecesInSlot: stagePositions.glazeRack, route: '/(tabs)/pieces?stage=glazed', emoji: '🎨', urgent: false },
    { label: 'Finished', piecesInSlot: stagePositions.finishedCabinet, route: '/(tabs)/pieces?stage=finished', emoji: '✨', urgent: false },
  ].map((chip) => ({
    ...chip,
    count: chip.piecesInSlot.length,
  }));

  return (
    <View className="flex-1 bg-background">
      {/* ── Header ── */}
      <View style={{ backgroundColor: 'hsl(35 62% 93%)', paddingTop: insets.top + 14 }} className="px-5 pb-0">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-medium" style={{ color: 'hsl(32 45% 52%)' }}>{greeting}</Text>
            <Text className="text-2xl font-serif font-bold text-foreground mt-0.5">Pottery Nook</Text>
            <View className="flex-row flex-wrap items-center gap-1.5 mt-2">
              {todayRhythm.isEmpty ? (
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
              onPress={() => router.push('/analytics' as never)}
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 110, backgroundColor: 'hsl(35 62% 93%)' }}
      >
        {/* Studio pipeline */}
        {pieces.length > 0 ? (
          <View className="mb-4">
            <Text style={{ fontSize: 10, color: 'hsl(32 35% 48%)', marginBottom: 6 }}>In the studio</Text>
            <View className="flex-row flex-wrap gap-1.5">
              {STAGE_CHIPS.filter((c) => c.count > 0).map((chip) => (
                <TouchableOpacity
                  key={chip.label}
                  onPress={() => router.push(chip.route as never)}
                  activeOpacity={0.75}
                  className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                  style={{
                    backgroundColor: chip.urgent ? 'hsl(24 70% 88%)' : 'hsl(35 45% 84%)',
                    borderWidth: 1,
                    borderColor: chip.urgent ? 'hsl(24 55% 72%)' : 'hsl(35 40% 74%)',
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${chip.label}: ${chip.count} pieces`}
                >
                  <Text style={{ fontSize: 11 }}>{chip.emoji}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: chip.urgent ? 'hsl(24 60% 34%)' : 'hsl(32 40% 30%)' }}>
                    {chip.count}
                  </Text>
                  <Text style={{ fontSize: 10, color: chip.urgent ? 'hsl(24 50% 44%)' : 'hsl(32 30% 44%)' }}>
                    {chip.label.toLowerCase()}
                  </Text>
                  {chip.urgent ? (
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: 'hsl(16 75% 52%)' }} />
                  ) : null}
                </TouchableOpacity>
              ))}
              {pieces.filter((p) => p.stage.trim().toLowerCase() === 'finished').length > 0 ? (
                <View
                  className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: 'hsl(130 35% 88%)', borderWidth: 1, borderColor: 'hsl(130 30% 76%)' }}
                >
                  <Text style={{ fontSize: 11 }}>✨</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(130 38% 28%)' }}>
                    {pieces.filter((p) => p.stage.trim().toLowerCase() === 'finished').length}
                  </Text>
                  <Text style={{ fontSize: 10, color: 'hsl(130 30% 40%)' }}>finished</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
        {/* ── Today's work header + progress ── */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-serif font-bold text-foreground">Today's work</Text>
          {totalTasks > 0 ? (
            <Text className="text-xs text-muted-foreground">{totalDone} of {totalTasks} done</Text>
          ) : null}
        </View>

        {totalTasks > 0 ? (
          <View className="h-1 rounded-full bg-muted mb-3 overflow-hidden">
            <View className="h-full rounded-full bg-primary" style={{ width: `${Math.round((totalDone / totalTasks) * 100)}%` }} />
          </View>
        ) : null}

        {/* Empty state */}
        {totalTasks === 0 ? (
          <TouchableOpacity
            onPress={() => router.push('/profile/studio-rhythm' as never)}
            activeOpacity={0.86}
            className="flex-row items-center gap-3 rounded-2xl px-4 py-3.5 mb-4 border border-dashed border-amber-300 bg-amber-50/80"
            accessibilityRole="button"
            accessibilityLabel="Set up Studio Rhythm"
          >
            <Text style={{ fontSize: 22 }}>🏺</Text>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-foreground mb-0.5">Nothing planned yet</Text>
              <Text className="text-[11px] text-muted-foreground leading-4">Set up your Studio Rhythm to get a daily checklist.</Text>
            </View>
            <CalendarDays size={16} color="hsl(32 60% 40%)" />
          </TouchableOpacity>
        ) : null}

        {/* Setup quests — grouped compact list */}
        {setupQuests.length > 0 ? (
          <View className="rounded-2xl border border-blue-200 overflow-hidden mb-3">
            <View className="px-4 py-2 border-b border-blue-200" style={{ backgroundColor: 'hsl(213 55% 95%)' }}>
              <Text className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">Get started</Text>
            </View>
            {setupQuests.map((quest, i) => {
              const meta = SETUP_QUEST_META[quest.key];
              const Icon = meta.Icon;
              return (
                <TouchableOpacity
                  key={quest.key}
                  onPress={() => router.push(quest.route as never)}
                  activeOpacity={0.75}
                  className={`flex-row items-center gap-3 px-4 py-3 bg-blue-50/60${i < setupQuests.length - 1 ? ' border-b border-blue-200' : ''}`}
                  accessibilityRole="button"
                >
                  <View className={`w-8 h-8 rounded-xl items-center justify-center border border-border ${meta.chipClassName}`}>
                    <Icon size={15} color={meta.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-foreground">{quest.title}</Text>
                    <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>{quest.text}</Text>
                  </View>
                  <Text className="text-xs font-semibold text-blue-500">→</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Daily missions — compact checklist rows */}
        {missionsSummary.all.length > 0 ? (
          <View className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
            {missionsSummary.all.map((mission, i) => {
              const meta = MISSION_META[mission.type];
              if (!meta) return null;
              const Icon = meta.Icon;
              return (
                <TouchableOpacity
                  key={mission.type}
                  onPress={() => router.push(mission.route as never)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-3 px-4 py-3${i < missionsSummary.all.length - 1 ? ' border-b border-border' : ''}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${meta.title}: ${mission.text}`}
                >
                  <View
                    className={`w-8 h-8 rounded-xl items-center justify-center border border-border ${meta.chipClassName}`}
                    style={{ opacity: mission.completed ? 0.45 : 1 }}
                  >
                    <Icon size={15} color={meta.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-xs font-semibold${mission.completed ? ' text-muted-foreground line-through' : ' text-foreground'}`}>
                      {meta.title}
                    </Text>
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
          </View>
        ) : null}

        {/* Urgent attention banner */}
        {oneThingCard ? (
          <TouchableOpacity
            onPress={() => router.push(oneThingCard.route as never)}
            activeOpacity={0.86}
            className="flex-row items-center gap-3 rounded-2xl px-4 py-3.5 mb-3"
            style={{ borderWidth: 1, borderColor: oneThingCard.accentBorder, backgroundColor: oneThingCard.accentBg }}
            accessibilityRole="button"
            accessibilityLabel={oneThingCard.title}
          >
            <Text style={{ fontSize: 22 }}>{oneThingCard.emoji}</Text>
            <View className="flex-1">
              <Text className="text-xs font-bold" style={{ color: oneThingCard.accentText }}>{oneThingCard.title}</Text>
              <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>{oneThingCard.subtitle}</Text>
            </View>
            <Text className="text-sm font-semibold" style={{ color: oneThingCard.accentText }}>→</Text>
          </TouchableOpacity>
        ) : null}

        {/* Community challenge — compact row */}
        {activeCommunityChallenge ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/community' as never)}
            activeOpacity={0.86}
            className="flex-row items-center gap-3 rounded-2xl px-4 py-3.5 mb-4 border border-green-200/80"
            style={{ backgroundColor: 'hsl(130 40% 96%)' }}
            accessibilityRole="button"
            accessibilityLabel="Open active community challenge"
          >
            <Trophy size={17} color="hsl(100 38% 42%)" />
            <View className="flex-1">
              <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>{activeCommunityChallenge.title}</Text>
              <Text className="text-[10px] text-muted-foreground">{activeCommunityChallenge.track} · {activeCommunityChallenge.daysLeft}d left</Text>
            </View>
            <Text className="text-xs font-semibold" style={{ color: 'hsl(130 40% 38%)' }}>Join →</Text>
          </TouchableOpacity>
        ) : null}

        {/* Studio journal */}
        {activityFeed.length > 0 ? (
          <>
            <Text className="text-base font-serif font-bold text-foreground mt-2 mb-3">Studio journal</Text>
            <View className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
              {activityFeed.map((entry, index) => (
                <View
                  key={entry.id}
                  className={`flex-row items-center gap-3 px-4 py-3 ${index < activityFeed.length - 1 ? 'border-b border-border' : ''}`}
                >
                  {entry.piecePhoto ? (
                    <Image source={{ uri: entry.piecePhoto }} className="w-9 h-9 rounded-xl" resizeMode="cover" />
                  ) : (
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center"
                      style={{ backgroundColor: 'hsl(35 50% 90%)' }}
                    >
                      <Text style={{ fontSize: 16 }}>🏺</Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>{entry.pieceName}</Text>
                    <Text className="text-[11px] text-muted-foreground mt-0.5">
                      → {STAGE_LABELS[entry.stage.trim().toLowerCase()] ?? entry.stage}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-muted-foreground">
                    {entry.daysAgo === 0 ? 'today' : entry.daysAgo === 1 ? 'yesterday' : `${entry.daysAgo}d ago`}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

      </ScrollView>

      {/* ── Ember — compact avatar bubble, bottom-left ── */}
      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom - 20,
          left: 16,
          alignItems: 'flex-start',
        }}
        pointerEvents="box-none"
      >
        {/* Speech bubble — shown when patReaction is set */}
        {patReaction ? (
          <View
            style={{
              marginBottom: 6,
              marginLeft: 4,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: moodMeta.cardBg,
              borderWidth: 1,
              borderColor: moodMeta.cardBorder,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
              maxWidth: 180,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(32 60% 36%)' }}>{patReaction}</Text>
          </View>
        ) : null}

        {/* Avatar circle */}
        <TouchableOpacity
          onPress={() => router.push('/kilnkin' as never)}
          onLongPress={handlePat}
          delayLongPress={400}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`${kilnkinCompanion.name} — ${moodMeta.label}. Tap to visit.`}
          style={{
            width: 52,
            height: 52,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: moodMeta.avatarBg,
            borderWidth: 2,
            borderColor: moodMeta.cardBorder,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Image
            source={require('../../../assets/images/clay-pet.png')}
            style={{ width: 26, height: 26 }}
            resizeMode="contain"
          />
          {/* Mood badge */}
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
      </View>

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
    </View>
  );
}

