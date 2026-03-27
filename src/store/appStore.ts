import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_GLAZES, INITIAL_GLAZE_TESTS } from '../screens/glazes/data';
import type { GlazeLibraryItem, GlazeTestTile } from '../screens/glazes/types';
import { DEFAULT_CHECKLIST, FIRING_TARGET_STAGE } from '../screens/kiln/constants';
import type { Firing, FiringState, Kiln, KilnChecklist, KilnType } from '../screens/kiln/types';
import {
  DEFAULT_KILNKIN_COMPANION,
  type KilnkinCompanion,
} from '../screens/overview/kilnkin/kilnkinCompanion';
import type { StudioRhythmSuggestionType } from '../screens/overview/studioRythm/generateStudioRhythmSuggestions';
import type { StudioRhythmConfig, StudioRhythmEvent, StudioRhythmGoal } from '../screens/overview/studioRythm/studioRhythm';
import { INITIAL_PIECES, STAGES } from '../screens/pieces/constants';
import {
  applyPricingUserTypePreset,
  buildDefaultPricingSettings,
  type PricingFiringMode,
  type PricingSettings,
  type PricingTier,
  type PricingUserType,
} from '../screens/pieces/pricing';
import { getConfiguredNextStage } from '../screens/pieces/stageFlow';
import type { Piece } from '../screens/pieces/types';
import { fetchUsers, type BackendUser } from '../services';
import { zustandStorage } from './storage';

// ── Sync queue ────────────────────────────────────────────────────────────────
export type SyncOperationType =
  | 'addPieces'
  | 'updatePiece'
  | 'deletePiece'
  | 'advancePiece'
  | 'advancePieceIds'
  | 'advanceBatch'
  | 'sendToCemetery'
  | 'duplicatePiece'
  | 'duplicateBatch'
  | 'updateJournalEntry'
  | 'updateStageConfig'
  | 'updateUser'
  | 'updateTask';

export type SyncOperation = {
  id: string;
  type: SyncOperationType;
  payload: unknown;
  timestamp: string;
};

export type PracticeMode = 'home' | 'studio' | 'both';
export type UserRole = 'owner' | 'member';
export type OnboardingUserType =
  | 'home-potter'
  | 'studio-potter'
  | 'hybrid-potter'
  | 'studio-owner-technician'
  | 'teacher'
  | 'business-owner'
  | 'not-sure';
export type MeasurementUnit = 'metric' | 'imperial';
export type OnboardingPracticeFrequency = 'daily' | 'weekly' | 'flexible';
export type OnboardingPieceFocus = 'wheel' | 'hand-building' | 'glazing' | 'reclaim';
export type AppModule = 'overview' | 'pieces' | 'kiln' | 'library' | 'community';

export interface OnboardingProfile {
  userType: OnboardingUserType;
  pricingUserType: PricingUserType;
  hasOwnKiln: boolean | null;
  studioName?: string;
  kilnCount?: number;
  kilnName?: string;
  kilnType?: KilnType;
  kilnNickname?: string;
  homeStudioNotes?: string;
  toolsChecklist?: string;
  routinesFrequency: OnboardingPracticeFrequency;
  routinesFocus: OnboardingPieceFocus;
  preferredUnits: MeasurementUnit;
  language: string;
  notificationsEnabled: boolean;
  quickTourRequested: boolean;
  activeModules: AppModule[];
  kilnkinId?: string;
}

export interface StageConfig {
  id: string;
  label: string;
  defaultLabel: string;
  enabled: boolean;
  isCustom?: boolean;
  iconKey?: string;
}

export interface ClayBody {
  id: string;
  name: string;
}

export const DEFAULT_CLAY_BODIES: ClayBody[] = [
  { id: 'bmix',         name: 'B-Mix' },
  { id: 'porcelain',    name: 'Porcelain' },
  { id: 'stoneware',    name: 'Stoneware' },
  { id: 'speckled-buff', name: 'Speckled Buff' },
];

export interface FormingMethod {
  id: string;
  name: string;
}

export const DEFAULT_FORMING_METHODS: FormingMethod[] = [
  { id: 'coiled',              name: 'Coiled' },
  { id: 'mold-formed',         name: 'Mold Formed' },
  { id: 'pinched',             name: 'Pinched' },
  { id: 'slab-built',          name: 'Slab Built' },
  { id: 'slip-cast',           name: 'Slip Cast' },
  { id: 'thrown-and-altered',  name: 'Thrown and Altered' },
  { id: 'wheel-thrown',        name: 'Wheel Thrown' },
];

export interface PieceFormOption {
  id: string;
  name: string;
}

export const DEFAULT_PIECE_FORM_OPTIONS: PieceFormOption[] = [
  { id: 'bowl',        name: 'Bowl' },
  { id: 'coffee-cup',  name: 'Coffee Cup' },
  { id: 'jar',         name: 'Jar' },
  { id: 'moon-jar',    name: 'Moon Jar' },
  { id: 'mug',         name: 'Mug' },
  { id: 'planter',     name: 'Planter' },
  { id: 'plate',       name: 'Plate' },
  { id: 'platter',     name: 'Platter' },
  { id: 'tea-cup',     name: 'Tea Cup' },
  { id: 'test-tile',   name: 'Test Tile' },
  { id: 'urn',         name: 'Urn' },
  { id: 'vase',        name: 'Vase' },
];

