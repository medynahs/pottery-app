export type SetupQuestKey =
  | 'customize-stages'
  | 'set-text-size'
  | 'set-clay-bodies'
  | 'set-bisque-cone'
  | 'set-glaze-cone'
  | 'set-pricing'
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

export const SETUP_QUEST_CATALOG: Record<SetupQuestKey, Omit<SetupQuest, 'key'>> = {
  'customize-stages': {
    title: 'Customize your stages',
    text: 'Enable, rename, and order the stages that match how you work.',
    route: '/stage-customization',
    actionLabel: 'Open Stages',
  },
  'set-text-size': {
    title: 'Choose your text size',
    text: 'Pick a comfortable reading size for labels and body text.',
    route: '/text-size',
    actionLabel: 'Set Text Size',
  },
  'set-clay-bodies': {
    title: 'Set your clay bodies',
    text: 'Add the clays you actually use so pieces start with the right material.',
    route: '/clay-bodies',
    actionLabel: 'Add Clays',
  },
  'set-bisque-cone': {
    title: 'Choose your bisque cone',
    text: 'Set the temperature you bisque fire to by default.',
    route: '/bisque-cone',
    actionLabel: 'Set Bisque',
  },
  'set-glaze-cone': {
    title: 'Choose your glaze cone',
    text: 'Set your default glaze firing temperature.',
    route: '/glaze-cone',
    actionLabel: 'Set Glaze',
  },
  'set-pricing': {
    title: 'Set up pricing',
    text: 'Tell the app how you price work. Helpful even if you only sell occasionally.',
    route: '/pricing-onboarding',
    actionLabel: 'Set Pricing',
  },
  'studio-rhythm': {
    title: 'Set your Studio Rhythm',
    text: 'Map which days you throw, trim, glaze, and fire.',
    route: '/profile/studio-rhythm/schedule',
    actionLabel: 'Set Rhythm',
  },
  'log-first-piece': {
    title: 'Create your first piece',
    text: 'Add a piece to begin tracking its journey from idea to finished form.',
    route: '/(tabs)/pieces',
    actionLabel: 'Add Piece',
  },
  'add-kiln': {
    title: 'Add your kiln',
    text: 'Register a kiln to start logging firings and tracking temperatures.',
    route: '/(tabs)/kiln',
    actionLabel: 'Add Kiln',
  },
  'create-glaze-recipe': {
    title: 'Create a glaze recipe',
    text: 'Save your first glaze mix in Glaze Atlas.',
    route: '/(tabs)/library?action=add-glaze',
    actionLabel: 'Go to Glaze Atlas',
  },
};

export function getSetupQuestByKey(key: SetupQuestKey): SetupQuest {
  return { key, ...SETUP_QUEST_CATALOG[key] };
}
