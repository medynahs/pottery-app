// Exported as ChallengesTab, monthly challenge hub
import { InlineErrorCard } from '@/src/components/InlineErrorCard';
import { SkeletonLeaderboardRow } from '@/src/components/Skeleton';
import { ConfirmSheet } from '@/src/components/AppSheets';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import { ACTIVE_FESTIVAL } from '@/src/screens/community/data';
import { FestivalSignUpSheet } from '@/src/screens/community/components/FestivalSignUpSheet';
import { SubmitPieceSheet, type SubmitPiecePayload } from '@/src/screens/community/components/SubmitPieceSheet';
import {
  ChallengePhaseChip,
  ChallengePhaseDevBar,
} from '@/src/screens/community/components/challenge/ChallengePhaseUI';
import { HallOfFameWinnerCard } from '@/src/screens/community/components/challenge/HallOfFameWinnerCard';
import {
  challengeEntryId,
  challengeHasSubmitted,
  challengeIsJoined,
  pickPrimaryChallenge,
  toChallengeDisplay,
  type ChallengeDisplay,
} from '@/src/screens/community/utils/challengeDisplay';
import {
  getPhaseSubtitle,
  getPrimaryCtaLabel,
  getSecondaryCtaLabel,
  resolveChallengePhase,
} from '@/src/screens/community/utils/challengePhase';
import {
  backendWinnerToDisplay,
  mockWinnerToDisplay,
} from '@/src/screens/community/utils/challengeWinners';
import { buildPreviewChallengeDisplay } from '@/src/screens/community/utils/challengePreviewDisplay';
import { MOCK_UNDERWATER_CHALLENGE } from '@/src/screens/community/utils/mockUnderwaterChallenge';
import { useMockChallengeStore } from '@/src/screens/community/mock/mockChallengeStore';
import type { ChallengePhase } from '@/src/screens/community/types';
import type { ChallengeWinnerDisplay } from '@/src/screens/community/types';
import { buildCommunityPostMeta, embedCommunityPostMeta } from '@/src/screens/community/utils/communityPostPayload';
import { challengeHashtag } from '@/src/screens/community/utils/challengeTag';
import { cacheProfilePost } from '@/src/screens/overview/profile/utils/profilePostCache';
import {
  apiListChallenges,
  apiSubmitChallengeEntry,
  apiWithdrawChallengeEntry,
  type BackendChallenge,
} from '@/src/services/challenges';
import { apiCreatePost, hydrateCreatedPost } from '@/src/services/community';
import { CommunityUploadError, uploadPostPhotoAsset } from '@/src/services/communityUpload';
import { useAppStore } from '@/src/store';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  Share2,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: Sparkles,
    title: 'Join the theme',
    body: 'Each month brings a new form or technique to explore. Join to commit, no pressure until you are ready to share.',
  },
  {
    step: 2,
    icon: Flame,
    title: 'Make & document',
    body: 'Throw, trim, glaze, and fire on your own timeline. Snap progress photos in your piece journal as you go.',
  },
  {
    step: 3,
    icon: Share2,
    title: 'Submit to the feed',
    body: 'Post your finished piece with the challenge tag. When voting opens, the community picks winners for the Hall of Fame.',
  },
] as const;

