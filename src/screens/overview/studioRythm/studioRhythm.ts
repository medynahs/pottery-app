// ── Legacy types (kept for backwards compat with suggestion generator) ────────
export type StudioRhythmEventType = 'market-drop' | 'open-studio' | 'sale-restock' | 'custom';

export type StudioRhythmGoalType =
  | 'cylinder-practice'
  | 'trim-session'
  | 'reclaim-session'
  | 'finish-piece';

export type StudioRhythmGoal = {
  id: string;
  title: string;
  type: StudioRhythmGoalType;
  frequency: 'weekly';
  targetCount: number;
  active: boolean;
};

export type StudioRhythmEvent = {
  id: string;
  title: string;
  type: StudioRhythmEventType;
  date: string;
  notificationsEnabled: boolean;
  notes?: string;
};

export type StudioRhythmConfig = {
  wheelPractice: boolean;
  reclaimFocus: boolean;
  preferredTrimAfterDays: number;
  weeklyGoals: StudioRhythmGoal[];
  scheduledEvents: StudioRhythmEvent[];
};

// ── New types (Studio Rhythm v2) ──────────────────────────────────────────────

export type RhythmType = 'weekly' | 'sprint' | 'freeform';

export type StageKey = 'throw' | 'trim' | 'glaze' | 'bisque';

export interface StageDay {
  stage: StageKey;
  days: number[]; // 0 = Monday … 6 = Sunday
}

export interface DryingTimers {
  leatherHardDays: number;
  boneDryDays: number;
  glazeDryingHours: number;
  postBisqueCoolingHours: number;
}

export type EventCategoryId =
  | 'market'
  | 'shipping'
  | 'photography'
  | 'glaze_mixing'
  | 'restock'
  | 'workshop'
  | 'open_studio'
  | 'custom';

export interface EventCategory {
  id: EventCategoryId;
  label: string;
  emoji: string;
  color: string;
}

export interface StudioEvent {
  id: string;
  categoryId: EventCategoryId;
  name: string;
  date: string;
  isRecurring: boolean;
  recurrence?: 'weekly' | 'fortnightly' | 'monthly' | 'custom';
  customRecurrenceDays?: number;
  prepReminderOffset?: number;
  notes?: string;
}

export interface Ritual {
  id: string;
  label: string;
  /** @deprecated Use iconKey, kept for persisted data migration */
  emoji?: string;
  iconKey?: string;
  enabled: boolean;
  cadence: 'weekly' | 'fortnightly' | 'monthly';
  dayOfWeek?: number;
}

export interface StudioRhythm {
  type: RhythmType;
  stageDays: StageDay[];
  dryingTimers: DryingTimers;
  rituals: Ritual[];
  events: StudioEvent[];
  sprintLengthWeeks?: number;
  /** ISO date string of when the sprint started (set automatically on switch to sprint) */
  sprintStartDate?: string;
  /** Target number of pieces to create during the sprint */
  sprintGoalPieces?: number;
  /** ISO timestamp set when user explicitly saves their rhythm schedule */
  configuredAt?: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: 'market',       label: 'Market',       emoji: '🏺', color: '#D4537E' },
  { id: 'shipping',     label: 'Shipping',     emoji: '📦', color: '#378ADD' },
  { id: 'photography',  label: 'Photos',       emoji: '📷', color: '#639922' },
  { id: 'glaze_mixing', label: 'Glaze Mix',    emoji: '🧪', color: '#E24B4A' },
  { id: 'restock',      label: 'Restock',      emoji: '🔁', color: '#BA7517' },
  { id: 'workshop',     label: 'Workshop',     emoji: '🎓', color: '#534AB7' },
  { id: 'open_studio',  label: 'Open Studio',  emoji: '🚪', color: '#1D9E75' },
  { id: 'custom',       label: 'Custom',       emoji: '⭐', color: '#888780' },
];

export const STAGE_CONFIG: Record<StageKey, { label: string; bg: string; text: string }> = {
  throw:  { label: 'Throw',  bg: '#FAEEDA', text: '#854F0B' },
  trim:   { label: 'Trim',   bg: '#E1F5EE', text: '#0F6E56' },
  glaze:  { label: 'Glaze',  bg: '#EEEDFE', text: '#3C3489' },
  bisque: { label: 'Bisque', bg: '#FAECE7', text: '#712B13' },
};

