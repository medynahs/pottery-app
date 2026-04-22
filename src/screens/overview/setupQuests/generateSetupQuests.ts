export type SetupQuestKey = 'studio-rhythm' | 'add-kiln' | 'pricing-profile' | 'log-first-piece';

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
  pricingOnboardingCompleted: boolean;
  pieceCount: number;
}

export function generateSetupQuests({
  kilnCount,
  studioRhythmConfigured,
  pricingOnboardingCompleted,
  pieceCount,
}: SetupQuestParams): SetupQuest[] {
  const quests: SetupQuest[] = [];

  if (!pricingOnboardingCompleted) {
    quests.push({
      key: 'pricing-profile',
      title: 'Set your pricing profile',
      text: 'Pick a starting point for how you price your work — you can refine it anytime.',
      route: '/pricing-onboarding',
      actionLabel: 'Set Profile',
    });
  }

  if (!studioRhythmConfigured) {
    quests.push({
      key: 'studio-rhythm',
      title: 'Set your Studio Rhythm',
      text: 'Map which days you throw, trim, glaze, and fire. Your daily quests will form around it.',
      route: '/profile/studio-rhythm',
      actionLabel: 'Set Rhythm',
    });
  }

  if (kilnCount === 0) {
    quests.push({
      key: 'add-kiln',
      title: 'Add your kiln',
      text: 'Register a kiln to start logging firings and keeping track of temperatures.',
      route: '/(tabs)/kiln',
      actionLabel: 'Add Kiln',
    });
  }

  if (pieceCount === 0) {
    quests.push({
      key: 'log-first-piece',
      title: 'Log your first piece',
      text: 'Add a piece to begin tracking its journey from wet clay to finished form.',
      route: '/(tabs)/pieces',
      actionLabel: 'Add Piece',
    });
  }

  return quests;
}