export type Task = {
  title: string;
  time: string;
  type: string;
  status: 'pending' | 'completed';
};

export type DailyMissionCompletion = Record<string, StudioRhythmSuggestionType[]>;

const DEFAULT_STUDIO_GOALS: StudioRhythmGoal[] = [
  {
    id: 'goal-cylinder-practice',
    title: 'Train cylinders once a week',
    type: 'cylinder-practice',
    frequency: 'weekly',
    targetCount: 1,
    active: true,
  },
  {
    id: 'goal-reclaim-session',
    title: 'Run one reclaim session',
    type: 'reclaim-session',
    frequency: 'weekly',
    targetCount: 1,
    active: false,
  },
  {
    id: 'goal-finish-piece',
    title: 'Finish one piece this week',
    type: 'finish-piece',
    frequency: 'weekly',
    targetCount: 1,
    active: false,
  },
];

const DEFAULT_STUDIO_EVENTS: StudioRhythmEvent[] = [];

export const CEMETERY_ID = 'cemetery';

const DEFAULT_ONBOARDING_PROFILE: OnboardingProfile = {
  userType: 'not-sure',
  pricingUserType: 'side-business',
  hasOwnKiln: null,
  routinesFrequency: 'weekly',
  routinesFocus: 'wheel',
  preferredUnits: 'metric',
  language: 'English',
  notificationsEnabled: true,
  quickTourRequested: false,
  activeModules: ['overview', 'pieces', 'kiln', 'library', 'community'],
  kilnkinId: DEFAULT_KILNKIN_COMPANION.id,
};

const KNOWN_APP_MODULES: AppModule[] = ['overview', 'pieces', 'kiln', 'library', 'community'];

function normalizeModuleId(module: string): AppModule | string {
  return module === 'journal' ? 'library' : module;
}

function normalizeModuleList(modules?: readonly string[]): AppModule[] {
  if (!modules?.length) {
    return [];
  }

  const next: AppModule[] = [];

  for (const module of modules) {
    const normalized = normalizeModuleId(module);

    if (!KNOWN_APP_MODULES.includes(normalized as AppModule) || next.includes(normalized as AppModule)) {
      continue;
    }

    next.push(normalized as AppModule);
  }

  return next;
}

function normalizeOnboardingProfile(profile?: Partial<OnboardingProfile>): OnboardingProfile {
  const normalizedModules = normalizeModuleList(profile?.activeModules);
  return {
    ...DEFAULT_ONBOARDING_PROFILE,
    ...profile,
    activeModules: normalizedModules.length > 0 ? normalizedModules : DEFAULT_ONBOARDING_PROFILE.activeModules,
  };
}

function buildDefaultStages(): StageConfig[] {
  return STAGES.filter((s) => s.id !== 'all').map((s) => ({
    id: s.id,
    label: s.label,
    defaultLabel: s.label,
    enabled: true,
  }));
}

interface AppState {
  // ── App settings ──────────────────────────────────────────────
  generalOnboardingCompleted: boolean;
  onboardingProfile: OnboardingProfile;
  practiceMode: PracticeMode;
  role: UserRole;
  enabledModules: AppModule[];
  setOnboardingProfile: (patch: Partial<OnboardingProfile>) => void;
  completeGeneralOnboarding: (profile?: Partial<OnboardingProfile>) => void;
  reopenGeneralOnboarding: () => void;
  setPracticeMode: (mode: PracticeMode) => void;
  setRole: (role: UserRole) => void;
  setEnabledModules: (modules: string[]) => void;
  toggleModule: (module: string) => void;
  isModuleEnabled: (module: string) => boolean;

  // ── User ──────────────────────────────────────────────────────
  user: {
    name: string;
    avatarInitial: string;
    studioName?: string;
    location?: string;
    bio?: string;
    coverImageUri?: string;
    avatarImageUri?: string;
  };
  setUser: (patch: Partial<AppState['user']>) => void;
  backendUsers: BackendUser[];
  backendUsersStatus: 'idle' | 'loading' | 'success' | 'error';
  backendUsersError: string | null;
  loadBackendUsers: () => Promise<void>;
  kilnkinCompanion: KilnkinCompanion;
  setKilnkinCompanion: (companion: KilnkinCompanion) => void;
  renameKilnkinCompanion: (name: string) => void;

  // ── Tasks (Today's Routine) ───────────────────────────────────
  tasks: Task[];
  toggleTask: (index: number) => void;
  addTask: (task: Task) => void;

  // ── Studio Rhythm ────────────────────────────────────────────
  studioRhythmConfig: StudioRhythmConfig;
  setStudioRhythmConfig: (patch: Partial<StudioRhythmConfig>) => void;
  addStudioRhythmEvent: (event: Omit<StudioRhythmEvent, 'id'>) => void;
  removeStudioRhythmEvent: (id: string) => void;
  updateStudioRhythmEvent: (id: string, patch: Partial<Omit<StudioRhythmEvent, 'id'>>) => void;
  toggleStudioRhythmGoal: (id: string) => void;
  setStudioRhythmGoalTarget: (id: string, targetCount: number) => void;
  dailyMissionCompletion: DailyMissionCompletion;
  toggleDailyMissionCompletion: (dateKey: string, missionType: StudioRhythmSuggestionType) => void;