export const DEFAULT_RITUALS: Ritual[] = [
  { id: 'ritual-glaze-mixing',   label: 'Glaze mixing session', iconKey: 'palette',  enabled: false, cadence: 'weekly',      dayOfWeek: 4 },
  { id: 'ritual-studio-cleanup', label: 'Studio deep clean',    iconKey: 'sparkles', enabled: false, cadence: 'weekly',      dayOfWeek: 5 },
  { id: 'ritual-photo-shoot',    label: 'Product photos',       iconKey: 'camera',   enabled: false, cadence: 'fortnightly', dayOfWeek: 6 },
  { id: 'ritual-test-tiles',     label: 'Test tile review',     iconKey: 'layers',   enabled: false, cadence: 'monthly' },
];

/** Suggested weekly rhythm shown as a template in the rhythm editor, not applied until the user configures it. */
export const SUGGESTED_WEEKLY_STAGE_DAYS: StageDay[] = [
  { stage: 'throw',  days: [0, 2] },
  { stage: 'trim',   days: [2, 4] },
  { stage: 'glaze',  days: [4]    },
  { stage: 'bisque', days: [5]    },
];

export const DEFAULT_STUDIO_RHYTHM: StudioRhythm = {
  type: 'weekly',
  stageDays: [
    { stage: 'throw', days: [] },
    { stage: 'trim', days: [] },
    { stage: 'glaze', days: [] },
    { stage: 'bisque', days: [] },
  ],
  dryingTimers: { leatherHardDays: 2, boneDryDays: 5, glazeDryingHours: 8, postBisqueCoolingHours: 12 },
  rituals: DEFAULT_RITUALS,
  events: [],
};

const STAGE_ORDER: StageKey[] = ['throw', 'trim', 'glaze', 'bisque'];

export function normalizeStudioRhythmStageDays(stageDays: StageDay[]): StageDay[] {
  const byStage = new Map(stageDays.map((sd) => [sd.stage, sd.days]));
  return STAGE_ORDER.map((stage) => ({
    stage,
    days: byStage.get(stage) ?? [],
  }));
}

export function normalizeStudioRhythm(rhythm: StudioRhythm): StudioRhythm {
  return {
    ...rhythm,
    stageDays: normalizeStudioRhythmStageDays(rhythm.stageDays ?? []),
  };
}

const LEGACY_AUTO_SEEDED_STAGE_DAYS: StageDay[] = [
  { stage: 'throw',  days: [0, 2] },
  { stage: 'trim',   days: [2, 4] },
  { stage: 'glaze',  days: [4]    },
  { stage: 'bisque', days: []     },
];

function stageDaysMatch(a: StageDay[], b: StageDay[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((entry, index) => {
    const other = b[index];
    return entry.stage === other.stage
      && entry.days.length === other.days.length
      && entry.days.every((day, dayIndex) => day === other.days[dayIndex]);
  });
}

export function isStudioRhythmConfigured(rhythm: StudioRhythm): boolean {
  if (rhythm.configuredAt) return true;

  if (rhythm.type === 'freeform') {
    return rhythm.events.length > 0 || rhythm.rituals.some((r) => r.enabled);
  }

  const hasAssignedDays = rhythm.stageDays.some((sd) => sd.days.length > 0);
  if (!hasAssignedDays) return false;

  const looksLikeLegacyDefault =
    rhythm.type === 'weekly'
    && rhythm.events.length === 0
    && rhythm.rituals.every((ritual) => !ritual.enabled)
    && stageDaysMatch(rhythm.stageDays, LEGACY_AUTO_SEEDED_STAGE_DAYS);

  return !looksLikeLegacyDefault;
}

export function getDateKey(date: Date | string = new Date()) {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getUpcomingRhythmDates(days: number, from: Date = new Date()) {
  return Array.from({ length: days }, (_, index) => {
    const current = new Date(from);
    current.setDate(from.getDate() + index);

    return {
      key: getDateKey(current),
      date: current,
      shortWeekday: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(current),
      dayLabel: String(current.getDate()),
      fullLabel: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(current),
    };
  });
}
