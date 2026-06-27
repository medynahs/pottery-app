export type CommunitySeedTip = {
  id: string;
  title: string;
  body: string;
};

export const POTTERY_NOOK_SEED_TIPS: CommunitySeedTip[] = [
  {
    id: 'share-journal',
    title: 'Share from your piece journal',
    body: 'Open any piece → share to community. Your caption and latest photo are pre-filled — one tap to post.',
  },
  {
    id: 'ask-text',
    title: 'Ask the community',
    body: 'Post a question in the caption — glaze help, firing tips, or whatever you are working through.',
  },
  {
    id: 'challenge-tag',
    title: 'Join the monthly challenge',
    body: 'Open the Challenges tab, join the theme, then submit a photo and note. Works in progress count.',
  },
  {
    id: 'discover-recipes',
    title: 'Starter recipes in Glaze Atlas',
    body: 'Browse curated recipes and layering combos in Discover, then save any recipe straight to My Atlas.',
  },
];
