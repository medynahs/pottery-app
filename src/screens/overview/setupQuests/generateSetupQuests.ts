import type { SetupProgress } from '@/src/store/appStore';
import type { OnboardingUserType } from '@/src/types/user';

function shouldShowKilnSetupQuest(hasOwnKiln: boolean | null, userType: OnboardingUserType): boolean {
  if (hasOwnKiln === false) return false;
  if (hasOwnKiln === true) return true;
  return userType === 'home-potter' || userType === 'studio-owner-technician';
}

export type SetupQuestKey =
  | 'customize-stages'
  | 'set-clay-bodies'
  | 'set-bisque-cone'
  | 'set-glaze-cone'
  | 'set-pricing'
  | 'configure-modules'
  | 'studio-rhythm'
  | 'log-first-piece'
  | 'add-kiln'
  | 'create-glaze-recipe';

export interface SetupQuest {
  key: SetupQuestKey;
  title: string;
  text: string;
  route: string;
  actionLabel: string;
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
}: SetupQuestParams): SetupQuest[] {
  const quests: SetupQuest[] = [];
  const hasUserGlaze = glazeIds.length > 0;

  if (!setupProgress.stagesReviewed) {
    quests.push({
      key: 'customize-stages',
      title: 'Customize your stages',
      text: 'Enable, rename, and order the stages that match how you work.',
      route: '/stage-customization',
      actionLabel: 'Open Stages',
    });
  }

  if (!setupProgress.clayBodiesReviewed) {
    quests.push({
      key: 'set-clay-bodies',
      title: 'Set your clay bodies',
      text: 'Add the clays you actually use so pieces start with the right material.',
      route: '/clay-bodies',
      actionLabel: 'Add Clays',
    });
  }

  if (!setupProgress.bisqueConeReviewed) {
    quests.push({
      key: 'set-bisque-cone',
      title: 'Choose your bisque cone',
      text: 'Set the temperature you bisque fire to by default.',
      route: '/bisque-cone',
      actionLabel: 'Set Bisque',
    });
  }

  if (!setupProgress.glazeConeReviewed) {
    quests.push({
      key: 'set-glaze-cone',
      title: 'Choose your glaze cone',
      text: 'Set your default glaze firing temperature.',
      route: '/glaze-cone',
      actionLabel: 'Set Glaze',
    });
  }

  if (!pricingOnboardingCompleted) {
    quests.push({
      key: 'set-pricing',
      title: 'Set up pricing',
      text: 'Tell the app how you price work — helpful even if you only sell occasionally.',
      route: '/pricing-onboarding',
      actionLabel: 'Set Pricing',
    });
  }

  if (!setupProgress.modulesReviewed) {
    quests.push({
      key: 'configure-modules',
      title: 'Choose your active modules',
      text: 'Turn on only the tabs you need — Pieces, Kiln, Glaze Atlas, Community.',
      route: '/app-customization',
      actionLabel: 'Configure',
    });
  }

  if (!studioRhythmConfigured) {
    quests.push({
      key: 'studio-rhythm',
      title: 'Set your Studio Rhythm',
      text: 'Map which days you throw, trim, glaze, and fire.',
      route: '/profile/studio-rhythm',
      actionLabel: 'Set Rhythm',
    });
  }

  if (pieceCount === 0) {
    quests.push({
      key: 'log-first-piece',
      title: 'Create your first piece',
      text: 'Add a piece to begin tracking its journey from idea to finished form.',
      route: '/(tabs)/pieces',
      actionLabel: 'Add Piece',
    });
  }

  if (shouldShowKilnSetupQuest(hasOwnKiln, userType) && kilnCount === 0) {
    quests.push({
      key: 'add-kiln',
      title: 'Add your kiln',
      text: 'Register a kiln to start logging firings and tracking temperatures.',
      route: '/(tabs)/kiln',
      actionLabel: 'Add Kiln',
    });
  }

  if (!hasUserGlaze) {
    quests.push({
      key: 'create-glaze-recipe',
      title: 'Create a glaze recipe',
      text: 'Save your first glaze mix in Glaze Atlas.',
      route: '/(tabs)/library?action=add-glaze',
      actionLabel: 'Go to Glaze Atlas',
    });
  }

  return quests;
}
