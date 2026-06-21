import type { SetupProgress } from '@/src/store/appStore';
import type { OnboardingUserType } from '@/src/types/user';
import { getSetupQuestByKey } from './setupQuestCatalog';

export type { SetupQuest, SetupQuestKey } from './setupQuestCatalog';

function shouldShowKilnSetupQuest(hasOwnKiln: boolean | null, userType: OnboardingUserType): boolean {
  if (hasOwnKiln === false) return false;
  if (hasOwnKiln === true) return true;
  return userType === 'home-potter' || userType === 'studio-owner-technician';
}

interface SetupQuestParams {
  kilnCount: number;
  studioRhythmConfigured: boolean;
  pieceCount: number;
  hasOwnKiln: boolean | null;
  userType: OnboardingUserType;
  setupProgress: SetupProgress;
  pricingOnboardingCompleted: boolean;
  glazeIds: string[];
}

export function generateSetupQuests({
  kilnCount,
  studioRhythmConfigured,
  pieceCount,
  hasOwnKiln,
  userType,
  setupProgress,
  pricingOnboardingCompleted,
  glazeIds,
}: SetupQuestParams) {
  const quests = [];
  const hasUserGlaze = glazeIds.length > 0;

  if (!setupProgress.textSizeReviewed) {
    quests.push(getSetupQuestByKey('set-text-size'));
  }

  if (!setupProgress.stagesReviewed) {
    quests.push(getSetupQuestByKey('customize-stages'));
  }

  if (!setupProgress.clayBodiesReviewed) {
    quests.push(getSetupQuestByKey('set-clay-bodies'));
  }

  if (!setupProgress.bisqueConeReviewed) {
    quests.push(getSetupQuestByKey('set-bisque-cone'));
  }

  if (!setupProgress.glazeConeReviewed) {
    quests.push(getSetupQuestByKey('set-glaze-cone'));
  }

  if (!pricingOnboardingCompleted) {
    quests.push(getSetupQuestByKey('set-pricing'));
  }

  if (!studioRhythmConfigured) {
    quests.push(getSetupQuestByKey('studio-rhythm'));
  }

  if (pieceCount === 0) {
    quests.push(getSetupQuestByKey('log-first-piece'));
  }

  if (shouldShowKilnSetupQuest(hasOwnKiln, userType) && kilnCount === 0) {
    quests.push(getSetupQuestByKey('add-kiln'));
  }

  if (!hasUserGlaze) {
    quests.push(getSetupQuestByKey('create-glaze-recipe'));
  }

  return quests;
}
