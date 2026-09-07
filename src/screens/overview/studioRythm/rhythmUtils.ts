import { STAGE_CONFIG, getDateKey, isStudioRhythmConfigured, type StageKey, type StudioRhythm } from './studioRhythm';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export type TodayRhythmPreview = {
  configured: boolean;
  isRestDay: boolean;
  dayName: string;
  stages: { key: string; label: string }[];
  events: { id: string; name: string }[];
  enabledRitualCount: number;
};

export function getTodayRhythmPreview(rhythm: StudioRhythm): TodayRhythmPreview {
  const configured = isStudioRhythmConfigured(rhythm);
  const dow = (new Date().getDay() + 6) % 7;
  const todayKey = getDateKey();
  const dayName = DAY_NAMES[dow];

  if (!configured) {
    return {
      configured: false,
      isRestDay: true,
      dayName,
      stages: [],
      events: [],
      enabledRitualCount: rhythm.rituals.filter((r) => r.enabled).length,
    };
  }

  const stages = rhythm.stageDays
    .filter((sd) => sd.days.includes(dow))
    .map((sd) => ({ key: sd.stage, label: STAGE_CONFIG[sd.stage as StageKey].label }));

  const events = rhythm.events
    .filter((e) => e.date.slice(0, 10) === todayKey)
    .map((e) => ({ id: e.id, name: e.name }));

  const enabledRitualCount = rhythm.rituals.filter((r) => r.enabled).length;

  return {
    configured: true,
    isRestDay: stages.length === 0 && events.length === 0,
    dayName,
    stages,
    events,
    enabledRitualCount,
  };
}

export function getRhythmSetupProgress(rhythm: StudioRhythm) {
  const scheduleDone = isStudioRhythmConfigured(rhythm);
  const hasExtras =
    rhythm.events.length > 0 || rhythm.rituals.some((r) => r.enabled);
  const essentialDone = scheduleDone ? 1 : 0;
  const optionalDone = hasExtras ? 1 : 0;
  return {
    scheduleDone,
    hasExtras,
    essentialTotal: 1,
    essentialDone,
    optionalTotal: 1,
    optionalDone,
    isNewUser: !scheduleDone,
  };
}
