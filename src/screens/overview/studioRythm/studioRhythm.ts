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
