import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SkeletonLeaderboardRow } from '@/src/components/Skeleton';
import { Text } from '@/src/components/ui/text';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import { ChallengeEntryCard } from '@/src/screens/community/components/challenge/ChallengeEntryCard';
import { ChallengeTrackTabs } from '@/src/screens/community/components/challenge/ChallengePhaseUI';
import { ACTIVE_FESTIVAL } from '@/src/screens/community/data';
import { useMockChallengeStore } from '@/src/screens/community/mock/mockChallengeStore';
import type { ChallengeEntryDisplay } from '@/src/screens/community/types';
import { resolveChallengePhase } from '@/src/screens/community/utils/challengePhase';
import {
  fallbackFestivalTrackTitle,
  resolveChallengeTracks,
  trackTitleFromChallenge,
} from '@/src/screens/community/utils/challengeTracks';
import { backendEntryToDisplay } from '@/src/screens/community/utils/challengeWinners';
import {
  isMockChallengeId,
  MOCK_UNDERWATER_CHALLENGE,
} from '@/src/screens/community/utils/mockUnderwaterChallenge';
import {
  apiGetChallenge,
  apiGetChallengeEntries,
  apiVoteChallengeEntry,
  challengeDisplayName,
  type BackendChallenge,
} from '@/src/services/challenges';
import { useAppStore } from '@/src/store';
import { trackChallengeVoteCast } from '@/src/utils/productAnalytics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChallengeGalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useAppStore((s) => s.showToast);
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const mock = useMockChallengeStore();
  const { challengeId: challengeIdParam } = useLocalSearchParams<{ challengeId?: string }>();

  const challengeId = challengeIdParam ?? (__DEV__ ? MOCK_UNDERWATER_CHALLENGE.id : '');
  const isMock = __DEV__ && Boolean(challengeId) && isMockChallengeId(challengeId);

  const [loading, setLoading] = useState(!isMock);
  const [error, setError] = useState<string | null>(null);
  const [apiTitle, setApiTitle] = useState<string | null>(null);
  const [apiPhase, setApiPhase] = useState<'open' | 'voting' | 'closed'>('open');
  const [apiEntries, setApiEntries] = useState<ChallengeEntryDisplay[]>([]);
  const [apiChallenge, setApiChallenge] = useState<BackendChallenge | null>(null);
  const [apiVotesByTrack, setApiVotesByTrack] = useState<Record<string, string>>({});
  const [activeTrackId, setActiveTrackId] = useState(ACTIVE_FESTIVAL.tracks[0]?.id ?? 'beginner');

  const phase = isMock ? mock.phase : apiPhase;
  const canVote = phase === 'voting';
  const title = isMock ? MOCK_UNDERWATER_CHALLENGE.title : apiTitle ?? 'Challenge gallery';

  const tracks = useMemo(() => {
    if (isMock) {
      return ACTIVE_FESTIVAL.tracks.map((t) => ({ id: t.id, title: t.title }));
    }
    return resolveChallengeTracks(apiChallenge).map((t) => ({ id: t.id, title: t.title }));
  }, [isMock, apiChallenge]);

  const mockEntries = useMemo(() => {
    return mock.getEntriesForTrack(activeTrackId).map((entry) => ({
      id: entry.id,
      trackId: entry.trackId,
      trackTitle: fallbackFestivalTrackTitle(entry.trackId),
      artistName: entry.artistName,
      studioName: entry.studioName,
      pieceTitle: entry.pieceTitle,
      processNote: entry.processNote,
      imageSource: entry.imageSource,
      baseVoteCount: entry.baseVoteCount,
      rank: entry.rank,
    }));
  }, [mock, activeTrackId]);

  const entries = isMock ? mockEntries : apiEntries;
  const votedEntryId = isMock
    ? mock.getVotedEntryId(activeTrackId)
    : apiVotesByTrack[activeTrackId] ?? null;

  const loadApiGallery = useCallback(async () => {
    if (!isSignedIn || isMock) {
      setLoading(false);
      return;
    }

    if (!challengeId) {
      setError('Challenge not found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const challenge = await apiGetChallenge(challengeId);
      setApiChallenge(challenge);
      setApiTitle(challengeDisplayName(challenge));
      setApiPhase(resolveChallengePhase(challenge));

      const challengeTracks = resolveChallengeTracks(challenge);
      const trackId = challengeTracks.some((t) => t.id === activeTrackId)
        ? activeTrackId
        : challengeTracks[0]?.id ?? activeTrackId;
      if (trackId !== activeTrackId) {
        setActiveTrackId(trackId);
      }

      const rawEntries = await apiGetChallengeEntries(challengeId, trackId);
      setApiEntries(
        rawEntries.map((entry) =>
          backendEntryToDisplay(
            entry,
            entry.track_id ? trackTitleFromChallenge(challenge, entry.track_id) : 'Submission',
          ),
        ),
      );

      const votes: Record<string, string> = {};
      for (const entry of rawEntries) {
        if (entry.my_vote && entry.track_id) {
          votes[entry.track_id] = entry.id;
        }
      }
      setApiVotesByTrack(votes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
      setApiEntries([]);
    } finally {
      setLoading(false);
    }
  }, [isMock, challengeId, activeTrackId, isSignedIn]);

  useEffect(() => {
    void loadApiGallery();
  }, [loadApiGallery]);

  const handleVote = async (entryId: string) => {
    if (!canVote) return;

    if (isMock) {
      const ok = mock.vote(activeTrackId, entryId);
      if (ok) {
        trackChallengeVoteCast({
          challenge_id: challengeId,
          track_id: activeTrackId,
          is_mock: true,
        });
      }
      showToast(ok ? 'Vote recorded' : 'Already your pick in this track', ok ? 'success' : 'error');
      return;
    }

    if (!isSignedIn) return;

    try {
      await apiVoteChallengeEntry(challengeId, entryId);
      trackChallengeVoteCast({
        challenge_id: challengeId,
        track_id: activeTrackId,
        is_mock: false,
      });
      setApiVotesByTrack((prev) => ({ ...prev, [activeTrackId]: entryId }));
      setApiEntries((prev) =>
        prev.map((entry) => {
          const wasVoted = apiVotesByTrack[activeTrackId] === entry.id;
          const isNowVoted = entry.id === entryId;
          let count = entry.baseVoteCount;
          if (wasVoted && !isNowVoted) count -= 1;
          if (!wasVoted && isNowVoted) count += 1;
          return { ...entry, baseVoteCount: Math.max(0, count) };
        }),
      );
      showToast('Vote recorded', 'success');
    } catch {
      showToast('Could not record vote', 'error');
    }
  };

  const getVoteCount = (entry: ChallengeEntryDisplay) => {
    if (isMock) return mock.getEntryVoteCount(entry.id, entry.baseVoteCount);
    return entry.baseVoteCount;
  };

  const subtitle =
    phase === 'voting'
      ? 'Pick your favourite in each track'
      : phase === 'closed'
        ? 'Final submissions'
        : 'Community submissions';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1" style={{ backgroundColor: COMMUNITY_THEME.pageBg, paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3 border-b" style={{ borderColor: COMMUNITY_THEME.cardBorder }}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full border mr-2"
            style={{ backgroundColor: COMMUNITY_THEME.accentSoft, borderColor: COMMUNITY_THEME.cardBorder }}
          >
            <ChevronLeft size={20} color={COMMUNITY_THEME.inkSoft} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-serif font-bold" style={{ color: COMMUNITY_THEME.ink }}>
              {title}
            </Text>
            <Text className="text-xs" style={{ color: COMMUNITY_THEME.inkMuted }}>
              {subtitle}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {loading ? (
            <View className="gap-2">
              {[0, 1, 2].map((i) => (
                <SkeletonLeaderboardRow key={i} />
              ))}
            </View>
          ) : error && !isMock ? (
            <InlineErrorCard message={error} onRetry={() => { void loadApiGallery(); }} />
          ) : (
            <>
              {canVote ? (
                <View
                  className="rounded-2xl border p-3 mb-4"
                  style={{ backgroundColor: COMMUNITY_THEME.accentSoft, borderColor: COMMUNITY_THEME.cardBorder }}
                >
                  <Text className="text-sm leading-relaxed" style={{ color: COMMUNITY_THEME.inkSoft }}>
                    One vote per track. Your picks choose the winners before they move to the Hall of Fame archive.
                  </Text>
                </View>
              ) : null}

              <ChallengeTrackTabs
                tracks={tracks}
                activeTrackId={activeTrackId}
                onChange={setActiveTrackId}
              />

              <View className="mt-4">
                {entries.length === 0 ? (
                  <Text className="text-sm text-center py-8" style={{ color: COMMUNITY_THEME.inkMuted }}>
                    No submissions in this track yet.
                  </Text>
                ) : (
                  entries.map((entry) => (
                    <ChallengeEntryCard
                      key={entry.id}
                      entry={entry}
                      voteCount={getVoteCount(entry)}
                      voted={votedEntryId === entry.id}
                      canVote={canVote}
                      onVote={() => { void handleVote(entry.id); }}
                    />
                  ))
                )}
              </View>

              {phase === 'closed' ? (
                <PrimaryButton
                  label="Back to challenge"
                  onPress={() => router.back()}
                />
              ) : null}
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}
