import {
    MODAL_SHEET_RADIUS,
    ModalCard,
    ModalFormScrollView,
    ModalSheetFooter,
    ModalSheetHeader,
    ModalShell,
    useModalSheetHeight,
} from '@/src/components/AppSheets';
import { FormField } from '@/src/components/form/FormField';
import { FormSectionCard } from '@/src/components/form/FormSectionCard';
import { NotesInput } from '@/src/components/NotesInput';
import { Text } from '@/src/components/ui/text';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { prependCommunityPost } from '@/src/screens/community/utils/communityCacheUpdates';
import { resolveCommunityPostError } from '@/src/screens/community/utils/postErrorMessage';
import { stripGlazeVersionSuffix } from '@/src/screens/glazes/glazeVersionUtils';
import {
    buildGlazePostPayload,
    embedGlazePayloadInContent,
} from '@/src/screens/glazes/shareGlazeRecipe/glazePostPayload';
import {
    buildDefaultShareDraft,
    clearShareDraft,
    composeShareCaption,
    loadShareDraft,
    MAX_SHARE_POST_LENGTH,
    resolveSharePhotoUri,
    saveShareDraft,
    SHARE_INTRO_PRESETS,
    type ShareGlazeDraft,
} from '@/src/screens/glazes/shareGlazeRecipe/shareGlazeDraft';
import { ShareGlazeFeedPreview } from '@/src/screens/glazes/shareGlazeRecipe/ShareGlazeFeedPreview';
import { GLAZE_FINISH_LABELS, type GlazeLibraryItem } from '@/src/screens/glazes/types';
import { FORM_FIELD_GAP } from '@/src/screens/library/atlas/FormField';
import { GlazeThumbnail } from '@/src/screens/library/atlas/GlazeThumbnail';
import { glazeCardColor } from '@/src/screens/library/atlas/helpers';
import { apiCreatePost, hydrateCreatedPost } from '@/src/services/community';
import { uploadPostPhotoAsset } from '@/src/services/communityUpload';
import { useAppStore } from '@/src/store';
import type { Piece } from '@/src/types/pieces';
import { useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Bookmark, Copy, RotateCcw } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';

export {
    buildDefaultShareDraft,
    composeShareCaption
} from '@/src/screens/glazes/shareGlazeRecipe/shareGlazeDraft';
export type { ShareGlazeDraft } from '@/src/screens/glazes/shareGlazeRecipe/shareGlazeDraft';

