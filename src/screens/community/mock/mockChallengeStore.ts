import { useSyncExternalStore } from 'react';
import {
  MOCK_CHALLENGE_ENTRIES,
  MOCK_HALL_OF_FAME_CYCLES,
  trackTitle,
} from './challengeMockData';
import type { ChallengePhase, MockChallengeEntry, MockHallOfFameWinner } from './challengeMockTypes';

type MockChallengeState = {
  phase: ChallengePhase;
  joinedTrackId: string | null;
  hasSubmitted: boolean;
  submittedNote: string;
  votesByTrack: Record<string, string>;
  extraVotes: Record<string, number>;
};

let state: MockChallengeState = {
  phase: 'voting',
  joinedTrackId: null,
  hasSubmitted: false,
  submittedNote: '',
  votesByTrack: {},
  extraVotes: {},
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function setMockChallengePhase(phase: ChallengePhase) {
  state = { ...state, phase };
  emit();
}

export function resetMockChallengeStore() {
  state = {
    phase: 'voting',
    joinedTrackId: null,
    hasSubmitted: false,
    submittedNote: '',
    votesByTrack: {},
    extraVotes: {},
  };
  emit();
}

export function mockJoinChallenge(trackId: string) {
  state = { ...state, joinedTrackId: trackId };
  emit();
}

export function mockLeaveChallenge() {
  state = {
    ...state,
    joinedTrackId: null,
    hasSubmitted: false,
    submittedNote: '',
  };
  emit();
}

export function mockSubmitEntry(note: string) {
  state = { ...state, hasSubmitted: true, submittedNote: note.trim() };
  emit();
}

export function mockVoteForEntry(trackId: string, entryId: string): boolean {
  const previousVote = state.votesByTrack[trackId];
  if (previousVote === entryId) return false;

  const extraVotes = { ...state.extraVotes };
  if (previousVote) {
    extraVotes[previousVote] = Math.max(0, (extraVotes[previousVote] ?? 0) - 1);
  }
  extraVotes[entryId] = (extraVotes[entryId] ?? 0) + 1;

  state = {
    ...state,
    votesByTrack: { ...state.votesByTrack, [trackId]: entryId },
    extraVotes,
  };
  emit();
  return true;
}

export function getEntryVoteCount(entryId: string, baseVoteCount: number): number {
  return baseVoteCount + (state.extraVotes[entryId] ?? 0);
}

export function getEntriesForTrack(trackId: string): MockChallengeEntry[] {
  return MOCK_CHALLENGE_ENTRIES.filter((e) => e.trackId === trackId)
    .map((entry) => ({
      ...entry,
      rank: undefined,
    }))
    .sort(
      (a, b) =>
        getEntryVoteCount(b.id, b.baseVoteCount) - getEntryVoteCount(a.id, a.baseVoteCount),
    )
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function getVotedEntryId(trackId: string): string | null {
  return state.votesByTrack[trackId] ?? null;
}

export function hasVotedInTrack(trackId: string): boolean {
  return Boolean(state.votesByTrack[trackId]);
}

export function getClosedWinners(): MockHallOfFameWinner[] {
  const cycle = MOCK_HALL_OF_FAME_CYCLES[0];
  return cycle?.winners ?? [];
}

export function getPhaseLabel(phase: ChallengePhase): string {
  switch (phase) {
    case 'open':
      return 'Submissions open · 6 days left';
    case 'voting':
      return 'Voting open · 3 days left';
    case 'closed':
      return 'Winners announced';
  }
}

export function getPrimaryCta(phase: ChallengePhase, joined: boolean, hasSubmitted: boolean): string {
  if (phase === 'open') {
    if (!joined) return 'Join this challenge';
    if (!hasSubmitted) return 'Submit my entry';
    return 'Browse submissions';
  }
  if (phase === 'voting') return 'Vote on submissions';
  return 'View winners';
}

export function useMockChallengeStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...snapshot,
    setPhase: setMockChallengePhase,
    join: mockJoinChallenge,
    leave: mockLeaveChallenge,
    submit: mockSubmitEntry,
    vote: mockVoteForEntry,
    getEntriesForTrack,
    getVotedEntryId,
    hasVotedInTrack,
    getEntryVoteCount,
    getClosedWinners,
    getPhaseLabel: () => getPhaseLabel(snapshot.phase),
    getPrimaryCta: () =>
      getPrimaryCta(snapshot.phase, snapshot.joinedTrackId !== null, snapshot.hasSubmitted),
    trackTitle,
  };
}

export type MockChallengeStore = ReturnType<typeof useMockChallengeStore>;
