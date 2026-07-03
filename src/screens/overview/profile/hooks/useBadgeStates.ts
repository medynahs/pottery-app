import { useVisibleFirings, useVisibleGlazeTests, useVisibleGlazes, useVisibleKilns, useVisiblePieces, useAppStore } from '@/src/store/appStore';
import { useMemo } from 'react';
import {
  buildBadgeContext,
  computeBadgeStates,
  type BadgeContext,
  type BadgeState,
} from '../constants/badgeRegistry';

export function useBadgeContext(): BadgeContext {
  const pieces = useVisiblePieces();
  const firings = useVisibleFirings();
  const glazes = useVisibleGlazes();
  const glazeTests = useVisibleGlazeTests();
  const kilns = useVisibleKilns();
  const dailyMissionCompletion = useAppStore((s) => s.dailyMissionCompletion);
  const communityPostsCreated = useAppStore((s) => s.communityPostsCreated);
  const challengeEntriesSubmitted = useAppStore((s) => s.challengeEntriesSubmitted);
  const challengeWins = useAppStore((s) => s.challengeWins);
  const clayFriendsCount = useAppStore((s) => s.clayFriendsCount);

  return useMemo(
    () =>
      buildBadgeContext(pieces, firings, glazes, {
        glazeTests,
        kilns,
        dailyMissionCompletion,
        communityPostsCreated,
        challengeEntriesSubmitted,
        challengeWins,
        clayFriendsCount,
      }),
    [
      pieces,
      firings,
      glazes,
      glazeTests,
      kilns,
      dailyMissionCompletion,
      communityPostsCreated,
      challengeEntriesSubmitted,
      challengeWins,
      clayFriendsCount,
    ],
  );
}

export function useBadgeStates(): BadgeState[] {
  const ctx = useBadgeContext();
  return useMemo(() => computeBadgeStates(ctx), [ctx]);
}
