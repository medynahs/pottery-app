import { ACTIVE_FESTIVAL } from '@/src/screens/community/data';
import { UNDERWATER_HERO_IMAGE } from '@/src/screens/community/utils/mockUnderwaterChallenge';
import type { MockChallengeEntry, MockHallOfFameCycle, MockHallOfFameWinner } from './challengeMockTypes';

export const MOCK_CHALLENGE_ID = 'mock-underwater-forms';

const IMG = {
  underwater: UNDERWATER_HERO_IMAGE,
  vase: require('../../../../assets/images/whimsyvase.png'),
  wheel: require('../../../../assets/images/pottery-wheel.png'),
  studio: require('../../../../assets/images/studio-scene.png'),
} as const;

export const MOCK_CHALLENGE_ENTRIES: MockChallengeEntry[] = [
  {
    id: 'entry-beginner-1',
    trackId: 'beginner',
    artistName: 'Mara L.',
    studioName: 'River Clay Studio',
    pieceTitle: 'Tide Pool Bowl',
    processNote:
      'Thrown from a wide cylinder and trimmed thin so the rim catches light like water. Soda-fired with a pale celadon.',
    imageSource: IMG.vase,
    baseVoteCount: 41,
  },
  {
    id: 'entry-beginner-2',
    trackId: 'beginner',
    artistName: 'Chen W.',
    studioName: 'East End Kiln',
    pieceTitle: 'Coral Cup',
    processNote: 'First successful pull after three wobbly attempts. Grogged stoneware, matte white glaze.',
    imageSource: IMG.wheel,
    baseVoteCount: 28,
  },
  {
    id: 'entry-beginner-3',
    trackId: 'beginner',
    artistName: 'Adele K.',
    studioName: 'Harbor Handworks',
    pieceTitle: 'Shell Dish',
    processNote: 'Pinch-built with a pressed texture from a scallop shell found on the beach.',
    imageSource: IMG.studio,
    baseVoteCount: 19,
  },
  {
    id: 'entry-intermediate-1',
    trackId: 'intermediate',
    artistName: 'Tariq B.',
    studioName: 'Iron Red Works',
    pieceTitle: 'Reef Vessel',
    processNote: 'Altered form with carved barnacle marks. Iron red liner, ash run on the exterior.',
    imageSource: IMG.underwater,
    baseVoteCount: 52,
  },
  {
    id: 'entry-intermediate-2',
    trackId: 'intermediate',
    artistName: 'Yuki R.',
    studioName: 'Quiet Kiln',
    pieceTitle: 'Moon Jelly Jar',
    processNote: 'Trimmed foot and tight lid fit. Shino over iron slip for a watery bloom.',
    imageSource: IMG.vase,
    baseVoteCount: 47,
  },
  {
    id: 'entry-intermediate-3',
    trackId: 'intermediate',
    artistName: 'Jonas P.',
    studioName: 'Coastal Forms',
    pieceTitle: 'Drift Bottle',
    processNote: 'Thrown in two parts and joined at leather hard. Sgraffito wave pattern.',
    imageSource: IMG.wheel,
    baseVoteCount: 33,
  },
  {
    id: 'entry-advanced-1',
    trackId: 'advanced',
    artistName: 'Elena V.',
    studioName: 'Deep Current',
    pieceTitle: 'Abyss Amphora',
    processNote: 'Large thrown form with hand-built kelp handles. Multiple firings for depth in the glaze.',
    imageSource: IMG.underwater,
    baseVoteCount: 61,
  },
  {
    id: 'entry-advanced-2',
    trackId: 'advanced',
    artistName: 'Marcus T.',
    studioName: 'Salt Line Studio',
    pieceTitle: 'Submarine Teapot',
    processNote: 'Functional teapot with underwater creature sprigs. Salt-fired shino.',
    imageSource: IMG.studio,
    baseVoteCount: 44,
  },
  {
    id: 'entry-advanced-3',
    trackId: 'advanced',
    artistName: 'Priya S.',
    studioName: 'Tidal Works',
    pieceTitle: 'Bioluminescent Vase',
    processNote: 'Porcelain with translucent glaze pools. Inspired by deep-sea light.',
    imageSource: IMG.vase,
    baseVoteCount: 38,
  },
];

