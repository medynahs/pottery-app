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
    body: 'Glaze crawling? Kiln overfire? Text-only posts are welcome — other potters often answer faster than forums.',
  },
  {
    id: 'challenge-tag',
    title: 'Join the monthly challenge',
    body: 'Make on theme, then post with the challenge tag. You do not need a perfect piece — works in progress count.',
  },
  {
    id: 'discover-recipes',
    title: 'Starter recipes in Glaze Atlas',
    body: 'Browse nine curated recipes and six layering inspirations offline, then save any recipe straight to My Atlas.',
  },
];