function ChallengeStepRow({
  step,
  title,
  done,
  active,
  isLast,
}: {
  step: number;
  title: string;
  done: boolean;
  active: boolean;
  isLast: boolean;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center" style={{ width: 28 }}>
        {done ? (
          <CheckCircle2 size={22} color={COMMUNITY_THEME.stepDone} />
        ) : (
          <Circle
            size={22}
            color={active ? COMMUNITY_THEME.accent : COMMUNITY_THEME.stepPending}
            strokeWidth={active ? 2.5 : 1.5}
          />
        )}
        {!isLast ? (
          <View
            style={{
              width: 2,
              flex: 1,
              minHeight: 20,
              marginTop: 4,
              backgroundColor: done ? COMMUNITY_THEME.stepDone : COMMUNITY_THEME.stepPending,
            }}
          />
        ) : null}
      </View>
      <View className="flex-1 pb-4">
        <Text
          className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
          style={{ color: COMMUNITY_THEME.inkMuted }}
        >
          Step {step}
        </Text>
        <Text
          className="text-sm font-bold"
          style={{ color: done || active ? COMMUNITY_THEME.ink : COMMUNITY_THEME.inkMuted }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

function ChallengeHero({
  challenge,
  phase,
  phaseSubtitle,
  joined,
  hasSubmitted,
  enrolledTrackTitle,
  onPrimaryPress,
  onSecondaryPress,
  secondaryLabel,
  onLeavePress,
  onChangeTrackPress,
  loading,
  submitting,
  primaryLabel,
  previewMode = false,
}: {
  challenge: ChallengeDisplay;
  phase?: ChallengePhase;
  phaseSubtitle?: string;
  joined: boolean;
  hasSubmitted?: boolean;
  enrolledTrackTitle?: string | null;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  secondaryLabel?: string;
  onLeavePress: () => void;
  onChangeTrackPress?: () => void;
  loading: boolean;
  submitting: boolean;
  primaryLabel: string;
  previewMode?: boolean;
}) {
  const deadlineLabel =
    challenge.daysLeft === null
      ? 'Open deadline'
      : challenge.daysLeft === 0
        ? 'Last day'
        : `${challenge.daysLeft} day${challenge.daysLeft === 1 ? '' : 's'} left`;

  const gradient = challenge.gradientColors ?? COMMUNITY_THEME.challengeHero;

  return (
    <View
      className="rounded-3xl overflow-hidden border"
      style={{
        borderColor: COMMUNITY_THEME.cardBorder,
        shadowColor: COMMUNITY_THEME.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 4,
      }}
    >
      {challenge.heroImage ? (
        <Image
          source={challenge.heroImage}
          style={{ width: '100%', height: 200 }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : null}

      <LinearGradient
        colors={[...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: challenge.heroImage ? 18 : 22,
          paddingBottom: 24,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2 flex-1">
            {challenge.emoji ? (
              <Text style={{ fontSize: 22 }}>{challenge.emoji}</Text>
            ) : (
              <View
                className="w-8 h-8 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 247, 236, 0.18)' }}
              >
                <Trophy size={16} color={COMMUNITY_THEME.heroText} />
              </View>
            )}
            <Text
              className="text-xs font-bold uppercase tracking-widest flex-1"
              style={{ color: COMMUNITY_THEME.heroLabel }}
            >
              {challenge.label}
            </Text>
          </View>
          {challenge.isMock ? (
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: 'rgba(255, 247, 236, 0.2)' }}
            >
              <Text className="text-[10px] font-bold" style={{ color: COMMUNITY_THEME.heroText }}>
                Preview
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          className="text-2xl font-serif font-bold leading-tight"
          style={{ color: COMMUNITY_THEME.heroText }}
        >
          {challenge.title}
        </Text>
        <Text
          className="text-sm leading-relaxed mt-2"
          style={{ color: COMMUNITY_THEME.heroMuted }}
        >
          {challenge.description}
        </Text>

        <View className="flex-row flex-wrap gap-2 mt-4">
          {phase ? <ChallengePhaseChip phase={phase} subtitle={phaseSubtitle} /> : null}
          {!previewMode ? (
          <View
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              backgroundColor: COMMUNITY_THEME.heroChip,
              borderWidth: 1,
              borderColor: COMMUNITY_THEME.heroChipBorder,
            }}
          >
            <Users size={12} color={COMMUNITY_THEME.heroText} />
            <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.heroText }}>
              {challenge.participantCount} joined
            </Text>
          </View>
          ) : null}
          <View
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              backgroundColor: COMMUNITY_THEME.heroChip,
              borderWidth: 1,
              borderColor: COMMUNITY_THEME.heroChipBorder,
            }}
          >
            <Calendar size={12} color={COMMUNITY_THEME.heroText} />
            <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.heroText }}>
              {deadlineLabel}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View
        className="px-5 py-5"
        style={{ backgroundColor: COMMUNITY_THEME.cardBg }}
      >
        <Text
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: COMMUNITY_THEME.inkMuted }}
        >
          {previewMode ? 'This month' : 'Your progress'}
        </Text>

        {previewMode ? (
          <View className="mt-1">
            <Text className="text-xs leading-relaxed mb-3" style={{ color: COMMUNITY_THEME.inkSoft }}>
              Make on theme, share a photo on the feed with the challenge tag, and check back for voting once the live challenge hub is enabled.
            </Text>
            <PrimaryButton label={primaryLabel} onPress={onPrimaryPress} />
          </View>
        ) : (
          <>
        <ChallengeStepRow step={1} title="Join the challenge" done={joined} active={!joined} isLast={false} />
        <ChallengeStepRow
          step={2}
          title="Make your piece"
          done={joined && Boolean(hasSubmitted)}
          active={joined && !hasSubmitted}
          isLast={false}
        />
        <ChallengeStepRow
          step={3}
          title="Share on the feed"
          done={joined && Boolean(hasSubmitted)}
          active={false}
          isLast
        />

        {phase === 'voting' ? (
          <View className="mt-1">
            <Text className="text-xs leading-relaxed mb-3" style={{ color: COMMUNITY_THEME.inkSoft }}>
              Submissions are closed. Browse the gallery and vote for your favourite in each track.
            </Text>
            <PrimaryButton label={primaryLabel} onPress={onPrimaryPress} />
            {secondaryLabel && onSecondaryPress ? (
              <TouchableOpacity className="items-center mt-3 py-1" activeOpacity={0.7} onPress={onSecondaryPress}>
                <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.accent }}>
                  {secondaryLabel}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : phase === 'closed' ? (
          <View className="mt-1">
            <Text className="text-xs leading-relaxed mb-3" style={{ color: COMMUNITY_THEME.inkSoft }}>
              Winners are shown below for a few days before the next challenge begins.
            </Text>
            <PrimaryButton label={primaryLabel} onPress={onPrimaryPress} />
            {secondaryLabel && onSecondaryPress ? (
              <TouchableOpacity className="items-center mt-3 py-1" activeOpacity={0.7} onPress={onSecondaryPress}>
                <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.accent }}>
                  {secondaryLabel}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : joined ? (
          <View
            className="rounded-2xl p-4 mt-1 border"
            style={{
              backgroundColor: COMMUNITY_THEME.accentSoft,
              borderColor: COMMUNITY_THEME.cardBorder,
            }}
          >
            <View className="flex-row items-center gap-2 mb-1">
              <CheckCircle2 size={16} color={COMMUNITY_THEME.stepDone} />
              <Text className="text-sm font-bold" style={{ color: COMMUNITY_THEME.ink }}>
                You&apos;re in!
              </Text>
            </View>
            <Text className="text-xs leading-relaxed" style={{ color: COMMUNITY_THEME.inkSoft }}>
              {enrolledTrackTitle
                ? `${enrolledTrackTitle}, finish your piece, then submit a photo and note for the feed.`
                : 'Finish your piece, then submit a photo and note so it appears on the community feed.'}
            </Text>
            <View className="mt-3">
              <PrimaryButton
                label={primaryLabel}
                onPress={onPrimaryPress}
                loading={submitting}
                disabled={submitting}
              />
            </View>
            {secondaryLabel && onSecondaryPress ? (
              <TouchableOpacity className="items-center mt-2.5 py-1" activeOpacity={0.7} onPress={onSecondaryPress}>
                <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.accent }}>
                  {secondaryLabel}
                </Text>
              </TouchableOpacity>
            ) : null}
            {onChangeTrackPress ? (
              <TouchableOpacity
                className="items-center mt-2.5 py-1"
                activeOpacity={0.7}
                onPress={onChangeTrackPress}
              >
                <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.accent }}>
                  Change track
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              className="items-center mt-3 py-1"
              activeOpacity={0.7}
              onPress={onLeavePress}
            >
              <Text className="text-xs font-semibold" style={{ color: 'hsl(0 45% 52%)' }}>
                Leave challenge
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mt-1">
            <PrimaryButton
              label={primaryLabel}
              onPress={onPrimaryPress}
              loading={loading || submitting}
              disabled={loading || submitting}
            />
            {secondaryLabel && onSecondaryPress ? (
              <TouchableOpacity className="items-center mt-2.5 py-1" activeOpacity={0.7} onPress={onSecondaryPress}>
                <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.accent }}>
                  {secondaryLabel}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
          </>
        )}
      </View>
    </View>
  );
}

