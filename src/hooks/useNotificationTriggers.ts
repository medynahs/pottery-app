import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { CHALLENGES_QUERY_KEY } from '../screens/community/hooks/useChallengesQuery';
import { generateStudioRhythmSuggestions } from '../screens/overview/studioRythm/generateStudioRhythmSuggestions';
import { getTodayMissionKey } from '../screens/overview/utils/missionDate';
import { apiListChallenges, challengeDisplayName } from '../services/challenges';
import {
    cancelScheduledNotificationsByKind,
    scheduleKilnkinNotification,
    scheduleWeeklySummaryNotification,
} from '../services/notifications';
import { useVisibleFirings, useVisiblePieces, useAppStore } from '../store/appStore';

const DRYING_THRESHOLD_DAYS = 3;
const STAGE_OVERAGE_DAYS = 7;
const DAILY_MISSION_REMINDER_HOUR = 9;
const UPCOMING_CHALLENGE_WINDOW_HOURS = 48;

const TERMINAL_STAGES = new Set(['finished', 'cemetery']);

function getCurrentStageEnteredAt(piece: { stage: string; createdAt: string; timeline: { stage: string; timestamp: string }[] }): Date | null {
  const normalizedStage = piece.stage.trim().toLowerCase();
  const fromTimeline = [...piece.timeline]
    .reverse()
    .find((entry) => entry.stage.trim().toLowerCase() === normalizedStage);

  const ts = fromTimeline?.timestamp ?? piece.createdAt;
  const parsed = new Date(ts);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function nextLocalHour(hour: number): Date {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
}

export function useNotificationTriggers() {
  const queryClient = useQueryClient();
  const notificationPrefs = useAppStore((s) => s.notificationPrefs);
  const kilnkinCompanion = useAppStore((s) => s.kilnkinCompanion);
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const firings = useVisibleFirings();
  const pieces = useVisiblePieces();
  const rhythm = useAppStore((s) => s.studioRhythm);
  const dailyMissionCompletion = useAppStore((s) => s.dailyMissionCompletion);

  const notifiedFiringIds = useRef<Set<string>>(new Set());
  const notifiedScheduledTodayFiringIds = useRef<Set<string>>(new Set());
  const notifiedDryingIds = useRef<Set<number>>(new Set());
  const notifiedStageOverageKeys = useRef<Set<string>>(new Set());
  const firedAchievementKeys = useRef<Set<string>>(new Set());
  const dailyMissionReminderDay = useRef<string | null>(null);
  const challengeReminderIds = useRef<Set<string>>(new Set());
  const hydratedBaseline = useRef(false);

  useEffect(() => {
    if (hydratedBaseline.current) return;

    for (const firing of firings) {
      if (firing.state === 'completed') {
        notifiedFiringIds.current.add(firing.id);
      }
    }

    const now = Date.now();
    const thresholdMs = DRYING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
    for (const piece of pieces) {
      if (piece.stage !== 'drying') continue;
      const createdAt = new Date(piece.createdAt).getTime();
      if (Number.isNaN(createdAt)) continue;
      if (now - createdAt >= thresholdMs) {
        notifiedDryingIds.current.add(piece.id);
      }
    }

    for (const piece of pieces) {
      const stage = piece.stage.trim().toLowerCase();
      if (TERMINAL_STAGES.has(stage)) continue;

      const enteredAt = getCurrentStageEnteredAt(piece);
      if (!enteredAt) continue;

      const daysInStage = Math.floor((Date.now() - enteredAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysInStage >= STAGE_OVERAGE_DAYS) {
        notifiedStageOverageKeys.current.add(`${piece.id}:${stage}`);
      }
    }

    const totalPieces = pieces.length;
    const finishedPieces = pieces.filter((piece) => piece.stage === 'finished').length;
    if (finishedPieces > 0) {
      firedAchievementKeys.current.add('first-finished-piece');
    }
    const tensMilestone = Math.floor(totalPieces / 10);
    for (let i = 1; i <= tensMilestone; i += 1) {
      firedAchievementKeys.current.add(`pieces-${i * 10}`);
    }

    hydratedBaseline.current = true;
  }, [firings, pieces]);

  useEffect(() => {
    if (!hydratedBaseline.current) return;
    if (!notificationPrefs.kilnFinished) return;

    for (const firing of firings) {
      if (firing.state !== 'completed') continue;
      if (notifiedFiringIds.current.has(firing.id)) continue;

      notifiedFiringIds.current.add(firing.id);
      void scheduleKilnkinNotification({
        companion: kilnkinCompanion,
        kind: 'kiln-finished',
        payload: { firingName: firing.name },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
      });
    }
  }, [firings, kilnkinCompanion, notificationPrefs.kilnFinished]);

  useEffect(() => {
    if (!hydratedBaseline.current) return;
    if (!notificationPrefs.kilnFinished) return;

    const today = startOfLocalDay(new Date());
    for (const firing of firings) {
      if (!firing.scheduledDate) continue;
      if (notifiedScheduledTodayFiringIds.current.has(firing.id)) continue;

      const scheduled = new Date(firing.scheduledDate);
      if (Number.isNaN(scheduled.getTime())) continue;
      if (!isSameLocalDay(scheduled, today)) continue;
      if (firing.state !== 'scheduled') continue;

      notifiedScheduledTodayFiringIds.current.add(firing.id);
      void scheduleKilnkinNotification({
        companion: kilnkinCompanion,
        kind: 'firing-scheduled',
        payload: { firingName: firing.name },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 4 },
      });
    }
  }, [firings, kilnkinCompanion, notificationPrefs.kilnFinished]);

  useEffect(() => {
    if (!hydratedBaseline.current) return;
    if (!notificationPrefs.pieceDrying) return;

    const now = Date.now();
    const thresholdMs = DRYING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

    for (const piece of pieces) {
      if (piece.stage !== 'drying') continue;
      if (notifiedDryingIds.current.has(piece.id)) continue;

      const createdAt = new Date(piece.createdAt).getTime();
      if (Number.isNaN(createdAt)) continue;

      if (now - createdAt < thresholdMs) continue;

      notifiedDryingIds.current.add(piece.id);
      void scheduleKilnkinNotification({
        companion: kilnkinCompanion,
        kind: 'piece-drying',
        payload: { pieceName: piece.name, days: DRYING_THRESHOLD_DAYS },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
      });
    }
  }, [pieces, kilnkinCompanion, notificationPrefs.pieceDrying]);

  useEffect(() => {
    if (!hydratedBaseline.current) return;
    if (!notificationPrefs.pieceDrying) return;

    const now = Date.now();
    for (const piece of pieces) {
      const stage = piece.stage.trim().toLowerCase();
      if (TERMINAL_STAGES.has(stage)) continue;

      const enteredAt = getCurrentStageEnteredAt(piece);
      if (!enteredAt) continue;

      const daysInStage = Math.floor((now - enteredAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysInStage < STAGE_OVERAGE_DAYS) continue;

      const key = `${piece.id}:${stage}`;
      if (notifiedStageOverageKeys.current.has(key)) continue;

      notifiedStageOverageKeys.current.add(key);
      void scheduleKilnkinNotification({
        companion: kilnkinCompanion,
        kind: 'stage-overage',
        payload: {
          pieceName: piece.name,
          stageName: piece.stage,
          days: daysInStage,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 4 },
      });
    }
  }, [pieces, kilnkinCompanion, notificationPrefs.pieceDrying]);

  const achievementSnapshot = useMemo(() => {
    const totalPieces = pieces.length;
    const finishedPieces = pieces.filter((piece) => piece.stage === 'finished').length;
    return { totalPieces, finishedPieces };
  }, [pieces]);

  const weeklySummaryPayload = useMemo(
    () => ({
      totalPieces: pieces.length,
      finishedPieces: pieces.filter((piece) => piece.stage === 'finished').length,
    }),
    [pieces],
  );

  useEffect(() => {
    if (!hydratedBaseline.current) return;
    if (!notificationPrefs.achievement) return;

    const firstFinishedKey = 'first-finished-piece';
    if (achievementSnapshot.finishedPieces > 0 && !firedAchievementKeys.current.has(firstFinishedKey)) {
      firedAchievementKeys.current.add(firstFinishedKey);
      void scheduleKilnkinNotification({
        companion: kilnkinCompanion,
        kind: 'achievement',
        payload: { achievementName: 'First Finished Piece' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
      });
    }

    const tensMilestone = Math.floor(achievementSnapshot.totalPieces / 10);
    if (tensMilestone > 0) {
      const key = `pieces-${tensMilestone * 10}`;
      if (!firedAchievementKeys.current.has(key)) {
        firedAchievementKeys.current.add(key);
        void scheduleKilnkinNotification({
          companion: kilnkinCompanion,
          kind: 'achievement',
          payload: { achievementName: `${tensMilestone * 10} Pieces Tracked` },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
        });
      }
    }
  }, [achievementSnapshot, kilnkinCompanion, notificationPrefs.achievement]);

  useEffect(() => {
    if (!hydratedBaseline.current) return;
    if (!notificationPrefs.dailyMission) {
      dailyMissionReminderDay.current = null;
      void cancelScheduledNotificationsByKind('daily-mission');
      return;
    }

    const suggestions = generateStudioRhythmSuggestions({ pieces, firings, rhythm });
    const todayMissionKey = getTodayMissionKey();
    const completedToday = dailyMissionCompletion[todayMissionKey] ?? [];
    const incompleteCount = suggestions.filter((s) => !completedToday.includes(s.type)).length;

    if (incompleteCount > 0 && dailyMissionReminderDay.current !== todayMissionKey) {
      dailyMissionReminderDay.current = todayMissionKey;
      const reminderAt = nextLocalHour(DAILY_MISSION_REMINDER_HOUR);

      void cancelScheduledNotificationsByKind('daily-mission').finally(() => {
        void scheduleKilnkinNotification({
          companion: kilnkinCompanion,
          kind: 'daily-mission',
          payload: { missionCount: incompleteCount },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderAt },
        });
      });
    }
  }, [
    dailyMissionCompletion,
    firings,
    kilnkinCompanion,
    notificationPrefs.dailyMission,
    pieces,
    rhythm,
  ]);

  useEffect(() => {
    if (!hydratedBaseline.current) return;
    if (!notificationPrefs.weeklySummary) {
      void cancelScheduledNotificationsByKind('weekly-summary');
      return;
    }

    void scheduleWeeklySummaryNotification(kilnkinCompanion, {
      totalPieces: weeklySummaryPayload.totalPieces,
      finishedPieces: weeklySummaryPayload.finishedPieces,
    });
  }, [
    kilnkinCompanion,
    notificationPrefs.weeklySummary,
    weeklySummaryPayload,
  ]);

  useEffect(() => {
    if (!hydratedBaseline.current) return;
    if (!notificationPrefs.challengeDeadline) {
      challengeReminderIds.current.clear();
      void cancelScheduledNotificationsByKind('challenge-deadline');
      return;
    }
    if (!isSignedIn) return;

    let cancelled = false;

    const scheduleChallengeDeadlineReminder = async () => {
      try {
        const challenges = await queryClient.fetchQuery({
          queryKey: CHALLENGES_QUERY_KEY,
          queryFn: () => apiListChallenges(),
          staleTime: 5 * 60 * 1000,
        });
        if (cancelled) return;

        const now = Date.now();
        for (const challenge of challenges) {
          const deadline = challenge.end_date ?? challenge.submission_deadline;
          if (!deadline) continue;

          const challengeId = challenge.id;
          if (challengeReminderIds.current.has(challengeId)) continue;

          // Backend may expose my_entry_id when joined. If absent, skip scheduling.
          const maybeMyEntryId = (challenge as unknown as { my_entry_id?: string | null }).my_entry_id;
          if (!maybeMyEntryId) continue;

          const endsAt = new Date(deadline).getTime();
          if (Number.isNaN(endsAt)) continue;

          const remindAtMs = endsAt - UPCOMING_CHALLENGE_WINDOW_HOURS * 60 * 60 * 1000;
          if (remindAtMs <= now) continue;

          challengeReminderIds.current.add(challengeId);
          const hoursLeft = Math.max(1, Math.round((endsAt - now) / (1000 * 60 * 60)));
          void scheduleKilnkinNotification({
            companion: kilnkinCompanion,
            kind: 'challenge-deadline',
            payload: {
              challengeTitle: challengeDisplayName(challenge),
              hoursLeft,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(remindAtMs),
            },
          });
        }
      } catch {
        // Fail quietly; notification feature should not block app flow.
      }
    };

    void scheduleChallengeDeadlineReminder();
    return () => {
      cancelled = true;
    };
  }, [kilnkinCompanion, notificationPrefs.challengeDeadline, isSignedIn, queryClient]);
}
