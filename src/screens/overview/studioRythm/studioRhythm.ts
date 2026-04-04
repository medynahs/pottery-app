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
  emoji: string;
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

export const STAGE_CONFIG: Record<StageKey, { label: string; bg: string; text: string; emoji: string }> = {
  throw:  { label: 'Throw',  bg: '#FAEEDA', text: '#854F0B', emoji: '🏺' },
  trim:   { label: 'Trim',   bg: '#E1F5EE', text: '#0F6E56', emoji: '✂️' },
  glaze:  { label: 'Glaze',  bg: '#EEEDFE', text: '#3C3489', emoji: '🖌️' },
  bisque: { label: 'Bisque', bg: '#FAECE7', text: '#712B13', emoji: '🔥' },
};

export const DEFAULT_RITUALS: Ritual[] = [
  { id: 'ritual-glaze-mixing',   label: 'Glaze mixing session', emoji: '🧪', enabled: false, cadence: 'weekly',      dayOfWeek: 4 },
  { id: 'ritual-studio-cleanup', label: 'Studio deep clean',    emoji: '🧹', enabled: false, cadence: 'weekly',      dayOfWeek: 5 },
  { id: 'ritual-photo-shoot',    label: 'Product photos',       emoji: '📷', enabled: false, cadence: 'fortnightly', dayOfWeek: 6 },
  { id: 'ritual-test-tiles',     label: 'Test tile review',     emoji: '🔬', enabled: false, cadence: 'monthly' },
];

export const DEFAULT_STUDIO_RHYTHM: StudioRhythm = {
  type: 'weekly',
  stageDays: [
    { stage: 'throw',  days: [0, 2] },
    { stage: 'trim',   days: [2, 4] },
    { stage: 'glaze',  days: [4]    },
    { stage: 'bisque', days: []     },
  ],
  dryingTimers: { leatherHardDays: 2, boneDryDays: 5, glazeDryingHours: 8, postBisqueCoolingHours: 12 },
  rituals: DEFAULT_RITUALS,
  events: [],
};

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