function ToggleChip({
  label,
  active,
  onPress,
  disabled,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.78}
      accessibilityRole="switch"
      accessibilityState={{ checked: active, disabled: !!disabled }}
      className={`px-3 py-2 rounded-full border ${
        active ? 'bg-primary/10 border-primary/35' : 'bg-muted/40 border-border'
      } ${disabled ? 'opacity-45' : ''}`}
    >
      <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type ShareGlazeRecipeSheetProps = {
  glaze: GlazeLibraryItem | null;
  linkedPieces?: Piece[];
  visible: boolean;
  onClose: () => void;
  onShared?: () => void;
};

export function ShareGlazeRecipeSheet({
  glaze,
  linkedPieces = [],
  visible,
  onClose,
  onShared,
}: ShareGlazeRecipeSheetProps) {
  const isSignedIn = useAppStore((s) => s.isSignedIn);
  const linkedPiecesRef = React.useRef(linkedPieces);
  const glazeRef = React.useRef(glaze);

  const showToast = useAppStore((s) => s.showToast);
  const markPostCreated = useAppStore((s) => s.markPostCreated);
  const queryClient = useQueryClient();
  const { trackCommunityPostCreated } = useAnalytics();
  const [posting, setPosting] = React.useState(false);
  const [draft, setDraft] = React.useState<ShareGlazeDraft | null>(null);
  const [showPreview, setShowPreview] = React.useState(true);
  const sheetHeight = useModalSheetHeight(0.84);

  React.useEffect(() => {
    linkedPiecesRef.current = linkedPieces;
  }, [linkedPieces]);

  React.useEffect(() => {
    glazeRef.current = glaze;
  }, [glaze]);

  React.useEffect(() => {
    const currentGlaze = glazeRef.current;
    if (!visible || !currentGlaze) return;

    let mounted = true;
    (async () => {
      const saved = await loadShareDraft(currentGlaze.id);
      if (!mounted) return;
      setDraft(saved ?? buildDefaultShareDraft(currentGlaze, linkedPiecesRef.current));
      setShowPreview(true);
    })();

    return () => {
      mounted = false;
    };
  }, [visible, glaze?.id]);

  const caption =
    glaze && draft ? composeShareCaption(draft, glaze, linkedPieces) : '';
  const postContent =
    glaze && draft
      ? embedGlazePayloadInContent(caption.trim(), buildGlazePostPayload(glaze, draft))
      : '';
  const previewPhotoUri =
    glaze && draft ? resolveSharePhotoUri(glaze, draft, linkedPieces) : undefined;
  const charCount = postContent.length;
  const canPost = Boolean(isSignedIn && caption.trim() && charCount <= MAX_SHARE_POST_LENGTH);

  const patchDraft = (patch: Partial<ShareGlazeDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const handleReset = () => {
    if (!glaze) return;
    setDraft(buildDefaultShareDraft(glaze, linkedPieces));
    showToast('Reset to suggested post', 'success');
  };

  const handleCopy = async () => {
    if (!caption.trim()) return;
    await Clipboard.setStringAsync(caption);
    showToast('Caption copied', 'success');
  };

  const handleSaveForLater = async () => {
    if (!glaze || !draft) return;
    await saveShareDraft(glaze.id, draft);
    showToast('Draft saved, finish posting anytime', 'success');
    onClose();
  };

  const handleShare = async () => {
    if (!glaze || !isSignedIn || !draft || !canPost) return;
    setPosting(true);
    try {
      const assetIds: string[] = [];
      let uploadedPhoto: { assetId: string; publicUrl?: string } | null = null;
      if (draft.attachPhoto && previewPhotoUri) {
        uploadedPhoto = await uploadPostPhotoAsset(previewPhotoUri);
        assetIds.push(uploadedPhoto.assetId);
      }

      const created = hydrateCreatedPost(
        await apiCreatePost({
          content: postContent,
          asset_ids: assetIds.length > 0 ? assetIds : undefined,
        }),
        uploadedPhoto,
        assetIds,
      );

      prependCommunityPost(queryClient, created);
      await clearShareDraft(glaze.id);
      markPostCreated();
      trackCommunityPostCreated({
        hasRecipe: Boolean(buildGlazePostPayload(glaze, draft)),
        hasPhoto: assetIds.length > 0,
      });
      showToast('Recipe shared to Community', 'success');
      onShared?.();
      onClose();

      if (__DEV__ && created?.id) {
        console.debug('[ShareGlaze] post created', created.id);
      }
    } catch (err) {
      const message = resolveCommunityPostError(err);
      showToast(message, 'error');
    } finally {
      setPosting(false);
    }
  };

  const displayName = glaze ? stripGlazeVersionSuffix(glaze.name) || glaze.name : '';
  const pieceOptions = linkedPieces.filter((p) => !p.deleted);

  return (
    <ModalShell visible={visible && !!glaze} onClose={onClose}>
      <ModalCard
        radius={MODAL_SHEET_RADIUS}
        height={sheetHeight}
        maxHeight={sheetHeight}
        withHandle={false}
      >
        <ModalSheetHeader>
          <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Share to Community
          </Text>
          <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
            Craft your post and attach a photo. Challenge entries go through the Challenges tab.
          </Text>
        </ModalSheetHeader>

        <ModalFormScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: FORM_FIELD_GAP,
            paddingBottom: FORM_FIELD_GAP + 8,
          }}
        >
            {!isSignedIn ? (
              <Text className="text-sm text-muted-foreground leading-6">
                Sign in to share recipes with other potters. Your atlas stays private until you post.
              </Text>
            ) : glaze && draft ? (
              <>
                <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 mb-6">
                  <GlazeThumbnail
                    uri={previewPhotoUri}
                    colorHex={glazeCardColor(glaze.colorFamily)}
                    size={56}
                    rounded={12}
                  />
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                      {displayName}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                      {GLAZE_FINISH_LABELS[glaze.finish]} · {glaze.defaultCone || glaze.coneRange}
                    </Text>
                  </View>
                </View>

                <FormSectionCard title="Compose" subtitle="Opening line and post body." topGap>
                  <FormField label="Opening line" hint="Tap a preset or write your own." nested first>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
                  >
                    {SHARE_INTRO_PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={preset.id}
                        onPress={() => patchDraft({ intro: preset.text })}
                        activeOpacity={0.78}
                        className="px-3 py-2 rounded-full border border-border bg-muted/30"
                      >
                        <Text className="text-xs font-semibold text-foreground">{preset.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <NotesInput
                    value={draft.intro}
                    onChangeText={(intro) => patchDraft({ intro })}
                    placeholder="What do you want to say about this glaze?"
                    minHeight={88}
                    maxHeight={140}
                    maxLength={600}
                    containerStyle={{ marginTop: 12, marginBottom: 0 }}
                  />
                  </FormField>
                </FormSectionCard>

                <FormSectionCard
                  title="Post options"
                  last={!draft.attachPhoto && pieceOptions.length === 0}
                >
                  <FormField label="Options" nested first last>
                  <View className="flex-row flex-wrap gap-2">
                    <ToggleChip
                      label="Teaser mode"
                      active={draft.teaserMode}
                      onPress={() =>
                        patchDraft({
                          teaserMode: !draft.teaserMode,
                          includeRecipe: draft.teaserMode ? draft.includeRecipe : false,
                          includeNotes: draft.teaserMode ? draft.includeNotes : false,
                        })
                      }
                    />
                    <ToggleChip
                      label="Full recipe"
                      active={draft.includeRecipe}
                      disabled={draft.teaserMode}
                      onPress={() => patchDraft({ includeRecipe: !draft.includeRecipe })}
                    />
                    <ToggleChip
                      label="Studio notes"
                      active={draft.includeNotes}
                      disabled={draft.teaserMode}
                      onPress={() => patchDraft({ includeNotes: !draft.includeNotes })}
                    />
                    <ToggleChip
                      label="Attach photo"
                      active={draft.attachPhoto}
                      onPress={() => patchDraft({ attachPhoto: !draft.attachPhoto })}
                    />
                  </View>
                  {draft.teaserMode ? (
                    <Text className="text-[11px] text-muted-foreground mt-2 leading-4">
                      Teaser shares the glaze name, finish, cone, and photo only, no formula.
                    </Text>
                  ) : null}
                  </FormField>
                </FormSectionCard>

                {draft.attachPhoto ? (
                  <FormSectionCard title="Photo source" last={pieceOptions.length === 0}>
                    <FormField label="Source" nested first last>
                    <View className="flex-row flex-wrap gap-2">
                      <ToggleChip
                        label="Glaze tile"
                        active={draft.photoSource === 'glaze'}
                        onPress={() => patchDraft({ photoSource: 'glaze' })}
                      />
                      {pieceOptions.length > 0 ? (
                        <ToggleChip
                          label="Linked piece"
                          active={draft.photoSource === 'piece'}
                          onPress={() =>
                            patchDraft({
                              photoSource: 'piece',
                              linkedPieceId: draft.linkedPieceId ?? pieceOptions[0]?.id ?? null,
                            })
                          }
                        />
                      ) : null}
                    </View>
                    </FormField>
                  </FormSectionCard>
                ) : null}

                {pieceOptions.length > 0 ? (
                  <FormSectionCard title="Linked piece" subtitle="Show which pot wore this glaze." last>
                    <FormField label="Piece" nested first last>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8 }}
                    >
                      {pieceOptions.map((piece) => {
                        const active = draft.linkedPieceId === piece.id;
                        return (
                          <TouchableOpacity
                            key={piece.id}
                            onPress={() =>
                              patchDraft({
                                linkedPieceId: active ? null : piece.id,
                                photoSource:
                                  !active && draft.attachPhoto ? 'piece' : draft.photoSource,
                              })
                            }
                            activeOpacity={0.78}
                            className={`px-3 py-2 rounded-full border max-w-[180px] ${
                              active ? 'bg-primary/10 border-primary/35' : 'bg-muted/40 border-border'
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}
                              numberOfLines={1}
                            >
                              {piece.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                    </FormField>
                  </FormSectionCard>
                ) : null}

                <View className="flex-row items-center justify-between mb-3">
                  <TouchableOpacity onPress={() => setShowPreview((v) => !v)} activeOpacity={0.75}>
                    <Text className="text-xs font-semibold text-primary">
                      {showPreview ? 'Hide feed preview' : 'Show feed preview'}
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={handleReset} activeOpacity={0.75} className="flex-row items-center gap-1">
                      <RotateCcw size={13} color="hsl(24 20% 50%)" />
                      <Text className="text-xs font-semibold text-muted-foreground">Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCopy} activeOpacity={0.75} className="flex-row items-center gap-1">
                      <Copy size={13} color="hsl(24 20% 50%)" />
                      <Text className="text-xs font-semibold text-muted-foreground">Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {showPreview ? (
                  <View className="mb-3">
                    <ShareGlazeFeedPreview caption={caption} photoUri={previewPhotoUri} />
                  </View>
                ) : null}

                <Text
                  className={`text-[11px] mt-1 ${
                    charCount > MAX_SHARE_POST_LENGTH ? 'text-rose-600' : 'text-muted-foreground'
                  }`}
                >
                  {charCount}/{MAX_SHARE_POST_LENGTH} characters
                </Text>
              </>
            ) : null}
        </ModalFormScrollView>

        <ModalSheetFooter>
          {isSignedIn ? (
            <TouchableOpacity
              onPress={handleSaveForLater}
              disabled={!draft}
              activeOpacity={0.82}
              className="flex-row items-center justify-center gap-2 rounded-2xl border border-border py-3 mb-3"
            >
              <Bookmark size={15} color="hsl(24 20% 45%)" />
              <Text className="text-sm font-semibold text-foreground">Save draft for later</Text>
            </TouchableOpacity>
          ) : null}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.82}
              className={`rounded-2xl border border-border py-3.5 items-center ${isSignedIn ? 'flex-1' : 'w-full'}`}
            >
              <Text className="text-sm font-semibold text-foreground">
                {isSignedIn ? 'Cancel' : 'Close'}
              </Text>
            </TouchableOpacity>
            {isSignedIn ? (
              <TouchableOpacity
                onPress={handleShare}
                disabled={!canPost || posting}
                activeOpacity={0.82}
                className={`flex-1 rounded-2xl py-3.5 items-center flex-row justify-center gap-2 ${
                  canPost && !posting ? 'bg-primary' : 'bg-muted'
                }`}
              >
                {posting ? <ActivityIndicator color="white" size="small" /> : null}
                <Text
                  className={`text-sm font-semibold ${
                    canPost && !posting ? 'text-white' : 'text-muted-foreground'
                  }`}
                >
                  {posting ? 'Posting…' : 'Post to feed'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
  );
}
