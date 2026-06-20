import type { StudioRhythm, StudioRhythmConfig, StudioRhythmEvent, StudioRhythmGoal } from '@/src/screens/overview/studioRythm/studioRhythm';
import { isStudioRhythmConfigured } from '@/src/screens/overview/studioRythm/studioRhythm';
import type { Firing } from '@/src/types/kiln';
import type { Piece } from '@/src/types/pieces';
import type { Href } from 'expo-router';

export type StudioRhythmSuggestionType =
  | 'trim'
  | 'reclaim'
  | 'wheel-practice'
  | 'kiln-check'
  | 'upcoming-event'
  | 'goal-focus';

export type StudioRhythmSuggestion = {
  type: StudioRhythmSuggestionType;
  text: string;
  route: Href;
  actionLabel: string;
};

export type GenerateStudioRhythmSuggestionsData = {
  routineConfiguration?: StudioRhythmConfig;
  /** v2 Studio Rhythm — takes precedence over routineConfiguration when provided */
  rhythm?: StudioRhythm;
  pieces: Piece[];
  firings: Firing[];
  elapsedTime?: {
    now?: Date;
  };
  upcomingEvents?: StudioRhythmEvent[];
};

const DRYING_STAGES = new Set(['drying', 'bone-dry']);
const READY_FOR_KILN_STAGES = new Set(['bone-dry', 'glaze-fired']);

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function toDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getCurrentStageEnteredAt(piece: Piece): Date | null {
  const currentStage = normalize(piece.stage);
  const fromTimeline = [...piece.timeline]
    .reverse()
    .find((entry) => normalize(entry.stage) === currentStage);

  return toDate(fromTimeline?.timestamp) ?? toDate(piece.createdAt);
}