function MockTrackCards({
  enrolledTrackId,
}: {
  enrolledTrackId: string | null;
}) {
  return (
    <View className="gap-3">
      <Text
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: COMMUNITY_THEME.inkMuted }}
      >
        Festival tracks
      </Text>
      {ACTIVE_FESTIVAL.tracks.map((track) => {
        const isEnrolled = enrolledTrackId === track.id;
        return (
          <View
            key={track.id}
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: COMMUNITY_THEME.cardBg,
              borderColor: isEnrolled ? ACTIVE_FESTIVAL.accentColor : COMMUNITY_THEME.cardBorder,
            }}
          >
            <View className="flex-row items-start gap-3">
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center"
                style={{ backgroundColor: 'hsl(195 40% 92%)' }}
              >
                {isEnrolled ? (
                  <CheckCircle2 size={18} color={ACTIVE_FESTIVAL.accentColor} />
                ) : (
                  <Trophy size={16} color={ACTIVE_FESTIVAL.accentColor} />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-sm font-bold" style={{ color: COMMUNITY_THEME.ink }}>
                    {track.title}
                  </Text>
                  {isEnrolled ? (
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'hsl(195 35% 90%)' }}
                    >
                      <Text
                        className="text-[10px] font-bold"
                        style={{ color: ACTIVE_FESTIVAL.accentColor }}
                      >
                        Your track
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-xs leading-relaxed mt-1" style={{ color: COMMUNITY_THEME.inkSoft }}>
                  {track.summary}
                </Text>
                <Text className="text-xs font-medium mt-2" style={{ color: COMMUNITY_THEME.accent }}>
                  {track.participants} potters joined
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}


export function ChallengesTab({
  onBrowseHallOfFame,
  onEntrySubmitted,
  onShareChallengePost,
}: {
  onBrowseHallOfFame?: () => void;
  onEntrySubmitted?: (meta: { emoji: string; challengeName: string }) => void;
  onShareChallengePost?: () => void;
}) {
  const isSignedIn = useAppStore((s) => s.isSignedIn);

  const showToast = useAppStore((s) => s.showToast);
  const markPostCreated = useAppStore((s) => s.markPostCreated);
  const markChallengeEntrySubmitted = useAppStore((s) => s.markChallengeEntrySubmitted);
  const router = useRouter();
  const mock = useMockChallengeStore();

  const [challengeApi, setChallengeApi] = useState<BackendChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiEntryId, setApiEntryId] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const challenge = useMemo(() => {
    if (challengeApi) return toChallengeDisplay(challengeApi);
    if (__DEV__) {
      console.warn('[FestivalsTab] No active challenge from API — falling back to mock data');
      return MOCK_UNDERWATER_CHALLENGE;
    }
    return buildPreviewChallengeDisplay();
  }, [challengeApi]);
  const isPreviewOnly = !challengeApi && !__DEV__;
  const isMock = __DEV__ && !challengeApi;
  const phase: ChallengePhase = isMock ? mock.phase : resolveChallengePhase(challengeApi);
  const phaseSubtitle = isMock
    ? mock.getPhaseLabel().split(' · ')[1]
    : getPhaseSubtitle(challengeApi, phase);

  const joined = isMock
    ? mock.joinedTrackId !== null
    : challengeIsJoined(challengeApi) || apiEntryId !== null;
  const hasSubmitted = isMock ? mock.hasSubmitted : challengeHasSubmitted(challengeApi);

  const enrolledTrack = ACTIVE_FESTIVAL.tracks.find((t) =>
    t.id === (isMock ? mock.joinedTrackId : challengeApi?.track_id ?? null),
  ) ?? null;

  const winners: ChallengeWinnerDisplay[] = useMemo(() => {
    if (phase !== 'closed') return [];
    if (isMock) return mock.getClosedWinners().map(mockWinnerToDisplay);
    if (!challengeApi?.winners?.length) return [];
    return challengeApi.winners.map((w) =>
      backendWinnerToDisplay(w, {
        id: challengeApi.id,
        title: challengeApi.name,
        description: challengeApi.description,
      }),
    );
  }, [phase, isMock, mock, challengeApi]);

  const primaryLabel = isPreviewOnly
    ? 'Share with challenge tag'
    : isMock
      ? mock.getPrimaryCta()
      : getPrimaryCtaLabel(phase, joined, hasSubmitted);

  const secondaryLabel = isMock
    ? phase === 'closed'
      ? 'Browse all submissions'
      : joined && hasSubmitted && phase === 'open'
        ? 'Browse submissions'
        : undefined
    : getSecondaryCtaLabel(phase, joined, hasSubmitted);

  const openGallery = () => {
    router.push({
      pathname: '/challenge-gallery',
      params: { challengeId: challenge.id },
    } as never);
  };

  const load = useCallback(async () => {
    if (!isSignedIn) {
      setChallengeApi(null);
      setApiEntryId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = await apiListChallenges();
      const primary = pickPrimaryChallenge(items);
      if (!primary && items.length > 0) {
        console.warn('[FestivalsTab] challenges returned but none passed active filter:', items.map((i) => ({ id: i.id, status: i.status })));
      }
      setChallengeApi(primary);
      setApiEntryId(challengeEntryId(primary));
    } catch (err) {
      setChallengeApi(null);
      setApiEntryId(null);
      if (__DEV__) {
        setError(err instanceof Error ? err.message : 'Failed to load challenges');
      }
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleMockJoin = (trackId: string) => {
    mock.join(trackId);
    setSignUpOpen(false);
    showToast('You joined the preview challenge!', 'success');
  };

  const handleQuickJoin = async () => {
    if (isMock) {
      if (phase === 'voting' || phase === 'closed') {
        openGallery();
        return;
      }
      setSignUpOpen(true);
      return;
    }

    if (!isSignedIn || !challengeApi?.id) {
      showToast('No active challenge available', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const entry = await apiSubmitChallengeEntry(challengeApi.id, {
        track_id: challengeApi.track_id ?? undefined,
        note: 'Joined from Pottery Life app',
      });
      setApiEntryId(entry.id);
      markChallengeEntrySubmitted();
      showToast('You joined the challenge!', 'success');
      void load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not join challenge';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimaryPress = () => {
    if (isPreviewOnly) {
      onShareChallengePost?.();
      return;
    }

    if (phase === 'voting' || phase === 'closed') {
      openGallery();
      return;
    }

    if (isMock) {
      if (joined && hasSubmitted) {
        openGallery();
        return;
      }
      if (joined) {
        setSubmitOpen(true);
        return;
      }
      setSignUpOpen(true);
      return;
    }

    if (joined) {
      setSubmitOpen(true);
      return;
    }
    void handleQuickJoin();
  };

  const handleSecondaryPress = () => {
    if (phase === 'closed') {
      onBrowseHallOfFame?.();
      return;
    }
    if (joined && hasSubmitted) {
      openGallery();
    }
  };

  const handleSubmitEntry = async (payload: SubmitPiecePayload) => {
    if (isMock) {
      mock.submit(payload.note);
      setSubmitOpen(false);
      onEntrySubmitted?.({ emoji: challenge.emoji ?? '🏆', challengeName: challenge.title });
      return;
    }

    if (!isSignedIn || !challengeApi?.id) {
      setSubmitOpen(false);
      showToast('No active challenge available', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let postId: string | undefined;

      const uploaded = await uploadPostPhotoAsset(payload.photoUri);

      const meta = buildCommunityPostMeta({
        postKind: 'update',
        challenge: {
          challengeId: challengeApi.id,
          title: challengeApi.name,
          hashtag: challengeHashtag(challengeApi.name),
        },
      });
      const content = embedCommunityPostMeta(payload.note, meta);
      const post = await apiCreatePost({
        content,
        asset_ids: [uploaded.assetId],
      });
      postId = post.id;

      cacheProfilePost(hydrateCreatedPost(post, uploaded, [uploaded.assetId]));
      markPostCreated();

      const entry = await apiSubmitChallengeEntry(challengeApi.id, {
        track_id: challengeApi.track_id ?? undefined,
        note: payload.note,
        post_id: postId,
      });
      setApiEntryId(entry.id);
      markChallengeEntrySubmitted();
      setSubmitOpen(false);
      onEntrySubmitted?.({ emoji: challenge.emoji ?? '🏆', challengeName: challenge.title });
      void load();
    } catch (err) {
      const message =
        err instanceof CommunityUploadError || err instanceof Error
          ? err.message
          : 'Could not submit entry';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (isMock) {
      mock.leave();
      setDropOpen(false);
      showToast('Left preview challenge', 'success');
      return;
    }

    if (!isSignedIn || !challengeApi?.id || !apiEntryId) {
      setDropOpen(false);
      return;
    }

    try {
      await apiWithdrawChallengeEntry(challengeApi.id, apiEntryId);
      setApiEntryId(null);
      showToast('Challenge entry withdrawn', 'success');
      void load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not leave challenge';
      showToast(message, 'error');
    } finally {
      setDropOpen(false);
    }
  };

  if (loading) {
    return (
      <View className="gap-3">
        <View
          className="rounded-3xl overflow-hidden border py-2"
          style={{ borderColor: COMMUNITY_THEME.cardBorder, backgroundColor: COMMUNITY_THEME.cardBg }}
        >
          {[0, 1, 2, 3].map((i) => (
            <SkeletonLeaderboardRow key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (error && isMock) {
    return <InlineErrorCard message={error} onRetry={() => { void load(); }} />;
  }

  return (
    <>
      {isMock ? (
        <ChallengePhaseDevBar phase={mock.phase} onChange={mock.setPhase} />
      ) : null}

      <ChallengeHero
        challenge={challenge}
        phase={phase}
        phaseSubtitle={phaseSubtitle}
        joined={isPreviewOnly ? false : joined}
        hasSubmitted={isPreviewOnly ? false : hasSubmitted}
        enrolledTrackTitle={enrolledTrack?.title ?? null}
        onPrimaryPress={handlePrimaryPress}
        onSecondaryPress={secondaryLabel ? handleSecondaryPress : undefined}
        secondaryLabel={isPreviewOnly ? undefined : secondaryLabel}
        onLeavePress={() => setDropOpen(true)}
        onChangeTrackPress={isMock && joined && phase === 'open' ? () => setSignUpOpen(true) : undefined}
        loading={loading}
        submitting={submitting}
        primaryLabel={primaryLabel}
        previewMode={isPreviewOnly}
      />

      <View className="mt-2">
        <Text
          className="text-base font-serif font-bold mb-3"
          style={{ color: COMMUNITY_THEME.ink }}
        >
          How it works
        </Text>
        <View
          className="rounded-3xl border p-4"
          style={{
            backgroundColor: COMMUNITY_THEME.cardBg,
            borderColor: COMMUNITY_THEME.cardBorder,
          }}
        >
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }, index) => (
            <View key={step} className="flex-row gap-4">
              <View className="items-center" style={{ width: 36 }}>
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: COMMUNITY_THEME.accentSoft }}
                >
                  <Icon size={16} color={COMMUNITY_THEME.accent} />
                </View>
                {index < HOW_IT_WORKS.length - 1 ? (
                  <View
                    className="flex-1 w-px mt-1"
                    style={{
                      backgroundColor: COMMUNITY_THEME.cardBorder,
                      minHeight: 20,
                    }}
                  />
                ) : null}
              </View>
              <View className="flex-1 pb-4">
                <Text
                  className="text-[10px] font-bold tracking-widest mb-0.5"
                  style={{ color: COMMUNITY_THEME.inkMuted }}
                >
                  0{step}
                </Text>
                <Text className="text-sm font-bold" style={{ color: COMMUNITY_THEME.ink }}>
                  {title}
                </Text>
                <Text className="text-xs leading-relaxed mt-1" style={{ color: COMMUNITY_THEME.inkSoft }}>
                  {body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {phase === 'closed' && winners.length > 0 ? (
        <View className="mt-2">
          <Text className="text-base font-serif font-bold mb-1" style={{ color: COMMUNITY_THEME.ink }}>
            This challenge&apos;s winners
          </Text>
          <Text className="text-xs leading-relaxed mb-3" style={{ color: COMMUNITY_THEME.inkSoft }}>
            Celebrating for a few days before the next challenge begins.
          </Text>
          {winners.map((winner) => (
            <HallOfFameWinnerCard key={winner.id} winner={winner} compact />
          ))}
          {onBrowseHallOfFame ? (
            <TouchableOpacity
              className="items-center mt-2 py-2"
              activeOpacity={0.75}
              onPress={onBrowseHallOfFame}
            >
              <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.accent }}>
                Browse all past winners in the Hall of Fame
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {isMock && phase === 'open' ? <MockTrackCards enrolledTrackId={mock.joinedTrackId} /> : null}

      {isMock ? (
        <FestivalSignUpSheet
          visible={signUpOpen}
          festival={ACTIVE_FESTIVAL}
          onConfirm={handleMockJoin}
          onClose={() => setSignUpOpen(false)}
        />
      ) : null}

      {!isPreviewOnly ? (
        <>
      <SubmitPieceSheet
        visible={submitOpen}
        contextName={challenge.title}
        contextSubtitle={enrolledTrack?.title ?? challenge.label}
        accentColor={challenge.accentColor ?? COMMUNITY_THEME.accent}
        submitting={submitting}
        onSubmit={(payload) => { void handleSubmitEntry(payload); }}
        onClose={() => setSubmitOpen(false)}
      />

      <ConfirmSheet
        visible={dropOpen}
        title="Leave the challenge?"
        body="You can rejoin before the deadline, but your current spot will be cleared."
        confirmLabel="Leave challenge"
        destructive
        onConfirm={() => { void handleLeave(); }}
        onCancel={() => setDropOpen(false)}
      />
        </>
      ) : null}
    </>
  );
}
