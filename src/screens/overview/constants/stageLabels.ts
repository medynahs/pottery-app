export const STAGE_LABELS: Record<string, string> = {
  idea: 'Idea',
  forming: 'Forming',
  'leather-hard': 'Leather Hard',
  trimming: 'Trimming',
  drying: 'Drying',
  'bone-dry': 'Bone Dry',
  bisque: 'Bisque',
  glazing: 'Glazing',
  'glaze-fired': 'Glaze Fired',
  finished: 'Finished',
  cemetery: 'Retired',
};

export const STAGE_BADGE_COLORS: Record<string, { dot: string; text: string }> = {
  idea:          { dot: 'hsl(270 45% 52%)', text: 'hsl(270 40% 38%)' },
  forming:       { dot: 'hsl(24 60% 50%)',  text: 'hsl(24 55% 36%)' },
  'leather-hard':{ dot: 'hsl(30 55% 48%)',  text: 'hsl(30 50% 34%)' },
  trimming:      { dot: 'hsl(35 55% 48%)',  text: 'hsl(35 50% 34%)' },
  drying:        { dot: 'hsl(210 50% 52%)', text: 'hsl(210 45% 36%)' },
  'bone-dry':    { dot: 'hsl(210 45% 50%)', text: 'hsl(210 40% 34%)' },
  bisque:        { dot: 'hsl(16 55% 50%)',  text: 'hsl(16 50% 36%)' },
  glazing:       { dot: 'hsl(130 42% 46%)', text: 'hsl(130 40% 32%)' },
  'glaze-fired': { dot: 'hsl(44 60% 46%)',  text: 'hsl(44 55% 32%)' },
  finished:      { dot: 'hsl(130 45% 42%)', text: 'hsl(130 42% 28%)' },
  cemetery:      { dot: 'hsl(0 30% 52%)',   text: 'hsl(0 25% 38%)' },
};