const underwaterWinners: MockHallOfFameWinner[] = [
  {
    id: 'hof-underwater-beginner',
    challengeId: MOCK_CHALLENGE_ID,
    challengeTitle: ACTIVE_FESTIVAL.name,
    challengeDescription: ACTIVE_FESTIVAL.tagline,
    challengeLabel: 'Seasonal Challenge',
    challengeEmoji: ACTIVE_FESTIVAL.emoji,
    heroImage: IMG.underwater,
    trackId: 'beginner',
    trackTitle: 'Beginner Track',
    artistName: 'Mara L.',
    studioName: 'River Clay Studio',
    pieceTitle: 'Tide Pool Bowl',
    processNote:
      'Thrown from a wide cylinder and trimmed thin so the rim catches light like water. Soda-fired with a pale celadon.',
    imageSource: IMG.vase,
    voteCount: 48,
    wonAt: '2026-06-01',
  },
  {
    id: 'hof-underwater-intermediate',
    challengeId: MOCK_CHALLENGE_ID,
    challengeTitle: ACTIVE_FESTIVAL.name,
    challengeDescription: ACTIVE_FESTIVAL.tagline,
    challengeLabel: 'Seasonal Challenge',
    challengeEmoji: ACTIVE_FESTIVAL.emoji,
    heroImage: IMG.underwater,
    trackId: 'intermediate',
    trackTitle: 'Intermediate Track',
    artistName: 'Tariq B.',
    studioName: 'Iron Red Works',
    pieceTitle: 'Reef Vessel',
    processNote: 'Altered form with carved barnacle marks. Iron red liner, ash run on the exterior.',
    imageSource: IMG.underwater,
    voteCount: 57,
    wonAt: '2026-06-01',
  },
  {
    id: 'hof-underwater-advanced',
    challengeId: MOCK_CHALLENGE_ID,
    challengeTitle: ACTIVE_FESTIVAL.name,
    challengeDescription: ACTIVE_FESTIVAL.tagline,
    challengeLabel: 'Seasonal Challenge',
    challengeEmoji: ACTIVE_FESTIVAL.emoji,
    heroImage: IMG.underwater,
    trackId: 'advanced',
    trackTitle: 'Advanced Track',
    artistName: 'Elena V.',
    studioName: 'Deep Current',
    pieceTitle: 'Abyss Amphora',
    processNote: 'Large thrown form with hand-built kelp handles. Multiple firings for depth in the glaze.',
    imageSource: IMG.underwater,
    voteCount: 64,
    wonAt: '2026-06-01',
  },
];

export const MOCK_HALL_OF_FAME_CYCLES: MockHallOfFameCycle[] = [
  {
    challengeId: MOCK_CHALLENGE_ID,
    title: ACTIVE_FESTIVAL.name,
    label: 'Seasonal Challenge · Jun 2026',
    emoji: ACTIVE_FESTIVAL.emoji,
    closedAt: '2026-06-01',
    winners: underwaterWinners,
  },
  {
    challengeId: 'mock-humble-bowl',
    title: 'The Humble Bowl',
    label: 'Monthly Challenge · May 2026',
    emoji: '🥣',
    closedAt: '2026-05-01',
    winners: [
      {
        id: 'hof-bowl-beginner',
        challengeId: 'mock-humble-bowl',
        challengeTitle: 'The Humble Bowl',
        challengeDescription: 'Throw the most honest, beautiful bowl you can — form only, no handles.',
        challengeLabel: 'Monthly Challenge',
        challengeEmoji: '🥣',
        heroImage: IMG.wheel,
        trackId: 'beginner',
        trackTitle: 'Beginner Track',
        artistName: 'Chen W.',
        studioName: 'East End Kiln',
        pieceTitle: 'Morning Cereal Bowl',
        processNote: 'Simple form, soft rim, oatmeal glaze.',
        imageSource: IMG.wheel,
        voteCount: 39,
        wonAt: '2026-05-01',
      },
      {
        id: 'hof-bowl-intermediate',
        challengeId: 'mock-humble-bowl',
        challengeTitle: 'The Humble Bowl',
        challengeDescription: 'Throw the most honest, beautiful bowl you can — form only, no handles.',
        challengeLabel: 'Monthly Challenge',
        challengeEmoji: '🥣',
        heroImage: IMG.wheel,
        trackId: 'intermediate',
        trackTitle: 'Intermediate Track',
        artistName: 'Yuki R.',
        studioName: 'Quiet Kiln',
        pieceTitle: 'Quiet Rice Bowl',
        processNote: 'Foot trimmed to a whisper. Shino with iron brush marks.',
        imageSource: IMG.vase,
        voteCount: 44,
        wonAt: '2026-05-01',
      },
      {
        id: 'hof-bowl-advanced',
        challengeId: 'mock-humble-bowl',
        challengeTitle: 'The Humble Bowl',
        challengeDescription: 'Throw the most honest, beautiful bowl you can — form only, no handles.',
        challengeLabel: 'Monthly Challenge',
        challengeEmoji: '🥣',
        heroImage: IMG.wheel,
        trackId: 'advanced',
        trackTitle: 'Advanced Track',
        artistName: 'Marcus T.',
        studioName: 'Salt Line Studio',
        pieceTitle: 'Monk Bowl',
        processNote: 'Wide shoulder, knife-cut foot, wood-fired.',
        imageSource: IMG.studio,
        voteCount: 51,
        wonAt: '2026-05-01',
      },
    ],
  },
];

export function findMockWinner(winnerId: string): MockHallOfFameWinner | null {
  for (const cycle of MOCK_HALL_OF_FAME_CYCLES) {
    const winner = cycle.winners.find((w) => w.id === winnerId);
    if (winner) return winner;
  }
  return null;
}

export function findMockEntry(entryId: string): MockChallengeEntry | null {
  return MOCK_CHALLENGE_ENTRIES.find((e) => e.id === entryId) ?? null;
}

export function trackTitle(trackId: string): string {
  return ACTIVE_FESTIVAL.tracks.find((t) => t.id === trackId)?.title ?? trackId;
}
