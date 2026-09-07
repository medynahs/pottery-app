import { CEMETERY_ID, useAppStore, type StageConfig } from '@/src/store/appStore';
import React from 'react';

export { CEMETERY_ID };
export type { StageConfig };

export function StageConfigProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export function useStageConfig() {
  const _rawStageConfig = useAppStore((s) => s.stageConfig);
  const stageConfig = React.useMemo(() => _rawStageConfig ?? [], [_rawStageConfig]);
  const toggleStage = useAppStore((s) => s.toggleStage);
  const renameStage = useAppStore((s) => s.renameStage);
  const addStage = useAppStore((s) => s.addStage);
  const removeStage = useAppStore((s) => s.removeStage);
  const changeStageIcon = useAppStore((s) => s.changeStageIcon);
  const moveUp = useAppStore((s) => s.moveStageUp);
  const moveDown = useAppStore((s) => s.moveStageDown);
  const resetToDefaults = useAppStore((s) => s.resetStagesToDefaults);

  const enabledStages = React.useMemo(() => stageConfig.filter((s) => s.enabled), [stageConfig]);

  return {
    stages: stageConfig,
    enabledStages,
    toggleStage,
    renameStage,
    addStage,
    removeStage,
    changeStageIcon,
    moveUp,
    moveDown,
    resetToDefaults,
  };
}
