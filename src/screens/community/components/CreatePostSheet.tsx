import { NotesInput } from '@/src/components/NotesInput';
import type { CommunityPostComposerPreset } from '@/src/screens/community/types/composerPreset';
import {
  ModalCard,
  ModalFormScrollView,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { PhotoPickField } from '@/src/components/PhotoPickField';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import {
  ASK_TOPIC_OPTIONS,
  canSubmitCommunityPost,
  COMMUNITY_POST_KINDS,
  composeCommunityPostContent,
  resolvePieceJournalPhoto,
  type AskTopic,
  type CommunityPostKind,
} from '@/src/screens/community/utils/createPostCompose';
import { challengeHashtag } from '@/src/screens/community/utils/challengeTag';
import {
  buildCommunityPostMeta,
  embedCommunityPostMeta,
} from '@/src/screens/community/utils/communityPostPayload';
import { cacheProfilePost } from '@/src/screens/overview/profile/utils/profilePostCache';
import { apiCreatePost, hydrateCreatedPost } from '@/src/services/community';
import { apiListChallenges, apiSubmitChallengeEntry, challengeDisplayName, type BackendChallenge } from '@/src/services/challenges';
import { CommunityUploadError, uploadPostPhotoAsset } from '@/src/services/communityUpload';
import { useAppStore, useVisiblePieces } from '@/src/store';
import { useCanPostStudioNotice } from '@/src/hooks/useCanPostStudioNotice';
import {
  getAvailablePostKinds,
  getDefaultAskTopic,
  getDefaultCommunityPostKind,
} from '@/src/utils/communityComposerDefaults';
import type { Piece } from '@/src/types/pieces';
import { Image } from 'expo-image';
import { BookOpen, Flame, X } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

const MAX_POST_LENGTH = 500;

type CreatePostSheetProps = {
  visible: boolean;
  preset: CommunityPostComposerPreset | null;
  onClose: () => void;
  sessionToken: string;
  onPosted: () => void;
};

function pickLinkablePieces(pieces: Piece[]): Piece[] {
  return pieces
    .filter((p) => !p.deleted)
    .sort((a, b) => {
      const aJournal = Boolean(a.description?.trim() || a.timeline.some((e) => e.notes?.trim() || e.photos?.length));
      const bJournal = Boolean(b.description?.trim() || b.timeline.some((e) => e.notes?.trim() || e.photos?.length));
      if (aJournal !== bJournal) return aJournal ? -1 : 1;
      const aPhoto = Boolean(a.photo || a.imgUrl || a.timeline.some((e) => e.photos?.length));
      const bPhoto = Boolean(b.photo || b.imgUrl || b.timeline.some((e) => e.photos?.length));
      if (aPhoto !== bPhoto) return aPhoto ? -1 : 1;
      return (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt);
    })
    .slice(0, 16);
}

function resolveActiveChallenge(challenges: BackendChallenge[]): BackendChallenge | null {
  const now = Date.now();
  const active = challenges.find((challenge) => {
    const start = challenge.start_date ? new Date(challenge.start_date).getTime() : 0;
    const end = challenge.end_date ? new Date(challenge.end_date).getTime() : Number.POSITIVE_INFINITY;
    return now >= start && now <= end;
  });
  return active ?? challenges[0] ?? null;
}

export function CreatePostSheet({
  visible,
  preset,
  onClose,
  sessionToken,
  onPosted,
}: CreatePostSheetProps) {
  const pieces = useVisiblePieces();
  const userType = useAppStore((s) => s.onboardingProfile.userType);
  const { canPostStudioNotice } = useCanPostStudioNotice();
  const availablePostKinds = React.useMemo(
    () => getAvailablePostKinds(canPostStudioNotice),
    [canPostStudioNotice],
  );
  const { stages } = useStageConfig();
  const showToast = useAppStore((s) => s.showToast);
  const markPostCreated = useAppStore((s) => s.markPostCreated);
  const { trackCommunityPostCreated } = useAnalytics();
  const sheetHeight = useModalSheetHeight(0.88);
  const scrollRef = React.useRef<ScrollView>(null);

  const [postKind, setPostKind] = React.useState<CommunityPostKind>('update');
  const [content, setContent] = React.useState('');
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const [photoIsCustom, setPhotoIsCustom] = React.useState(false);
  const [linkedPieceId, setLinkedPieceId] = React.useState<number | null>(null);
  const [linkedPieceIds, setLinkedPieceIds] = React.useState<number[]>([]);
  const [askTopic, setAskTopic] = React.useState<AskTopic>('general');
  const [firingName, setFiringName] = React.useState('Studio firing');
  const [firingType, setFiringType] = React.useState('bisque');
  const [firingCone, setFiringCone] = React.useState('6');
  const [firingId, setFiringId] = React.useState<string | undefined>();
  const [activeChallenge, setActiveChallenge] = React.useState<BackendChallenge | null>(null);
  const [includeChallengeTag, setIncludeChallengeTag] = React.useState(false);
  const [posting, setPosting] = React.useState(false);

  const stageLabelById = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const stage of stages) map[stage.id] = stage.label;
    return map;
  }, [stages]);

  const linkablePieces = React.useMemo(() => pickLinkablePieces(pieces), [pieces]);
  const linkedPiece = linkedPieceId != null
    ? linkablePieces.find((p) => p.id === linkedPieceId) ?? pieces.find((p) => p.id === linkedPieceId) ?? null
    : null;
  const linkedKilnPieces = React.useMemo(
    () => linkedPieceIds
      .map((id) => pieces.find((p) => p.id === id))
      .filter((p): p is Piece => Boolean(p)),
    [linkedPieceIds, pieces],
  );

  const challengeTitle = preset?.challengeTitle ?? (activeChallenge ? challengeDisplayName(activeChallenge) : null);
  const challengeId = preset?.challengeId ?? activeChallenge?.id;

  const activeKindMeta = availablePostKinds.find((k) => k.id === postKind)
    ?? availablePostKinds[0]
    ?? COMMUNITY_POST_KINDS[0];

  const postBody = composeCommunityPostContent({
    kind: postKind,
    caption: content,
    linkedPiece,
    linkedPieces: linkedKilnPieces,
    stageLabel: linkedPiece ? stageLabelById[linkedPiece.stage.trim().toLowerCase()] ?? linkedPiece.stage : '',
    firingName,
    firingType,
    cone: firingCone,
    askTopic,
    challengeTitle,
    includeChallengeTag,
  });

  const canPost = canSubmitCommunityPost({
    kind: postKind,
    caption: content,
    photoUri,
    linkedPiece,
    linkedPieces: linkedKilnPieces,
  }) && !posting;

  const resetForm = React.useCallback(() => {
    const defaultKind = getDefaultCommunityPostKind(userType, canPostStudioNotice);
    setPostKind(defaultKind);
    setContent('');
    setPhotoUri(null);
    setPhotoIsCustom(false);
    setLinkedPieceId(null);
    setLinkedPieceIds([]);
    setAskTopic(getDefaultAskTopic(userType));
    setFiringName('Studio firing');
    setFiringType('bisque');
    setFiringCone('6');
    setFiringId(undefined);
    setIncludeChallengeTag(false);
    setPosting(false);
  }, [userType, canPostStudioNotice]);

  const applyPreset = React.useCallback((next: CommunityPostComposerPreset) => {
    setPostKind(next.kind);
    setContent(next.caption ?? '');
    if (next.photoUri) {
      setPhotoUri(next.photoUri);
      setPhotoIsCustom(true);
    } else {
      setPhotoUri(null);
      setPhotoIsCustom(false);
    }
    if (next.pieceId != null) {
      setLinkedPieceId(next.pieceId);
    }
    if (next.pieceIds?.length) {
      setLinkedPieceIds(next.pieceIds);
    }
    if (next.firingName) setFiringName(next.firingName);
    if (next.firingType) setFiringType(next.firingType);
    if (next.cone) setFiringCone(next.cone);
    if (next.firingId) setFiringId(next.firingId);
    if (next.askTopic) setAskTopic(next.askTopic);
    if (next.includeChallengeTag) setIncludeChallengeTag(true);
  }, []);

  React.useEffect(() => {
    if (!visible) {
      resetForm();
      return;
    }
    if (preset) {
      applyPreset(preset);
      return;
    }
    resetForm();
  }, [visible, preset, resetForm, applyPreset]);

  React.useEffect(() => {
    if (!canPostStudioNotice && postKind === 'studio_notice') {
      setPostKind(getDefaultCommunityPostKind(userType, canPostStudioNotice));
    }
  }, [canPostStudioNotice, postKind, userType]);

  React.useEffect(() => {
    if (!visible || !sessionToken) return;
    let cancelled = false;
    apiListChallenges(sessionToken)
      .then((challenges) => {
        if (cancelled) return;
        const active = resolveActiveChallenge(challenges);
        setActiveChallenge(active);
        if (preset?.includeChallengeTag && active) {
          setIncludeChallengeTag(true);
        }
      })
      .catch(() => {
        if (!cancelled) setActiveChallenge(null);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, sessionToken, preset?.includeChallengeTag]);

  React.useEffect(() => {
    if (postKind !== 'piece_journal' || !linkedPiece || photoIsCustom) return;
    const journalPhoto = resolvePieceJournalPhoto(linkedPiece);
    if (journalPhoto) setPhotoUri(journalPhoto);
  }, [postKind, linkedPiece, photoIsCustom]);

  React.useEffect(() => {
    if (postKind === 'piece_journal' && !linkedPieceId && linkablePieces.length > 0) {
      setLinkedPieceId(linkablePieces[0].id);
    }
  }, [postKind, linkedPieceId, linkablePieces]);

  const handleClose = () => {
    if (posting) return;
    Keyboard.dismiss();
    onClose();
  };

  const photoHint =
    postKind === 'piece_journal'
      ? 'Pick a piece below to use its journal photo, or add your own'
      : postKind === 'kiln_firing'
        ? 'Unload photo optional, piece chips carry the story'
        : 'Share a snapshot from the studio';

  const handleKindChange = (kind: CommunityPostKind) => {
    Keyboard.dismiss();
    setPostKind(kind);
    if (kind === 'piece_journal') {
      setPhotoIsCustom(false);
      if (!linkedPieceId && linkablePieces[0]) {
        setLinkedPieceId(linkablePieces[0].id);
      }
    }
  };

  const toggleKilnPiece = (pieceId: number) => {
    setLinkedPieceIds((current) =>
      current.includes(pieceId)
        ? current.filter((id) => id !== pieceId)
        : [...current, pieceId],
    );
  };

  const submit = async () => {
    if (!canPost) return;
    Keyboard.dismiss();
    setPosting(true);

    try {
      const assetIds: string[] = [];
      const meta = buildCommunityPostMeta({
        postKind: postKind,
        pieceJournal:
          postKind === 'piece_journal' && linkedPiece
            ? { pieceId: linkedPiece.id, pieceName: linkedPiece.name }
            : undefined,
        kilnFiring:
          postKind === 'kiln_firing'
            ? {
                firingId: firingId ?? `local-${Date.now()}`,
                firingName,
                firingType,
                cone: firingCone,
                pieceIds: linkedKilnPieces.map((p) => p.id),
                pieceNames: linkedKilnPieces.map((p) => p.name),
              }
            : undefined,
        challenge:
          includeChallengeTag && challengeTitle && challengeId
            ? {
                challengeId,
                title: challengeTitle,
                hashtag: challengeHashtag(challengeTitle),
              }
            : undefined,
        ask: postKind === 'ask_community' ? { topic: askTopic } : undefined,
      });
      let finalContent = embedCommunityPostMeta(postBody, meta);

      let uploadedPhoto: { assetId: string; publicUrl?: string } | null = null;

      if (photoUri) {
        uploadedPhoto = await uploadPostPhotoAsset(sessionToken, photoUri);
        assetIds.push(uploadedPhoto.assetId);
      }

      const created = await apiCreatePost(sessionToken, {
        content: finalContent,
        asset_ids: assetIds.length > 0 ? assetIds : undefined,
      });

      cacheProfilePost(
        hydrateCreatedPost(created, uploadedPhoto, assetIds),
      );

      if (meta.challenge && challengeId) {
        const entryPieceId =
          postKind === 'piece_journal' && linkedPiece
            ? linkedPiece.id
            : linkedKilnPieces[0]?.id;
        if (entryPieceId != null) {
          try {
            await apiSubmitChallengeEntry(sessionToken, challengeId, {
              piece_id: String(entryPieceId),
              note: content.trim() || undefined,
            });
          } catch {
            // Challenge entry is best-effort until backend is fully wired.
          }
        }
      }

      markPostCreated();
      trackCommunityPostCreated({
        hasPhoto: assetIds.length > 0,
        hasRecipe: false,
      });
      showToast('Post shared!', 'success');
      onPosted();
      onClose();
    } catch (e) {
      console.error('[CreatePost] error:', e);
      const message =
        e instanceof CommunityUploadError
          ? e.message
          : 'Failed to post, please try again';
      showToast(message, 'error');
    } finally {
      setPosting(false);
    }
  };

  const showPiecePicker = postKind === 'piece_journal' || postKind === 'update';
  const showKilnPiecePicker = postKind === 'kiln_firing';
  const challengeTag = challengeTitle ? challengeHashtag(challengeTitle) : null;

  return (
    <ModalShell visible={visible} onClose={handleClose}>
      <ModalCard
        radius={MODAL_SHEET_RADIUS}
        height={sheetHeight}
        maxHeight={sheetHeight}
        withHandle={false}
      >
        <ModalSheetHeader>
          <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            New post
          </Text>
          <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
            Start with a photo, add a caption, then tag a piece or challenge if you want.
          </Text>
        </ModalSheetHeader>

        <View className="px-6 pt-4 pb-3 border-b border-border shrink-0">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 8 }}
          >
            {availablePostKinds.map((kind) => {
              const active = postKind === kind.id;
              return (
                <TouchableOpacity
                  key={kind.id}
                  onPress={() => handleKindChange(kind.id)}
                  activeOpacity={0.82}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                    active ? 'bg-primary/10 border-primary/35' : 'bg-muted/30 border-border'
                  }`}
                >
                  <Text className="text-sm">{kind.emoji}</Text>
                  <Text
                    className={`text-xs font-semibold ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {kind.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ModalFormScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 24,
          }}
          nestedScrollEnabled
        >
            {postKind === 'piece_journal' && linkedPiece ? (
              <View className="rounded-2xl border border-primary/25 bg-primary/5 px-3 py-3 mb-5 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary/15 items-center justify-center">
                  <BookOpen size={18} color="hsl(39 57% 45%)" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {linkedPiece.name}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={1}>
                    Sharing journal cover + latest notes
                  </Text>
                </View>
              </View>
            ) : null}

            {postKind === 'kiln_firing' ? (
              <View className="rounded-2xl border border-orange-300/50 bg-orange-50/80 px-3 py-3 mb-5 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-orange-100 items-center justify-center">
                  <Flame size={18} color="hsl(24 70% 45%)" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {firingName}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={1}>
                    {firingType.charAt(0).toUpperCase() + firingType.slice(1)} · Cone {firingCone}
                  </Text>
                </View>
              </View>
            ) : null}

            {postKind === 'studio_notice' ? (
              <View className="rounded-2xl border border-amber-300/50 bg-amber-50/80 px-3 py-2.5 mb-5">
                <Text className="text-xs font-semibold text-amber-900">
                  📌 Posts as a studio notice, good for closures, kiln downtime, or schedule changes.
                </Text>
              </View>
            ) : null}

            {postKind === 'ask_community' ? (
              <View className="mb-5">
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Topic
                </Text>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ gap: 8 }}
                >
                  {ASK_TOPIC_OPTIONS.map((option) => {
                    const active = askTopic === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => setAskTopic(option.id)}
                        activeOpacity={0.82}
                        className={`px-3 py-2 rounded-full border ${
                          active ? 'bg-primary/10 border-primary/35' : 'bg-muted/30 border-border'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            active ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {challengeTag ? (
              <View className="rounded-2xl border border-border bg-muted/20 px-3 py-3 mb-5 flex-row items-center justify-between gap-3">
                <View className="flex-1 min-w-0">
                  <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
                    {activeChallenge ? challengeDisplayName(activeChallenge) : challengeTitle}
                  </Text>
                  <Text className="text-[11px] text-primary mt-0.5">{challengeTag}</Text>
                </View>
                <Switch
                  value={includeChallengeTag}
                  onValueChange={setIncludeChallengeTag}
                  trackColor={{ false: 'hsl(24 15% 88%)', true: 'hsl(39 57% 75%)' }}
                  thumbColor={includeChallengeTag ? 'hsl(39 57% 51%)' : 'hsl(24 10% 95%)'}
                />
              </View>
            ) : null}

            <View className="mb-5">
              <PhotoPickField
                photo={photoUri}
                onPhotoChange={(uri) => {
                  setPhotoUri(uri ?? null);
                  setPhotoIsCustom(Boolean(uri));
                }}
                aspect={[4, 3]}
                quality={0.85}
                hint={photoHint}
                disabled={posting}
                onBeforePick={() => {
                  Keyboard.dismiss();
                }}
              />
            </View>

            {showKilnPiecePicker ? (
              <View className="mb-5">
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Pieces in this firing
                </Text>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
                >
                  {linkablePieces.length === 0 ? (
                    <Text className="text-xs text-muted-foreground py-1">
                      Assign pieces to a firing to share them here.
                    </Text>
                  ) : (
                    linkablePieces.map((piece) => {
                      const active = linkedPieceIds.includes(piece.id);
                      const thumb = resolvePieceJournalPhoto(piece);
                      return (
                        <TouchableOpacity
                          key={piece.id}
                          onPress={() => toggleKilnPiece(piece.id)}
                          activeOpacity={0.82}
                          className={`rounded-xl border overflow-hidden ${
                            active ? 'border-orange-400/50 bg-orange-50/80' : 'border-border bg-card'
                          }`}
                          style={{ width: 120 }}
                        >
                          {thumb ? (
                            <Image
                              source={{ uri: thumb }}
                              style={{ width: '100%', height: 72 }}
                              contentFit="cover"
                              cachePolicy="memory-disk"
                            />
                          ) : (
                            <View
                              className="items-center justify-center bg-muted/40"
                              style={{ width: '100%', height: 72 }}
                            >
                              <BookOpen size={18} color="hsl(24 20% 45%)" />
                            </View>
                          )}
                          <View className="px-2 py-2">
                            <Text
                              className={`text-[11px] font-semibold ${
                                active ? 'text-orange-800' : 'text-foreground'
                              }`}
                              numberOfLines={2}
                            >
                              {piece.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            ) : null}

            {showPiecePicker ? (
              <View className="mb-5">
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {postKind === 'piece_journal' ? 'Choose piece journal' : 'Link a piece (optional)'}
                </Text>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
                >
                  {linkablePieces.length === 0 ? (
                    <Text className="text-xs text-muted-foreground py-1">
                      Add pieces in your studio to share a journal.
                    </Text>
                  ) : (
                    linkablePieces.map((piece) => {
                      const active = linkedPieceId === piece.id;
                      const thumb = resolvePieceJournalPhoto(piece);
                      return (
                        <TouchableOpacity
                          key={piece.id}
                          onPress={() => {
                            setLinkedPieceId(active && postKind !== 'piece_journal' ? null : piece.id);
                            if (postKind === 'piece_journal') {
                              setPhotoIsCustom(false);
                            }
                          }}
                          activeOpacity={0.82}
                          className={`rounded-xl border overflow-hidden ${
                            active ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
                          }`}
                          style={{ width: 120 }}
                        >
                          {thumb ? (
                            <Image
                              source={{ uri: thumb }}
                              style={{ width: '100%', height: 72 }}
                              contentFit="cover"
                              cachePolicy="memory-disk"
                            />
                          ) : (
                            <View
                              className="items-center justify-center bg-muted/40"
                              style={{ width: '100%', height: 72 }}
                            >
                              <BookOpen size={18} color="hsl(24 20% 45%)" />
                            </View>
                          )}
                          <View className="px-2 py-2">
                            <Text
                              className={`text-[11px] font-semibold ${
                                active ? 'text-primary' : 'text-foreground'
                              }`}
                              numberOfLines={2}
                            >
                              {piece.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            ) : null}

            <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {postKind === 'piece_journal'
                ? 'Add a line (optional)'
                : postKind === 'ask_community'
                  ? 'Your question'
                  : postKind === 'kiln_firing'
                    ? 'Unload notes (optional)'
                    : 'Caption'}
            </Text>
            <NotesInput
              value={content}
              onChangeText={setContent}
              placeholder={
                postKind === 'studio_notice'
                  ? 'Closed today for kiln maintenance…'
                  : postKind === 'piece_journal'
                    ? 'Add context for fellow potters…'
                    : postKind === 'ask_community'
                      ? askTopic === 'glaze'
                        ? 'Why is my matte glaze crawling on stoneware?'
                        : askTopic === 'firing'
                          ? 'Cone 6 bisque, hold time or soak tips?'
                          : 'What would you try differently here?'
                      : postKind === 'kiln_firing'
                        ? 'Everything came out even, happy with the soda slip.'
                        : 'Share an update, finished piece, or discovery…'
              }
              maxLength={MAX_POST_LENGTH}
              minHeight={100}
              maxHeight={140}
              onFocus={() => {
                requestAnimationFrame(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                });
              }}
              blurOnSubmit
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </ModalFormScrollView>

        <ModalSheetFooter>
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-xs text-muted-foreground">
                {content.length}/{MAX_POST_LENGTH}
              </Text>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={handleClose} disabled={posting} activeOpacity={0.75}>
                  <Text className="text-sm font-semibold text-muted-foreground">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submit}
                  disabled={!canPost}
                  activeOpacity={0.82}
                  className={`px-5 py-2.5 rounded-xl flex-row items-center gap-2 ${
                    canPost ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  {posting ? <ActivityIndicator size="small" color="white" /> : null}
                  <Text className={`text-sm font-bold ${canPost ? 'text-white' : 'text-muted-foreground'}`}>
                    {posting ? 'Posting…' : 'Post'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