  // ── Pieces ────────────────────────────────────────────────────
  pieces: Piece[];
  addPieces: (newPieces: Piece[]) => void;
  updatePiece: (piece: Piece) => void;
  deletePiece: (id: number) => void;
  duplicatePiece: (piece: Piece) => void;
  duplicateBatch: (batchId: string) => void;
  updateJournalEntry: (pieceId: number, entryIndex: number, patch: { notes?: string; photo?: string }) => void;
  advancePiece: (pieceId: number) => void;
  advancePieceIds: (ids: number[]) => void;
  advanceBatch: (batchId: string, fromStage: string) => void;
  sendToCemetery: (pieceId: number, memorial?: { epitaph?: string; causeOfDeath?: string }) => void;

  // ── Stage Configuration ───────────────────────────────────────
  stageConfig: StageConfig[];
  toggleStage: (id: string) => void;
  renameStage: (id: string, label: string) => void;
  addStage: (label: string) => void;
  removeStage: (id: string) => void;
  changeStageIcon: (id: string, iconKey: string) => void;
  moveStageUp: (id: string) => void;
  moveStageDown: (id: string) => void;
  resetStagesToDefaults: () => void;

  // ── Clay Bodies ───────────────────────────────────────────────
  clayBodies: ClayBody[];
  defaultClayBodyId: string | null;
  addClayBody: (name: string) => void;
  removeClayBody: (id: string) => void;
  renameClayBody: (id: string, name: string) => void;
  setDefaultClayBody: (id: string | null) => void;

  // ── Forming Methods ───────────────────────────────────────────
  formingMethods: FormingMethod[];
  addFormingMethod: (name: string) => void;
  removeFormingMethod: (id: string) => void;
  renameFormingMethod: (id: string, name: string) => void;

  // ── Form Options ──────────────────────────────────────────────
  pieceFormOptions: PieceFormOption[];
  addPieceFormOption: (name: string) => void;
  removePieceFormOption: (id: string) => void;
  renamePieceFormOption: (id: string, name: string) => void;

  // ── Firing Defaults ──────────────────────────────────────────
  defaultBisqueTemp: string | null;
  setDefaultBisqueTemp: (cone: string | null) => void;
  defaultGlazeTemp: string | null;
  setDefaultGlazeTemp: (cone: string | null) => void;

  // ── Pricing Rules ───────────────────────────────────────────
  pricingSettings: PricingSettings;
  pricingOnboardingCompleted: boolean;
  setPricingSettings: (patch: Partial<PricingSettings>) => void;
  completePricingOnboarding: (userType: PricingUserType) => void;
  reopenPricingOnboarding: () => void;
  setPricingTier: (mode: PricingFiringMode, index: number, patch: Partial<PricingTier>) => void;
  resetPricingSettings: () => void;

  // ── Glaze Library ───────────────────────────────────────────
  glazes: GlazeLibraryItem[];
  glazeTests: GlazeTestTile[];
  addGlaze: (glaze: GlazeLibraryItem) => void;
  updateGlaze: (glaze: GlazeLibraryItem) => void;
  deleteGlaze: (id: string) => void;
  toggleFavoriteGlaze: (id: string) => void;
  addGlazeTest: (test: GlazeTestTile) => void;
  deleteGlazeTest: (id: string) => void;

  // ── Kilns ─────────────────────────────────────────────────────
  kilns: Kiln[];
  firings: Firing[];
  kilnChecklist: KilnChecklist[];
  addKiln: (kiln: Kiln) => void;
  updateKiln: (kiln: Kiln) => void;
  deleteKiln: (id: string) => void;
  addFiring: (firing: Firing) => void;
  updateFiring: (firing: Firing) => void;
  deleteFiring: (id: string) => void;
  updateFiringState: (firingId: string, state: FiringState) => void;
  assignPiecesToFiring: (firingId: string, pieceIds: number[]) => void;
  completeFiring: (firingId: string, result: 'success' | 'issues' | 'failure', resultNotes: string) => void;
  toggleKilnChecklistItem: (id: string) => void;
  addKilnChecklistItem: (text: string) => void;
  removeKilnChecklistItem: (id: string) => void;

