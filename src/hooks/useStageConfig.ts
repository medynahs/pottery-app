import { STAGES } from '@/src/screens/pieces/constants';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface StageConfig {
  id: string;
  label: string;
  defaultLabel: string;
  enabled: boolean;
  isCustom?: boolean;
  iconKey?: string;
}

interface StageConfigContextType {
  stages: StageConfig[];
  enabledStages: StageConfig[];
  toggleStage: (id: string) => void;
  renameStage: (id: string, label: string) => void;
  addStage: (label: string) => void;
  removeStage: (id: string) => void;
  changeStageIcon: (id: string, iconKey: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  resetToDefaults: () => void;
}

// Cemetery is always last and always enabled — it cannot be toggled or reordered.
export const CEMETERY_ID = 'cemetery';

const buildDefaults = (): StageConfig[] =>
  STAGES.filter(s => s.id !== 'all').map(s => ({
    id: s.id,
    label: s.label,
    defaultLabel: s.label,
    enabled: true,
  }));

const StageConfigContext = createContext<StageConfigContextType | null>(null);

export function StageConfigProvider({ children }: { children: React.ReactNode }) {
  const [stages, setStages] = useState<StageConfig[]>(buildDefaults);

  const toggleStage = useCallback((id: string) => {
    if (id === CEMETERY_ID) return;
    setStages(prev => prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  }, []);

  const renameStage = useCallback((id: string, label: string) => {
    setStages(prev =>
      prev.map(s => (s.id === id ? { ...s, label: label.trim() || s.defaultLabel } : s)),
    );
  }, []);

  const moveUp = useCallback((id: string) => {
    if (id === CEMETERY_ID) return;
    setStages(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((id: string) => {
    if (id === CEMETERY_ID) return;
    setStages(prev => {
      const idx = prev.findIndex(s => s.id === id);
      const cemeteryIdx = prev.findIndex(s => s.id === CEMETERY_ID);
      // Don't allow moving into the cemetery's position
      const limit = cemeteryIdx === -1 ? prev.length - 1 : cemeteryIdx - 1;
      if (idx === -1 || idx >= limit) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const addStage = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = `custom-${Date.now()}`;
    setStages(prev => {
      const cemeteryIdx = prev.findIndex(s => s.id === CEMETERY_ID);
      const insertAt = cemeteryIdx === -1 ? prev.length : cemeteryIdx;
      const next = [...prev];
      next.splice(insertAt, 0, {
        id,
        label: trimmed,
        defaultLabel: trimmed,
        enabled: true,
        isCustom: true,
        iconKey: 'sparkles',
      });
      return next;
    });
  }, []);

  const removeStage = useCallback((id: string) => {
    if (id === CEMETERY_ID) return;
    setStages(prev => prev.filter(s => s.id !== id));
  }, []);

  const changeStageIcon = useCallback((id: string, iconKey: string) => {
    setStages(prev => prev.map(s => (s.id === id ? { ...s, iconKey } : s)));
  }, []);

  const resetToDefaults = useCallback(() => {
    setStages(buildDefaults());
  }, []);

  const enabledStages = useMemo(() => stages.filter(s => s.enabled), [stages]);

  const value = useMemo(
    () => ({ stages, enabledStages, toggleStage, renameStage, addStage, removeStage, changeStageIcon, moveUp, moveDown, resetToDefaults }),
    [stages, enabledStages, toggleStage, renameStage, addStage, removeStage, changeStageIcon, moveUp, moveDown, resetToDefaults],
  );

  return React.createElement(StageConfigContext.Provider, { value }, children);
}

export function useStageConfig() {
  const ctx = useContext(StageConfigContext);
  if (!ctx) throw new Error('useStageConfig must be used within StageConfigProvider');
  return ctx;
}
