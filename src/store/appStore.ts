import { create } from 'zustand';
import { INITIAL_PIECES, STAGES, nextStage } from '../screens/pieces/constants';
import type { Piece } from '../screens/pieces/types';

export type PracticeMode = 'home' | 'studio' | 'both';
export type UserRole = 'owner' | 'member';

export interface StageConfig {
  id: string;
  label: string;
  defaultLabel: string;
  enabled: boolean;
  isCustom?: boolean;
  iconKey?: string;
}

export type Task = {
  title: string;
  time: string;
  type: string;
  status: 'pending' | 'completed';
};

export const CEMETERY_ID = 'cemetery';

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
  practiceMode: PracticeMode;
  role: UserRole;
  enabledModules: string[];
  setPracticeMode: (mode: PracticeMode) => void;
  setRole: (role: UserRole) => void;
  setEnabledModules: (modules: string[]) => void;
  toggleModule: (module: string) => void;
  isModuleEnabled: (module: string) => boolean;

  // ── User ──────────────────────────────────────────────────────
  user: { name: string; avatarInitial: string };
  setUser: (patch: Partial<{ name: string; avatarInitial: string }>) => void;

  // ── Tasks (Today's Routine) ───────────────────────────────────
  tasks: Task[];
  toggleTask: (index: number) => void;
  addTask: (task: Task) => void;

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
  sendToCemetery: (pieceId: number) => void;

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
}

export const useAppStore = create<AppState>((set, get) => ({
  // ── App settings ──────────────────────────────────────────────
  practiceMode: 'both',
  role: 'owner',
  enabledModules: ['overview', 'pieces', 'kiln', 'journal', 'community'],

  setPracticeMode: (mode) => set({ practiceMode: mode }),
  setRole: (role) => set({ role }),
  setEnabledModules: (modules) => set({ enabledModules: modules }),
  toggleModule: (module) =>
    set((state) => ({
      enabledModules: state.enabledModules.includes(module)
        ? state.enabledModules.filter((m) => m !== module)
        : [...state.enabledModules, module],
    })),
  isModuleEnabled: (module) => get().enabledModules.includes(module),

  // ── User ──────────────────────────────────────────────────────
  user: { name: 'Susan', avatarInitial: 'S' },
  setUser: (patch) => set((state) => ({ user: { ...state.user, ...patch } })),

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
  addPieces: (newPieces) =>
    set((state) => ({ pieces: [...newPieces, ...state.pieces] })),
  updatePiece: (piece) =>
    set((state) => ({ pieces: state.pieces.map((p) => (p.id === piece.id ? piece : p)) })),
  deletePiece: (id) =>
    set((state) => ({ pieces: state.pieces.filter((p) => p.id !== id) })),
  duplicatePiece: (piece) => {
    const now = new Date().toISOString();
    set((state) => ({
      pieces: [
        {
          ...piece,
          id: Date.now(),
          name: `${piece.name} (copy)`,
          createdAt: now,
          timeline: [{ stage: piece.stage, timestamp: now }],
          batchId: undefined,
          batchSize: undefined,
        },
        ...state.pieces,
      ],
    }));
  },
  duplicateBatch: (batchId) => {
    const batch = get().pieces.filter((p) => p.batchId === batchId);
    if (!batch.length) return;
    const now = new Date().toISOString();
    const newBatchId = `batch-${Date.now()}`;
    set((state) => ({
      pieces: [
        ...batch.map((p, i) => ({
          ...p,
          id: Date.now() + i + 1,
          createdAt: now,
          timeline: [{ stage: p.stage, timestamp: now }],
          batchId: newBatchId,
        })),
        ...state.pieces,
      ],
    }));
  },
  updateJournalEntry: (pieceId, entryIndex, patch) =>
    set((state) => ({
      pieces: state.pieces.map((p) => {
        if (p.id !== pieceId) return p;
        return {
          ...p,
          timeline: p.timeline.map((entry, i) => (i === entryIndex ? { ...entry, ...patch } : entry)),
        };
      }),
    })),
  advancePiece: (pieceId) => {
    const timestamp = new Date().toISOString();
    set((state) => ({
      pieces: state.pieces.map((p) => {
        if (p.id !== pieceId) return p;
        const next = nextStage(p.stage);
        if (!next) return p;
        return { ...p, stage: next, timeline: [...p.timeline, { stage: next, timestamp }] };
      }),
    }));
  },
  advancePieceIds: (ids) => {
    const idSet = new Set(ids);
    const timestamp = new Date().toISOString();
    set((state) => ({
      pieces: state.pieces.map((p) => {
        if (!idSet.has(p.id)) return p;
        const next = nextStage(p.stage);
        if (!next) return p;
        return { ...p, stage: next, timeline: [...p.timeline, { stage: next, timestamp }] };
      }),
    }));
  },
  advanceBatch: (batchId, fromStage) => {
    const timestamp = new Date().toISOString();
    set((state) => ({
      pieces: state.pieces.map((p) => {
        if (p.batchId !== batchId || p.stage !== fromStage) return p;
        const next = nextStage(p.stage);
        if (!next) return p;
        return { ...p, stage: next, timeline: [...p.timeline, { stage: next, timestamp }] };
      }),
    }));
  },
  sendToCemetery: (pieceId) => {
    const timestamp = new Date().toISOString();
    set((state) => ({
      pieces: state.pieces.map((p) =>
        p.id !== pieceId
          ? p
          : { ...p, stage: 'cemetery', timeline: [...p.timeline, { stage: 'cemetery', timestamp }] }
      ),
    }));
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
}));