  // ── Offline / Sync ────────────────────────────────────────────
  /** Operations queued while offline, waiting to sync to the server. */
  pendingSyncOps: SyncOperation[];
  /** True while a sync flush is in progress. Not persisted. */
  isSyncing: boolean;
  /** ISO timestamp of the most recent successful sync. */
  lastSyncedAt: string | null;
  enqueueSyncOp: (op: Omit<SyncOperation, 'id' | 'timestamp'>) => void;
  clearSyncQueue: () => void;
  setIsSyncing: (v: boolean) => void;
  setLastSyncedAt: (ts: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // ── App settings ──────────────────────────────────────────────
  generalOnboardingCompleted: false,
  onboardingProfile: DEFAULT_ONBOARDING_PROFILE,
  practiceMode: 'both',
  role: 'owner',
  enabledModules: ['overview', 'pieces', 'kiln', 'library', 'community'],

  setOnboardingProfile: (patch) =>
    set((state) => {
      const currentProfile = normalizeOnboardingProfile(state.onboardingProfile);
      return {
      onboardingProfile: {
        ...currentProfile,
        ...patch,
        activeModules:
          patch.activeModules === undefined
            ? currentProfile.activeModules
            : normalizeModuleList(patch.activeModules),
      },
    };
    }),
  completeGeneralOnboarding: (profile) =>
    set((state) => {
      const currentProfile = normalizeOnboardingProfile(state.onboardingProfile);
      return {
      generalOnboardingCompleted: true,
      onboardingProfile: {
        ...currentProfile,
        ...profile,
        activeModules:
          profile?.activeModules === undefined
            ? currentProfile.activeModules
            : normalizeModuleList(profile.activeModules),
      },
    };
    }),
  reopenGeneralOnboarding: () => set({ generalOnboardingCompleted: false }),
  setPracticeMode: (mode) => set({ practiceMode: mode }),
  setRole: (role) => set({ role }),
  setEnabledModules: (modules) => set({ enabledModules: normalizeModuleList(modules) }),
  toggleModule: (module) =>
    set((state) => {
      const normalizedModule = normalizeModuleId(module);

      if (!KNOWN_APP_MODULES.includes(normalizedModule as AppModule)) {
        return state;
      }

      const enabledModules = normalizeModuleList(state.enabledModules);

      return {
        enabledModules: enabledModules.includes(normalizedModule as AppModule)
          ? enabledModules.filter((currentModule) => currentModule !== normalizedModule)
          : [...enabledModules, normalizedModule as AppModule],
      };
    }),
  isModuleEnabled: (module) =>
    normalizeModuleList(get().enabledModules).includes(normalizeModuleId(module) as AppModule),

  // ── User ──────────────────────────────────────────────────────
  user: { name: 'Ariane Medina', avatarInitial: 'A', studioName: 'Mallory Clay Studio', location: 'Portland, OR', bio: 'Wheel-thrown stoneware with a love for imperfect forms. Teaching beginners on weekends.' },
  setUser: (patch) => set((state) => ({ user: { ...state.user, ...patch } })),
  backendUsers: [],
  backendUsersStatus: 'idle',
  backendUsersError: null,
  loadBackendUsers: async () => {
    if (get().backendUsersStatus === 'loading') {
      return;
    }

    set({ backendUsersStatus: 'loading', backendUsersError: null });

    try {
      const users = await fetchUsers();
      set({
        backendUsers: users,
        backendUsersStatus: 'success',
        backendUsersError: null,
      });
    } catch (error) {
      set({
        backendUsersStatus: 'error',
        backendUsersError: error instanceof Error ? error.message : 'Unable to load users',
      });
    }
  },
  kilnkinCompanion: DEFAULT_KILNKIN_COMPANION,
  setKilnkinCompanion: (companion) => set({ kilnkinCompanion: companion }),
  renameKilnkinCompanion: (name) =>
    set((state) => ({
      kilnkinCompanion: {
        ...state.kilnkinCompanion,
        name: name.trim() || state.kilnkinCompanion.name,
      },
    })),

  // ── Studio Rhythm ─────────────────────────────────────────────
  studioRhythmConfig: {
    wheelPractice: true,
    reclaimFocus: false,
    preferredTrimAfterDays: 3,
    weeklyGoals: DEFAULT_STUDIO_GOALS,
    scheduledEvents: DEFAULT_STUDIO_EVENTS,
  },
  setStudioRhythmConfig: (patch) =>
    set((state) => ({
      studioRhythmConfig: {
        ...state.studioRhythmConfig,
        ...patch,
      },
    })),
  addStudioRhythmEvent: (event) =>
    set((state) => ({
      studioRhythmConfig: {
        ...state.studioRhythmConfig,
        scheduledEvents: [
          ...state.studioRhythmConfig.scheduledEvents,
          { ...event, id: `rhythm-event-${Date.now()}` },
        ],
      },
    })),
  removeStudioRhythmEvent: (id) =>
    set((state) => ({
      studioRhythmConfig: {
        ...state.studioRhythmConfig,
        scheduledEvents: state.studioRhythmConfig.scheduledEvents.filter((event) => event.id !== id),
      },
    })),
  updateStudioRhythmEvent: (id, patch) =>
    set((state) => ({
      studioRhythmConfig: {
        ...state.studioRhythmConfig,
        scheduledEvents: state.studioRhythmConfig.scheduledEvents.map((event) =>
          event.id === id ? { ...event, ...patch } : event
        ),
      },
    })),
  toggleStudioRhythmGoal: (id) =>
    set((state) => ({
      studioRhythmConfig: {
        ...state.studioRhythmConfig,
        weeklyGoals: state.studioRhythmConfig.weeklyGoals.map((goal) =>
          goal.id === id ? { ...goal, active: !goal.active } : goal
        ),
      },
    })),
  setStudioRhythmGoalTarget: (id, targetCount) =>
    set((state) => ({
      studioRhythmConfig: {
        ...state.studioRhythmConfig,
        weeklyGoals: state.studioRhythmConfig.weeklyGoals.map((goal) =>
          goal.id === id ? { ...goal, targetCount } : goal
        ),
      },
    })),
  dailyMissionCompletion: {},
  toggleDailyMissionCompletion: (dateKey, missionType) =>
    set((state) => {
      const existing = state.dailyMissionCompletion[dateKey] ?? [];
      const hasMission = existing.includes(missionType);
      const nextForDate = hasMission
        ? existing.filter((type) => type !== missionType)
        : [...existing, missionType];

      return {
        dailyMissionCompletion: {
          ...state.dailyMissionCompletion,
          [dateKey]: nextForDate,
        },
      };
    }),

  // ── Tasks ─────────────────────────────────────────────────────
  tasks: [
    { title: 'Wheel practice: 3 cylinders', time: '1 hr', type: 'practice', status: 'pending' },
    { title: 'Time to reclaim clay', time: '30 min', type: 'chore', status: 'completed' },
    { title: 'Clean bottoms before kiln', time: '15 min', type: 'checklist', status: 'completed' },
  ],
  toggleTask: (index) =>
    set((state) => ({
      tasks: state.tasks.map((t, i) =>
        i === index ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
      ),
    })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  // ── Pieces ────────────────────────────────────────────────────
  pieces: INITIAL_PIECES,
  addPieces: (newPieces) => {
    set((state) => ({ pieces: [...newPieces, ...state.pieces] }));
    get().enqueueSyncOp({ type: 'addPieces', payload: newPieces });
  },
  updatePiece: (piece) => {
    set((state) => ({ pieces: state.pieces.map((p) => (p.id === piece.id ? piece : p)) }));
    get().enqueueSyncOp({ type: 'updatePiece', payload: piece });
  },
  deletePiece: (id) => {
    set((state) => ({ pieces: state.pieces.filter((p) => p.id !== id) }));
    get().enqueueSyncOp({ type: 'deletePiece', payload: id });
  },
  duplicatePiece: (piece) => {
    const now = new Date().toISOString();
    const newPiece = {
      ...piece,
      id: Date.now(),
      name: `${piece.name} (copy)`,
      createdAt: now,
      timeline: [{ stage: piece.stage, timestamp: now }],
      batchId: undefined,
      batchSize: undefined,
    };
    set((state) => ({ pieces: [newPiece, ...state.pieces] }));
    get().enqueueSyncOp({ type: 'duplicatePiece', payload: newPiece });
  },
  duplicateBatch: (batchId) => {
    const batch = get().pieces.filter((p) => p.batchId === batchId);
    if (!batch.length) return;
    const now = new Date().toISOString();
    const newBatchId = `batch-${Date.now()}`;
    const newPieces = batch.map((p, i) => ({
      ...p,
      id: Date.now() + i + 1,
      createdAt: now,
      timeline: [{ stage: p.stage, timestamp: now }],
      batchId: newBatchId,
    }));
    set((state) => ({ pieces: [...newPieces, ...state.pieces] }));
    get().enqueueSyncOp({ type: 'duplicateBatch', payload: { batchId, newPieces } });
  },
  updateJournalEntry: (pieceId, entryIndex, patch) => {
    set((state) => ({
      pieces: state.pieces.map((p) => {
        if (p.id !== pieceId) return p;
        return {
          ...p,
          timeline: p.timeline.map((entry, i) => (i === entryIndex ? { ...entry, ...patch } : entry)),
        };
      }),
    }));
    get().enqueueSyncOp({ type: 'updateJournalEntry', payload: { pieceId, entryIndex, patch } });
  },
  advancePiece: (pieceId) => {
    const timestamp = new Date().toISOString();
    set((state) => ({
      pieces: state.pieces.map((p) => {
        if (p.id !== pieceId) return p;
        const next = getConfiguredNextStage(p.stage, state.stageConfig);
        if (!next) return p;
        return { ...p, stage: next, timeline: [...p.timeline, { stage: next, timestamp }] };
      }),
    }));
    get().enqueueSyncOp({ type: 'advancePiece', payload: pieceId });
  },
  advancePieceIds: (ids) => {
    const idSet = new Set(ids);
    const timestamp = new Date().toISOString();
    set((state) => ({
      pieces: state.pieces.map((p) => {
        if (!idSet.has(p.id)) return p;
        const next = getConfiguredNextStage(p.stage, state.stageConfig);
        if (!next) return p;
        return { ...p, stage: next, timeline: [...p.timeline, { stage: next, timestamp }] };
      }),
    }));
    get().enqueueSyncOp({ type: 'advancePieceIds', payload: ids });
  },
  advanceBatch: (batchId, fromStage) => {
    const timestamp = new Date().toISOString();
    set((state) => ({
      pieces: state.pieces.map((p) => {
        if (p.batchId !== batchId || p.stage !== fromStage) return p;
        const next = getConfiguredNextStage(p.stage, state.stageConfig);
        if (!next) return p;
        return { ...p, stage: next, timeline: [...p.timeline, { stage: next, timestamp }] };
      }),
    }));
    get().enqueueSyncOp({ type: 'advanceBatch', payload: { batchId, fromStage } });
  },
  sendToCemetery: (pieceId, memorial) => {
    const timestamp = new Date().toISOString();
    set((state) => ({
      pieces: state.pieces.map((p) =>
        p.id !== pieceId
          ? p
          : {
              ...p,
              stage: 'cemetery',
              epitaph: memorial?.epitaph,
              causeOfDeath: memorial?.causeOfDeath,
              timeline: [...p.timeline, { stage: 'cemetery', timestamp }],
            }
      ),
    }));
    get().enqueueSyncOp({
      type: 'sendToCemetery',
      payload: { pieceId, epitaph: memorial?.epitaph, causeOfDeath: memorial?.causeOfDeath },
    });
  },

  // ── Stage Configuration ───────────────────────────────────────
  stageConfig: buildDefaultStages(),
  toggleStage: (id) => {
    if (id === CEMETERY_ID) return;
    set((state) => ({
      stageConfig: state.stageConfig.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    }));
  },
  renameStage: (id, label) =>
    set((state) => ({
      stageConfig: state.stageConfig.map((s) =>
        s.id === id ? { ...s, label: label.trim() || s.defaultLabel } : s
      ),
    })),
  addStage: (label) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = `custom-${Date.now()}`;
    set((state) => {
      const cemeteryIdx = state.stageConfig.findIndex((s) => s.id === CEMETERY_ID);
      const insertAt = cemeteryIdx === -1 ? state.stageConfig.length : cemeteryIdx;
      const next = [...state.stageConfig];
      next.splice(insertAt, 0, { id, label: trimmed, defaultLabel: trimmed, enabled: true, isCustom: true, iconKey: 'sparkles' });
      return { stageConfig: next };
    });
  },
  removeStage: (id) => {
    if (id === CEMETERY_ID) return;
    set((state) => ({ stageConfig: state.stageConfig.filter((s) => s.id !== id) }));
  },
  changeStageIcon: (id, iconKey) =>
    set((state) => ({
      stageConfig: state.stageConfig.map((s) => (s.id === id ? { ...s, iconKey } : s)),
    })),
  moveStageUp: (id) => {
    if (id === CEMETERY_ID) return;
    set((state) => {
      const idx = state.stageConfig.findIndex((s) => s.id === id);
      if (idx <= 0) return state;
      const next = [...state.stageConfig];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return { stageConfig: next };
    });
  },
  moveStageDown: (id) => {
    if (id === CEMETERY_ID) return;
    set((state) => {
      const idx = state.stageConfig.findIndex((s) => s.id === id);
      const cemeteryIdx = state.stageConfig.findIndex((s) => s.id === CEMETERY_ID);
      const limit = cemeteryIdx === -1 ? state.stageConfig.length - 1 : cemeteryIdx - 1;
      if (idx === -1 || idx >= limit) return state;
      const next = [...state.stageConfig];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return { stageConfig: next };
    });
  },
  resetStagesToDefaults: () => set({ stageConfig: buildDefaultStages() }),

  // ── Clay Bodies ───────────────────────────────────────────────
  clayBodies: DEFAULT_CLAY_BODIES,
  defaultClayBodyId: 'stoneware',
  addClayBody: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `clay-${Date.now()}`;
    set((state) => ({ clayBodies: [...state.clayBodies, { id, name: trimmed }] }));
  },
  removeClayBody: (id) =>
    set((state) => ({
      clayBodies: state.clayBodies.filter((c) => c.id !== id),
      defaultClayBodyId: state.defaultClayBodyId === id ? null : state.defaultClayBodyId,
    })),
  renameClayBody: (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => ({
      clayBodies: state.clayBodies.map((c) => (c.id === id ? { ...c, name: trimmed } : c)),
    }));
  },
  setDefaultClayBody: (id) => set({ defaultClayBodyId: id }),

  // ── Forming Methods ───────────────────────────────────────────
  formingMethods: DEFAULT_FORMING_METHODS,
  addFormingMethod: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `forming-${Date.now()}`;
    set((state) => ({ formingMethods: [...state.formingMethods, { id, name: trimmed }] }));
  },
  removeFormingMethod: (id) =>
    set((state) => ({ formingMethods: state.formingMethods.filter((m) => m.id !== id) })),
  renameFormingMethod: (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => ({
      formingMethods: state.formingMethods.map((m) => (m.id === id ? { ...m, name: trimmed } : m)),
    }));
  },

  // ── Form Options ─────────────────────────────────────────────
  pieceFormOptions: DEFAULT_PIECE_FORM_OPTIONS,
  addPieceFormOption: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `form-${Date.now()}`;
    set((state) => ({ pieceFormOptions: [...state.pieceFormOptions, { id, name: trimmed }] }));
  },
  removePieceFormOption: (id) =>
    set((state) => ({ pieceFormOptions: state.pieceFormOptions.filter((f) => f.id !== id) })),
  renamePieceFormOption: (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => ({
      pieceFormOptions: state.pieceFormOptions.map((f) => (f.id === id ? { ...f, name: trimmed } : f)),
    }));
  },

  // ── Firing Defaults ─────────────────────────────────────────
  defaultBisqueTemp: 'Cone 06',
  setDefaultBisqueTemp: (cone) => set({ defaultBisqueTemp: cone }),
  defaultGlazeTemp: 'Cone 6',
  setDefaultGlazeTemp: (cone) => set({ defaultGlazeTemp: cone }),

  // ── Pricing Rules ───────────────────────────────────────────
  pricingSettings: buildDefaultPricingSettings(),
  pricingOnboardingCompleted: false,
  setPricingSettings: (patch) =>
    set((state) => ({
      pricingSettings: {
        ...state.pricingSettings,
        ...patch,
      },
    })),
  completePricingOnboarding: (userType) =>
    set((state) => ({
      pricingSettings: applyPricingUserTypePreset(state.pricingSettings, userType),
      pricingOnboardingCompleted: true,
    })),
  reopenPricingOnboarding: () => set({ pricingOnboardingCompleted: false }),
  setPricingTier: (mode, index, patch) =>
    set((state) => {
      const tierKey = mode === 'bisque' ? 'bisqueTiers' : 'bisqueGlazeTiers';
      const currentTiers = state.pricingSettings[tierKey];
      if (!currentTiers[index]) return state;

      const nextTiers = currentTiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, ...patch } : tier
      );

      return {
        pricingSettings: {
          ...state.pricingSettings,
          [tierKey]: nextTiers,
        },
      };
    }),
  resetPricingSettings: () => set({ pricingSettings: buildDefaultPricingSettings() }),

  // ── Glaze Library ───────────────────────────────────────────
  glazes: INITIAL_GLAZES,
  glazeTests: INITIAL_GLAZE_TESTS,
  addGlaze: (glaze) =>
    set((state) => ({
      glazes: [glaze, ...state.glazes],
    })),
  updateGlaze: (glaze) =>
    set((state) => ({
      glazes: state.glazes.map((item) => (item.id === glaze.id ? glaze : item)),
    })),
  deleteGlaze: (id) =>
    set((state) => ({
      glazes: state.glazes.filter((glaze) => glaze.id !== id),
      glazeTests: state.glazeTests.filter((test) => test.glazeId !== id),
    })),
  toggleFavoriteGlaze: (id) =>
    set((state) => ({
      glazes: state.glazes.map((glaze) => (
        glaze.id === id ? { ...glaze, favorite: !glaze.favorite } : glaze
      )),
    })),
  addGlazeTest: (test) =>
    set((state) => ({
      glazeTests: [test, ...state.glazeTests],
      glazes: state.glazes.map((glaze) => {
        if (glaze.id !== test.glazeId) return glaze;

        const clayBodiesUsed = glaze.clayBodiesUsed.includes(test.clayBody)
          ? glaze.clayBodiesUsed
          : [test.clayBody, ...glaze.clayBodiesUsed];
        const kilnLabel = test.kilnName || (test.kilnType ? `${test.kilnType[0].toUpperCase()}${test.kilnType.slice(1)} kiln` : 'Unknown kiln');
        const kilnTypesUsed = glaze.kilnTypesUsed.includes(kilnLabel)
          ? glaze.kilnTypesUsed
          : [kilnLabel, ...glaze.kilnTypesUsed];
        const conesTested = glaze.conesTested.includes(test.cone)
          ? glaze.conesTested
          : [test.cone, ...glaze.conesTested];

        return {
          ...glaze,
          lastTestedAt: test.firingDate,
          clayBodiesUsed,
          kilnTypesUsed,
          conesTested,
          testTilePhotoUris: test.photoUri ? [test.photoUri, ...glaze.testTilePhotoUris] : glaze.testTilePhotoUris,
        };
      }),
    })),
  deleteGlazeTest: (id) =>
    set((state) => ({
      glazeTests: state.glazeTests.filter((test) => test.id !== id),
    })),

  // ── Kilns ─────────────────────────────────────────────────────
  kilns: [],
  firings: [],
  kilnChecklist: DEFAULT_CHECKLIST,
  addKiln: (kiln) => set((state) => ({ kilns: [kiln, ...state.kilns] })),
  updateKiln: (kiln) =>
    set((state) => ({ kilns: state.kilns.map((k) => (k.id === kiln.id ? kiln : k)) })),
  deleteKiln: (id) =>
    set((state) => ({
      kilns: state.kilns.filter((k) => k.id !== id),
      firings: state.firings.filter((f) => f.kilnId !== id),
    })),
  addFiring: (firing) =>
    set((state) => {
      const nextPieceIds = Array.from(new Set(firing.pieceIds));
      const nextPieceIdSet = new Set(nextPieceIds);

      return {
        firings: [
          { ...firing, pieceIds: nextPieceIds },
          ...state.firings.map((existingFiring) => {
            if (existingFiring.state === 'completed') {
              return existingFiring;
            }

            const hasOverlap = existingFiring.pieceIds.some((pieceId) => nextPieceIdSet.has(pieceId));
            if (!hasOverlap) {
              return existingFiring;
            }

            return {
              ...existingFiring,
              pieceIds: existingFiring.pieceIds.filter((pieceId) => !nextPieceIdSet.has(pieceId)),
            };
          }),
        ],
      };
    }),
  updateFiring: (firing) =>
    set((state) => ({ firings: state.firings.map((f) => (f.id === firing.id ? firing : f)) })),
  deleteFiring: (id) =>
    set((state) => ({ firings: state.firings.filter((f) => f.id !== id) })),
  updateFiringState: (firingId, firingState) =>
    set((state) => ({
      firings: state.firings.map((f) => {
        if (f.id !== firingId) return f;
        const now = new Date().toISOString();
        return {
          ...f,
          state: firingState,
          startedAt: firingState === 'firing' && !f.startedAt ? now : f.startedAt,
        };
      }),
    })),
  assignPiecesToFiring: (firingId, pieceIds) =>
    set((state) => {
      const incomingPieceIdSet = new Set(pieceIds);

      return {
        firings: state.firings.map((firing) => {
          if (firing.id === firingId) {
            return { ...firing, pieceIds: Array.from(new Set([...firing.pieceIds, ...pieceIds])) };
          }

          if (firing.state === 'completed') {
            return firing;
          }

          const hasOverlap = firing.pieceIds.some((pieceId) => incomingPieceIdSet.has(pieceId));
          if (!hasOverlap) {
            return firing;
          }

          return {
            ...firing,
            pieceIds: firing.pieceIds.filter((pieceId) => !incomingPieceIdSet.has(pieceId)),
          };
        }),
      };
    }),
  completeFiring: (firingId, result, resultNotes) => {
    const state = get();
    const firing = state.firings.find((f) => f.id === firingId);
    if (!firing) return;
    const now = new Date().toISOString();
    // Auto-advance assigned pieces to the appropriate next stage
    const targetStage = FIRING_TARGET_STAGE[firing.type];
    if (targetStage && firing.pieceIds.length > 0) {
      const idSet = new Set(firing.pieceIds);
      set((s) => ({
        pieces: s.pieces.map((p) => {
          if (!idSet.has(p.id)) return p;
          return { ...p, stage: targetStage, timeline: [...p.timeline, { stage: targetStage, timestamp: now }] };
        }),
      }));
    }
    set((s) => ({
      firings: s.firings.map((f) =>
        f.id !== firingId
          ? f
          : { ...f, state: 'completed', completedAt: now, result, resultNotes }
      ),
    }));
  },
  toggleKilnChecklistItem: (id) =>
    set((state) => ({
      kilnChecklist: state.kilnChecklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    })),
  addKilnChecklistItem: (text) =>
    set((state) => ({
      kilnChecklist: [
        ...state.kilnChecklist,
        { id: `c-${Date.now()}`, text, checked: false },
      ],
    })),
  removeKilnChecklistItem: (id) =>
    set((state) => ({
      kilnChecklist: state.kilnChecklist.filter((item) => item.id !== id),
    })),

  // ── Offline / Sync ────────────────────────────────────────────
  pendingSyncOps: [],
  isSyncing: false,
  lastSyncedAt: null,
  enqueueSyncOp: (op) =>
    set((state) => ({
      pendingSyncOps: [
        ...state.pendingSyncOps,
        {
          ...op,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: new Date().toISOString(),
        },
      ],
    })),
  clearSyncQueue: () => set({ pendingSyncOps: [] }),
  setIsSyncing: (v) => set({ isSyncing: v }),
  setLastSyncedAt: (ts) => set({ lastSyncedAt: ts }),
    }),
    {
      name: 'pottery-life-store',
      version: 2,
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState;
        }

        const state = persistedState as Partial<AppState> & {
          onboardingProfile?: Partial<OnboardingProfile>;
        };

        const onboardingProfile = normalizeOnboardingProfile(state.onboardingProfile);
        const enabledModules = normalizeModuleList(state.enabledModules);

        return {
          ...state,
          onboardingProfile,
          enabledModules: enabledModules.length > 0 ? enabledModules : onboardingProfile.activeModules,
        };
      },
      merge: (persistedState, currentState) => {
        const state = (persistedState ?? {}) as Partial<AppState> & {
          onboardingProfile?: Partial<OnboardingProfile>;
        };
        const onboardingProfile = normalizeOnboardingProfile(state.onboardingProfile);
        const enabledModules = normalizeModuleList(state.enabledModules);

        return {
          ...currentState,
          ...state,
          onboardingProfile,
          enabledModules: enabledModules.length > 0 ? enabledModules : onboardingProfile.activeModules,
        };
      },
      storage: zustandStorage,
      // Exclude runtime-only fields from persisted state
      partialize: (state) => ({
        generalOnboardingCompleted: state.generalOnboardingCompleted,
        onboardingProfile: state.onboardingProfile,
        practiceMode: state.practiceMode,
        role: state.role,
        enabledModules: state.enabledModules,
        user: state.user,
        kilnkinCompanion: state.kilnkinCompanion,
        studioRhythmConfig: state.studioRhythmConfig,
        dailyMissionCompletion: state.dailyMissionCompletion,
        tasks: state.tasks,
        pieces: state.pieces,
        stageConfig: state.stageConfig,
        kilns: state.kilns,
        firings: state.firings,
        kilnChecklist: state.kilnChecklist,
        pricingSettings: state.pricingSettings,
        pricingOnboardingCompleted: state.pricingOnboardingCompleted,
        glazes: state.glazes,
        glazeTests: state.glazeTests,
        pendingSyncOps: state.pendingSyncOps,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
