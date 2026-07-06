import {
  MODAL_SHEET_RADIUS,
  ModalCard,
  ModalFormScrollView,
  ModalSheetFooter,
  ModalShell,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { INPUT_PLACEHOLDER_COLOR, INPUT_TEXT_COLOR } from '@/src/constants/inputTheme';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import { useStageConfig } from '@/src/hooks/useStageConfig';
import type { CommunityPostComposerPreset } from '@/src/screens/community/types/composerPreset';
import {
  buildCommunityPostMeta,
  embedCommunityPostMeta,
} from '@/src/screens/community/utils/communityPostPayload';
import { resolveCommunityPostError } from '@/src/screens/community/utils/postErrorMessage';
import {
  canSubmitCommunityPost,
  composeCommunityPostContent,
  resolvePieceJournalPhoto,
  type CommunityPostKind,
} from '@/src/screens/community/utils/createPostCompose';
import { prependCommunityPost } from '@/src/screens/community/utils/communityCacheUpdates';
import { apiCreatePost, hydrateCreatedPost } from '@/src/services/community';
import { uploadPostPhotoAsset } from '@/src/services/communityUpload';
import { useAppStore, useVisiblePieces } from '@/src/store';
import type { Piece } from '@/src/types/pieces';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { BookOpen, Camera, Flame, RefreshCw, WifiOff, X } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const MAX_POST_LENGTH = 500;

type CreatePostSheetProps = {
  visible: boolean;
  preset: CommunityPostComposerPreset | null;
  onClose: () => void;
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

function ContextBanner({
  icon,
  iconBg,
  title,
  subtitle,
  borderClass,
  bgClass,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  borderClass: string;
  bgClass: string;
}) {
  return (
    <View className={`mx-4 mt-3 rounded-2xl border px-3 py-2.5 flex-row items-center gap-3 ${borderClass} ${bgClass}`}>
      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function PieceChipRow({
  title,
  pieces,
  isActive,
  onSelect,
  activeClassName,
}: {
  title: string;
  pieces: Piece[];
  isActive: (piece: Piece) => boolean;
  onSelect: (piece: Piece) => void;
  activeClassName: string;
}) {
  return (
    <View className="px-4 mt-4">
      <Text className="text-xs font-semibold text-muted-foreground mb-2">{title}</Text>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 10, paddingRight: 8 }}
      >
        {pieces.length === 0 ? (
          <Text className="text-xs text-muted-foreground py-1">No pieces available yet.</Text>
        ) : (
          pieces.map((piece) => {
            const active = isActive(piece);
            const thumb = resolvePieceJournalPhoto(piece);
            return (
              <TouchableOpacity
                key={piece.id}
                onPress={() => onSelect(piece)}
                activeOpacity={0.82}
                className={`rounded-2xl border overflow-hidden ${
                  active ? activeClassName : 'border-border bg-card'
                }`}
                style={{ width: 104 }}
              >
                {thumb ? (
                  <Image
                    source={{ uri: thumb }}
                    style={{ width: '100%', height: 68 }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View className="items-center justify-center bg-muted/40" style={{ height: 68 }}>
                    <BookOpen size={16} color="hsl(24 20% 45%)" />
                  </View>
                )}
                <View className="px-2 py-1.5">
                  <Text
                    className={`text-[11px] font-semibold ${active ? 'text-primary' : 'text-foreground'}`}
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
  );
}

export function CreatePostSheet({
  visible,
  preset,
  onClose,
  onPosted,
}: CreatePostSheetProps) {
  const pieces = useVisiblePieces();
  const user = useAppStore((s) => s.user);
  const { stages } = useStageConfig();
  const showToast = useAppStore((s) => s.showToast);
  const markPostCreated = useAppStore((s) => s.markPostCreated);
  const queryClient = useQueryClient();
  const { trackCommunityPostCreated } = useAnalytics();
  const { openPickSheet } = usePhotoPicker({ aspect: [4, 3], quality: 0.85 });
  const sheetHeight = useModalSheetHeight(0.82);
  const scrollRef = React.useRef<ScrollView>(null);

  const [postKind, setPostKind] = React.useState<CommunityPostKind>('update');
  const [content, setContent] = React.useState('');
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const [photoIsCustom, setPhotoIsCustom] = React.useState(false);
  const [linkedPieceId, setLinkedPieceId] = React.useState<number | null>(null);
  const [linkedPieceIds, setLinkedPieceIds] = React.useState<number[]>([]);
  const [firingName, setFiringName] = React.useState('Studio firing');
  const [firingType, setFiringType] = React.useState('bisque');
  const [firingCone, setFiringCone] = React.useState('6');
  const [firingId, setFiringId] = React.useState<string | undefined>();
  const [posting, setPosting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const authorName = user.studioName?.trim() || user.name?.trim() || 'You';
  const authorSubtitle = user.studioName?.trim() && user.name?.trim() ? user.name.trim() : null;

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

  const postBody = composeCommunityPostContent({
    kind: postKind,
    caption: content,
    linkedPiece: postKind === 'piece_journal' ? linkedPiece : null,
    linkedPieces: linkedKilnPieces,
    stageLabel: linkedPiece ? stageLabelById[linkedPiece.stage.trim().toLowerCase()] ?? linkedPiece.stage : '',
    firingName,
    firingType,
    cone: firingCone,
  });

  const canPost = canSubmitCommunityPost({
    kind: postKind,
    caption: content,
    photoUri,
    linkedPiece: postKind === 'piece_journal' ? linkedPiece : null,
    linkedPieces: linkedKilnPieces,
  }) && !posting;

  const placeholder =
    postKind === 'piece_journal'
      ? 'Add a line about this piece…'
      : postKind === 'kiln_firing'
        ? 'How did the unload go?'
        : "What's happening in the studio?";

  const resetForm = React.useCallback(() => {
    setPostKind('update');
    setContent('');
    setPhotoUri(null);
    setPhotoIsCustom(false);
    setLinkedPieceId(null);
    setLinkedPieceIds([]);
    setFiringName('Studio firing');
    setFiringType('bisque');
    setFiringCone('6');
    setFiringId(undefined);
    setPosting(false);
    setSubmitError(null);
  }, []);

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
    if (next.pieceId != null) setLinkedPieceId(next.pieceId);
    if (next.pieceIds?.length) setLinkedPieceIds(next.pieceIds);
    if (next.firingName) setFiringName(next.firingName);
    if (next.firingType) setFiringType(next.firingType);
    if (next.cone) setFiringCone(next.cone);
    if (next.firingId) setFiringId(next.firingId);
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

  const handlePickPhoto = () => {
    if (posting) return;
    Keyboard.dismiss();
    openPickSheet(
      (uri) => {
        setPhotoUri(uri);
        setPhotoIsCustom(true);
      },
      photoUri
        ? () => {
            setPhotoUri(null);
            setPhotoIsCustom(false);
          }
        : undefined,
    );
  };

  const toggleKilnPiece = (pieceId: number) => {
    setLinkedPieceIds((current) =>
      current.includes(pieceId)
        ? current.filter((id) => id !== pieceId)
        : [...current, pieceId],
    );
  };

  const submit = async () => {
    if (!canPost || posting) return;
    Keyboard.dismiss();
    setSubmitError(null);
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
      });
      const finalContent = embedCommunityPostMeta(postBody, meta);

      // Wrap a synced journal piece as a real container: the backend attaches the piece's
      // assets and the post inherits the piece's visibility. Only reach for a manual photo
      // upload when there's no piece FK, or the user picked a custom image.
      const pieceIdForPost =
        postKind === 'piece_journal' && linkedPiece?.backendId
          ? linkedPiece.backendId
          : undefined;

      let uploadedPhoto: { assetId: string; publicUrl?: string } | null = null;

      if (photoUri && (!pieceIdForPost || photoIsCustom)) {
        uploadedPhoto = await uploadPostPhotoAsset(photoUri);
        assetIds.push(uploadedPhoto.assetId);
      }

      const created = await apiCreatePost({
        content: finalContent,
        asset_ids: assetIds.length > 0 ? assetIds : undefined,
        piece_id: pieceIdForPost,
      });

      prependCommunityPost(
        queryClient,
        hydrateCreatedPost(created, uploadedPhoto, assetIds),
      );

      markPostCreated();
      trackCommunityPostCreated({
        hasPhoto: assetIds.length > 0,
        hasRecipe: false,
      });
      showToast('Post shared!', 'success');
      onPosted();
      onClose();
    } catch (e) {
      if (__DEV__) {
        console.error('[CreatePost] error:', e);
      }
      setSubmitError(resolveCommunityPostError(e));
    } finally {
      setPosting(false);
    }
  };

  return (
    <ModalShell visible={visible} onClose={handleClose}>
      <ModalCard
        radius={MODAL_SHEET_RADIUS}
        height={sheetHeight}
        maxHeight={sheetHeight}
        withHandle={false}
      >
        <View className="items-center pt-2 pb-1 shrink-0">
          <View className="w-10 h-1 rounded-full bg-muted" />
        </View>

        <View className="flex-row items-center justify-between px-4 py-2 border-b border-border shrink-0">
          <TouchableOpacity
            onPress={handleClose}
            disabled={posting}
            hitSlop={12}
            activeOpacity={0.7}
            className="w-9 h-9 items-center justify-center rounded-full bg-muted/50"
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={20} color="hsl(24 20% 45%)" />
          </TouchableOpacity>

          <Text className="text-base font-bold text-foreground">New post</Text>

          <TouchableOpacity
            onPress={submit}
            disabled={!canPost}
            activeOpacity={0.82}
            className={`min-w-[72px] px-4 py-2 rounded-full items-center justify-center ${
              canPost ? 'bg-primary' : 'bg-muted'
            }`}
          >
            {posting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className={`text-sm font-bold ${canPost ? 'text-white' : 'text-muted-foreground'}`}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ModalFormScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 16 }}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {postKind === 'piece_journal' && linkedPiece ? (
            <ContextBanner
              icon={<BookOpen size={16} color="hsl(39 57% 45%)" />}
              iconBg="hsl(39 57% 92%)"
              title={linkedPiece.name}
              subtitle="Sharing from your piece journal"
              borderClass="border-primary/20"
              bgClass="bg-primary/5"
            />
          ) : null}

          {postKind === 'kiln_firing' ? (
            <ContextBanner
              icon={<Flame size={16} color="hsl(24 70% 45%)" />}
              iconBg="hsl(24 70% 92%)"
              title={firingName}
              subtitle={`${firingType.charAt(0).toUpperCase() + firingType.slice(1)} · Cone ${firingCone}`}
              borderClass="border-orange-200"
              bgClass="bg-orange-50/80"
            />
          ) : null}

          <View className="flex-row items-start gap-3 px-4 pt-4">
            <UserAvatar
              name={user.name}
              initial={user.avatarInitial}
              imageUri={user.avatarImageUri}
              size={44}
            />
            <View className="flex-1 min-w-0 pt-0.5">
              <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                {authorName}
              </Text>
              {authorSubtitle ? (
                <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                  {authorSubtitle}
                </Text>
              ) : null}
              <TextInput
                value={content}
                onChangeText={(text) => {
                  setContent(text);
                  if (submitError) setSubmitError(null);
                }}
                placeholder={placeholder}
                placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
                multiline
                textAlignVertical="top"
                scrollEnabled
                maxLength={MAX_POST_LENGTH}
                editable={!posting}
                style={{
                  marginTop: 10,
                  minHeight: 108,
                  maxHeight: 200,
                  padding: 0,
                  fontFamily: 'DMSans_400Regular',
                  fontSize: 17,
                  lineHeight: 24,
                  color: INPUT_TEXT_COLOR,
                }}
                onFocus={() => {
                  requestAnimationFrame(() => {
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                  });
                }}
              />
            </View>
          </View>

          {photoUri ? (
            <View className="mx-4 mt-4 rounded-2xl overflow-hidden border border-border bg-card">
              <Image
                source={{ uri: photoUri }}
                style={{ width: '100%', height: 220 }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <TouchableOpacity
                onPress={() => {
                  setPhotoUri(null);
                  setPhotoIsCustom(false);
                }}
                disabled={posting}
                activeOpacity={0.85}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/55 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
              >
                <X size={14} color="white" />
              </TouchableOpacity>
            </View>
          ) : null}

          {postKind === 'kiln_firing' ? (
            <PieceChipRow
              title="Pieces in this firing"
              pieces={linkablePieces}
              isActive={(piece) => linkedPieceIds.includes(piece.id)}
              onSelect={(piece) => toggleKilnPiece(piece.id)}
              activeClassName="border-orange-300 bg-orange-50/90"
            />
          ) : null}

          {postKind === 'piece_journal' ? (
            <PieceChipRow
              title="Choose a piece"
              pieces={linkablePieces}
              isActive={(piece) => linkedPieceId === piece.id}
              onSelect={(piece) => {
                setLinkedPieceId(piece.id);
                setPhotoIsCustom(false);
              }}
              activeClassName="border-primary/40 bg-primary/5"
            />
          ) : null}
        </ModalFormScrollView>

        {submitError ? (
          <View className="mx-4 mb-2 px-3 py-3 rounded-2xl border border-destructive/25 bg-destructive/8">
            <View className="flex-row items-start gap-2.5">
              <WifiOff size={18} color="hsl(0 65% 48%)" style={{ marginTop: 1 }} />
              <View className="flex-1 min-w-0">
                <Text className="text-sm font-semibold text-foreground">Couldn&apos;t post</Text>
                <Text className="text-xs text-muted-foreground mt-1 leading-5">{submitError}</Text>
                <TouchableOpacity
                  onPress={submit}
                  disabled={!canPost || posting}
                  activeOpacity={0.8}
                  className="flex-row items-center gap-1.5 mt-2.5 self-start"
                >
                  <RefreshCw size={14} color="hsl(39 57% 45%)" />
                  <Text className="text-sm font-semibold text-primary">Try again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        <ModalSheetFooter>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handlePickPhoto}
              disabled={posting}
              activeOpacity={0.75}
              className="w-10 h-10 rounded-full items-center justify-center bg-muted/60"
              accessibilityRole="button"
              accessibilityLabel="Add photo"
            >
              <Camera size={20} color={photoUri ? 'hsl(39 57% 45%)' : 'hsl(24 20% 45%)'} />
            </TouchableOpacity>

            <Text
              className={`text-xs ${
                content.length >= MAX_POST_LENGTH - 40 ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {content.length}/{MAX_POST_LENGTH}
            </Text>
          </View>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
