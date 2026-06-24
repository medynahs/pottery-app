/** Bundled poll shown when GET /polls returns empty. Votes are local-only until backend has active polls. */
export type DemoPollOption = {
  id: string;
  label: string;
  seedVotes: number;
};

export const COMMUNITY_DEMO_POLL = {
  id: 'demo-pottery-nook-poll',
  question: 'Which glaze family are you experimenting with this month?',
  options: [
    { id: 'demo-matte', label: 'Matte stoneware', seedVotes: 42 },
    { id: 'demo-celadon', label: 'Celadon & translucent', seedVotes: 38 },
    { id: 'demo-iron', label: 'Iron reds & tenmoku', seedVotes: 51 },
    { id: 'demo-soda', label: 'Soda / atmospheric', seedVotes: 29 },
  ] satisfies DemoPollOption[],
} as const;