function diffDays(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

function diffHours(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function isWithinNextDays(dateIso: string, from: Date, days: number): boolean {
  const target = toDate(dateIso);
  if (!target) return false;
  const delta = diffDays(from, target);
  return delta >= 0 && delta <= days;
}

function buildGoalSuggestion(goal: StudioRhythmGoal): StudioRhythmSuggestion | null {
  if (!goal.active) return null;

  switch (goal.type) {
    case 'cylinder-practice':
      return {
        type: 'goal-focus',
        text: `Weekly goal: ${goal.title.toLowerCase()}.`,
        route: '/(tabs)/pieces?stage=in-progress',
        actionLabel: 'Open Pieces',
      };
    case 'reclaim-session':
      return {
        type: 'reclaim',
        text: `Weekly goal: ${goal.title.toLowerCase()}.`,
        route: '/(tabs)/pieces?stage=trimming',
        actionLabel: 'Open Pieces',
      };
    case 'trim-session':
      return {
        type: 'trim',
        text: `Weekly goal: ${goal.title.toLowerCase()}.`,
        route: '/(tabs)/pieces?stage=drying',
        actionLabel: 'Open Pieces',
      };
    case 'finish-piece':
      return {
        type: 'goal-focus',
        text: `Weekly goal: ${goal.title.toLowerCase()}.`,
        route: '/(tabs)/pieces?stage=finished',
        actionLabel: 'Open Pieces',
      };
    default:
      return null;
  }
}

function buildEventSuggestion(event: StudioRhythmEvent): StudioRhythmSuggestion {
  if (event.type === 'market-drop') {
    return {
      type: 'upcoming-event',
      text: `${event.title} is coming up soon. A final studio pass could help.` ,
      route: '/profile/studio-rhythm',
      actionLabel: 'Open Calendar',
    };
  }

  if (event.type === 'open-studio') {
    return {
      type: 'upcoming-event',
      text: `${event.title} is on the horizon. You may want to ready the studio.` ,
      route: '/profile/studio-rhythm',
      actionLabel: 'Open Calendar',
    };
  }

  if (event.type === 'sale-restock') {
    return {
      type: 'upcoming-event',
      text: `${event.title} is near. A quick stock review could help.` ,
      route: '/profile/studio-rhythm',
      actionLabel: 'Open Calendar',
    };
  }

  return {
    type: 'upcoming-event',
    text: `You have ${event.title} coming up soon.`,
    route: '/profile/studio-rhythm',
    actionLabel: 'Open Calendar',
  };
}

function getSuggestionDedupKey(suggestion: StudioRhythmSuggestion) {
  if (suggestion.type === 'goal-focus' || suggestion.type === 'upcoming-event') {
    return `${suggestion.type}:${suggestion.text}`;
  }

  return suggestion.type;
}

export function generateStudioRhythmSuggestions(
  data: GenerateStudioRhythmSuggestionsData
): StudioRhythmSuggestion[] {
  const now = data.elapsedTime?.now ?? new Date();
  const rhythm = data.rhythm;
  const routine = data.routineConfiguration;
  const trimAfterDays = rhythm?.dryingTimers.leatherHardDays ?? routine?.preferredTrimAfterDays ?? 3;
  const suggestions: StudioRhythmSuggestion[] = [];

  const dryingTooLongCount = data.pieces.filter((piece) => {
    if (!DRYING_STAGES.has(normalize(piece.stage))) return false;
    const enteredAt = getCurrentStageEnteredAt(piece);
    if (!enteredAt) return false;
    return diffDays(enteredAt, now) > trimAfterDays;
  }).length;

  if (dryingTooLongCount > 0) {
    suggestions.push({
      type: 'trim',
      text: 'A few pieces might be ready to trim.',
      route: '/(tabs)/pieces?stage=drying',
      actionLabel: 'Open Pieces',
    });
  }

  const trimmingCount = data.pieces.filter((piece) => normalize(piece.stage) === 'trimming').length;
  const failedCount = data.pieces.filter((piece) => ['cracked', 'warped'].includes(normalize(piece.status))).length;

  if (trimmingCount + failedCount >= 5) {
    suggestions.push({
      type: 'reclaim',
      text: 'Some scraps could be reclaimed today.',
      route: '/(tabs)/pieces?stage=trimming',
      actionLabel: 'Open Pieces',
    });
  }

  const readyPieces = data.pieces.filter((piece) => READY_FOR_KILN_STAGES.has(normalize(piece.stage))).length;
  const kilnNearTransition = data.firings.some((firing) => {
    const state = normalize(firing.state);
    return state === 'cooling' || state === 'unloading';
  });

  // Glazed pieces that have dried long enough to be kiln-ready
  const glazeDryingHours = rhythm?.dryingTimers.glazeDryingHours ?? 8;
  const glazedAndReadyCount = data.pieces.filter((piece) => {
    if (normalize(piece.stage) !== 'glazing') return false;
    const enteredAt = getCurrentStageEnteredAt(piece);
    if (!enteredAt) return false;
    return diffHours(enteredAt, now) >= glazeDryingHours;
  }).length;

  if (glazedAndReadyCount > 0) {
    suggestions.push({
      type: 'kiln-check',
      text: `${glazedAndReadyCount} glazed ${glazedAndReadyCount === 1 ? 'piece looks' : 'pieces look'} dry and kiln-ready.`,
      route: '/(tabs)/pieces?stage=glazing',
      actionLabel: 'Open Pieces',
    });
  }

  // Bisque firing that has cooled long enough for glazing to begin
  const postBisqueCoolingHours = rhythm?.dryingTimers.postBisqueCoolingHours ?? 12;
  const bisqueCooled = data.firings.some((firing) => {
    if (normalize(firing.type) !== 'bisque') return false;
    if (firing.state !== 'cooling' && firing.state !== 'unloading') return false;
    const cooledSince = toDate(firing.completedAt ?? firing.startedAt);
    if (!cooledSince) return true; // can't determine — assume ready
    return diffHours(cooledSince, now) >= postBisqueCoolingHours;
  });

  if (bisqueCooled && !suggestions.some((s) => s.type === 'kiln-check')) {
    suggestions.push({
      type: 'kiln-check',
      text: 'Bisque firing has cooled — pieces should be safe to unload and glaze.',
      route: '/(tabs)/kiln',
      actionLabel: 'Open Kiln',
    });
  }

  if ((readyPieces > 0 || kilnNearTransition) && !suggestions.some((s) => s.type === 'kiln-check')) {
    suggestions.push({
      type: 'kiln-check',
      text: 'The kiln area might be ready for a quick check.',
      route: '/(tabs)/kiln',
      actionLabel: 'Open Kiln',
    });
  }

  if (rhythm && isStudioRhythmConfigured(rhythm)) {
    // v2 path: suggestions derived from today's stage assignments
    const todayDow = (now.getDay() + 6) % 7; // 0 = Mon
    const todayStages = rhythm.stageDays
      .filter((sd) => sd.days.includes(todayDow))
      .map((sd) => sd.stage);

    if (todayStages.includes('throw') && !suggestions.some((s) => s.type === 'wheel-practice')) {
      suggestions.push({
        type: 'wheel-practice',
        text: 'Today is a throw day — the wheel is calling.',
        route: '/(tabs)/pieces?stage=in-progress',
        actionLabel: 'Open Pieces',
      });
    }

    if (todayStages.includes('trim') && !suggestions.some((s) => s.type === 'trim')) {
      suggestions.push({
        type: 'trim',
        text: 'Today is a trim day — check your leather-hard pieces.',
        route: '/(tabs)/pieces?stage=leather-hard',
        actionLabel: 'Open Pieces',
      });
    }

    if (todayStages.includes('glaze')) {
      suggestions.push({
        type: 'goal-focus',
        text: 'Today is a glaze day — lay out your brushes and test tiles.',
        route: '/(tabs)/pieces?stage=bisque',
        actionLabel: 'Open Pieces',
      });
    }

    if (todayStages.includes('bisque') && !suggestions.some((s) => s.type === 'kiln-check')) {
      suggestions.push({
        type: 'kiln-check',
        text: 'Today is a bisque day — check if any bone-dry pieces are kiln-ready.',
        route: '/(tabs)/kiln',
        actionLabel: 'Open Kiln',
      });
    }

    const nextV2Event = rhythm.events.find((e) => isWithinNextDays(e.date, now, 2));
    if (nextV2Event) {
      suggestions.push({
        type: 'upcoming-event',
        text: `${nextV2Event.name} is coming up soon.`,
        route: '/profile/studio-rhythm',
        actionLabel: 'Open Calendar',
      });
    }

    // Enabled weekly rituals scheduled for today
    const todayRituals = rhythm.rituals.filter(
      (r) => r.enabled && r.cadence === 'weekly' && r.dayOfWeek === todayDow
    );
    for (const ritual of todayRituals) {
      suggestions.push({
        type: 'goal-focus',
        text: `Today's your ${ritual.label.toLowerCase()} day.`,
        route: '/profile/studio-rhythm',
        actionLabel: 'Open Rhythm',
      });
    }
  } else {
    // Legacy path
    if (routine?.reclaimFocus && !suggestions.some((s) => s.type === 'reclaim')) {
      suggestions.push({
        type: 'reclaim',
        text: 'Some scraps could be reclaimed today.',
        route: '/(tabs)/pieces?stage=trimming',
        actionLabel: 'Open Pieces',
      });
    }

    if (routine?.wheelPractice) {
      suggestions.push({
        type: 'wheel-practice',
        text: 'A short cylinder practice could feel grounding today.',
        route: '/(tabs)/pieces?stage=in-progress',
        actionLabel: 'Open Pieces',
      });
    }

    const activeGoals = routine?.weeklyGoals?.filter((goal) => goal.active) ?? [];
    for (const goal of activeGoals) {
      const goalSuggestion = buildGoalSuggestion(goal);
      if (goalSuggestion) suggestions.push(goalSuggestion);
    }

    const scheduledEvents = data.upcomingEvents ?? routine?.scheduledEvents ?? [];
    const nextEvent = scheduledEvents.find((event) => isWithinNextDays(event.date, now, 2));
    if (nextEvent) suggestions.push(buildEventSuggestion(nextEvent));
  }

  const uniqueByType = new Map<string, StudioRhythmSuggestion>();
  for (const suggestion of suggestions) {
    const key = getSuggestionDedupKey(suggestion);
    if (!uniqueByType.has(key)) {
      uniqueByType.set(key, suggestion);
    }
  }

  return [...uniqueByType.values()].slice(0, 3);
}
