type StageLike = {
  id: string;
  enabled: boolean;
};

export const CEMETERY_STAGE_ID = 'cemetery';
export const FIRING_STAGE_IDS = new Set(['bisque', 'glaze-fired']);
export const FINISHED_STAGE_ID = 'finished';

export function getConfiguredNextStage(currentStage: string, stages: StageLike[]): string | null {
  const currentIndex = stages.findIndex((stage) => stage.id === currentStage);
  if (currentIndex === -1) return null;

  for (let index = currentIndex + 1; index < stages.length; index += 1) {
    const candidate = stages[index];
    if (!candidate) continue;
    if (!candidate.enabled) continue;
    if (candidate.id === CEMETERY_STAGE_ID) continue;
    return candidate.id;
  }

  return null;
}

export function getAdvanceOrder(stages: StageLike[]): string[] {
  return stages
    .filter((stage) => stage.enabled && stage.id !== CEMETERY_STAGE_ID)
    .map((stage) => stage.id);
}
