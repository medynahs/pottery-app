import type { Firing } from '@/src/screens/kiln/types';
import type { StudioRhythmConfig, StudioRhythmEvent, StudioRhythmGoal } from '@/src/screens/overview/studioRythm/studioRhythm';
import type { Piece } from '@/src/screens/pieces/types';
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
  const routine = data.routineConfiguration;
  const trimAfterDays = routine?.preferredTrimAfterDays ?? 3;
  const suggestions: StudioRhythmSuggestion[] = [];
  const activeGoals = routine?.weeklyGoals?.filter((goal) => goal.active) ?? [];
  const scheduledEvents = data.upcomingEvents ?? routine?.scheduledEvents ?? [];

  const dryingTooLongCount = data.pieces.filter((piece) => {
    if (!DRYING_STAGES.has(normalize(piece.stage))) return false;
    const enteredAt = getCurrentStageEnteredAt(piece);
    if (!enteredAt) return false;
    return diffDays(enteredAt, now) > trimAfterDays;
  }).length;

  if (dryingTooLongCount > 0) {
    suggestions.push({
      type: 'trim',
      text: 'A few bowls might be ready to trim.',
      route: '/(tabs)/pieces?stage=drying',
      actionLabel: 'Open Pieces',
    });
  }

  const trimmingCount = data.pieces.filter((piece) => normalize(piece.stage) === 'trimming').length;
  const failedCount = data.pieces.filter((piece) => ['cracked', 'warped'].includes(normalize(piece.status))).length;

  if (trimmingCount + failedCount >= 5 || routine?.reclaimFocus) {
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

  for (const goal of activeGoals) {
    const goalSuggestion = buildGoalSuggestion(goal);
    if (goalSuggestion) {
      suggestions.push(goalSuggestion);
    }
  }

  const readyPieces = data.pieces.filter((piece) => READY_FOR_KILN_STAGES.has(normalize(piece.stage))).length;
  const kilnNearTransition = data.firings.some((firing) => {
    const state = normalize(firing.state);
    return state === 'cooling' || state === 'unloading';
  });

  if (readyPieces > 0 || kilnNearTransition) {
    suggestions.push({
      type: 'kiln-check',
      text: 'The kiln area might be ready for a quick check.',
      route: '/(tabs)/kiln',
      actionLabel: 'Open Kiln',
    });
  }

  const nextEvent = scheduledEvents.find((event) => isWithinNextDays(event.date, now, 2));
  if (nextEvent) {
    suggestions.push(buildEventSuggestion(nextEvent));
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
