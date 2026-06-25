import { NotesInput } from '@/src/components/NotesInput';
import { FormField } from '@/src/components/form/FormField';
import { FormSectionCard } from '@/src/components/form/FormSectionCard';
import {
  ModalCard,
  ModalFormScrollView,
  ModalShell,
  ModalSheetFooter,
  ModalSheetHeader,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Text } from '@/src/components/ui/text';
import { FORM_FIELD_GAP } from '@/src/screens/library/atlas/FormField';
import { glazeCardColor } from '@/src/screens/library/atlas/helpers';
import { GlazeThumbnail } from '@/src/screens/library/atlas/GlazeThumbnail';
import { stripGlazeVersionSuffix } from '@/src/screens/glazes/glazeVersionUtils';
import { GLAZE_FINISH_LABELS, type GlazeLibraryItem } from '@/src/screens/glazes/types';
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
import {
  buildGlazePostPayload,
  embedGlazePayloadInContent,
} from '@/src/screens/glazes/shareGlazeRecipe/glazePostPayload';
import { ShareGlazeFeedPreview } from '@/src/screens/glazes/shareGlazeRecipe/ShareGlazeFeedPreview';
import { apiSubmitChallengeEntry, apiListChallenges, challengeDisplayName, type BackendChallenge } from '@/src/services/challenges';
import { apiCreatePost, hydrateCreatedPost } from '@/src/services/community';
import { CommunityUploadError, uploadPostPhotoAsset } from '@/src/services/communityUpload';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { useAppStore } from '@/src/store';
import type { Piece } from '@/src/types/pieces';
import * as Clipboard from 'expo-clipboard';
import { Bookmark, Copy, RotateCcw } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export type { ShareGlazeDraft } from '@/src/screens/glazes/shareGlazeRecipe/shareGlazeDraft';
export {
  buildDefaultShareDraft,
  composeShareCaption,
} from '@/src/screens/glazes/shareGlazeRecipe/shareGlazeDraft';

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
  const sessionToken = useAppStore((s) => s.sessionToken);
  const showToast = useAppStore((s) => s.showToast);
  const markPostCreated = useAppStore((s) => s.markPostCreated);
  const markChallengeEntrySubmitted = useAppStore((s) => s.markChallengeEntrySubmitted);
  const { trackCommunityPostCreated } = useAnalytics();
  const [posting, setPosting] = React.useState(false);
  const [draft, setDraft] = React.useState<ShareGlazeDraft | null>(null);
  const [showPreview, setShowPreview] = React.useState(true);
  const [challenges, setChallenges] = React.useState<BackendChallenge[]>([]);
  const sheetHeight = useModalSheetHeight(0.84);

  React.useEffect(() => {
    if (!visible || !glaze) return;

    let mounted = true;
    (async () => {
      const saved = await loadShareDraft(glaze.id);
      if (!mounted) return;
      setDraft(saved ?? buildDefaultShareDraft(glaze, linkedPieces));
      setShowPreview(true);
    })();

    if (sessionToken) {
      apiListChallenges(sessionToken)
        .then((items) => setChallenges(items ?? []))
        .catch(() => setChallenges([]));
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, glaze?.id, sessionToken]);

  const caption =
    glaze && draft ? composeShareCaption(draft, glaze, linkedPieces) : '';
  const postContent =
    glaze && draft
      ? embedGlazePayloadInContent(caption.trim(), buildGlazePostPayload(glaze, draft))
      : '';
  const previewPhotoUri =
    glaze && draft ? resolveSharePhotoUri(glaze, draft, linkedPieces) : undefined;
  const charCount = postContent.length;
  const canPost = Boolean(sessionToken && caption.trim() && charCount <= MAX_SHARE_POST_LENGTH);

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
    if (!glaze || !sessionToken || !draft || !canPost) return;
    setPosting(true);
    try {
      const assetIds: string[] = [];
      let uploadedPhoto: { assetId: string; publicUrl?: string } | null = null;
      if (draft.attachPhoto && previewPhotoUri) {
        uploadedPhoto = await uploadPostPhotoAsset(sessionToken, previewPhotoUri);
        assetIds.push(uploadedPhoto.assetId);
      }

      const created = hydrateCreatedPost(
        await apiCreatePost(sessionToken, {
          content: postContent,
          asset_ids: assetIds.length > 0 ? assetIds : undefined,
        }),
        uploadedPhoto,
        assetIds,
      );

      if (draft.challengeId) {
        const linkedPiece = draft.linkedPieceId
          ? linkedPieces.find((p) => p.id === draft.linkedPieceId)
          : undefined;
        try {
          await apiSubmitChallengeEntry(sessionToken, draft.challengeId, {
            note: caption.trim().slice(0, 280),
            piece_id: linkedPiece?.backendId,
          });
          markChallengeEntrySubmitted();
        } catch {
          showToast('Posted to feed, challenge entry failed', 'error');
        }
      }

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
      const message =
        err instanceof CommunityUploadError
          ? err.message
          : 'Could not share, check your connection';
      showToast(message, 'error');
    } finally {
      setPosting(false);
    }
  };

  const displayName = glaze ? stripGlazeVersionSuffix(glaze.name) || glaze.name : '';
  const activeChallenge = challenges[0] ?? null;
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
            Craft your post, attach a photo, and optionally enter the active challenge.
          </Text>
        </ModalSheetHeader>

        <ModalFormScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: FORM_FIELD_GAP,
            paddingBottom: FORM_FIELD_GAP + 8,
          }}
        >
            {!sessionToken ? (
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

                <FormSectionCard title="Post options">
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
                  <FormSectionCard title="Photo source">
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
                  <FormSectionCard title="Linked piece" subtitle="Show which pot wore this glaze.">
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

                {activeChallenge ? (
                  <FormSectionCard
                    title="Monthly challenge"
                    subtitle={`Enter "${challengeDisplayName(activeChallenge)}" with this post.`}
                  >
                    <FormField label="Challenge entry" nested first last>
                    <ToggleChip
                      label={
                        draft.challengeId === activeChallenge.id
                          ? 'Entering challenge'
                          : 'Enter challenge'
                      }
                      active={draft.challengeId === activeChallenge.id}
                      onPress={() =>
                        patchDraft({
                          challengeId:
                            draft.challengeId === activeChallenge.id ? null : activeChallenge.id,
                        })
                      }
                    />
                    </FormField>
                  </FormSectionCard>
                ) : null}

                <FormSectionCard title="Hashtags" subtitle="Space-separated tags for discoverability." last>
                  <FormField label="Tags" nested first last>
                  <TextInput
                    value={draft.hashtags}
                    onChangeText={(hashtags) => patchDraft({ hashtags })}
                    placeholder="#glazerecipe #potterylife"
                    placeholderTextColor="hsl(24 10% 65%)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={120}
                    style={{
                      borderWidth: 1,
                      borderColor: 'hsl(24 15% 88%)',
                      borderRadius: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      fontSize: 14,
                      lineHeight: 20,
                      color: 'hsl(24 25% 15%)',
                      backgroundColor: 'hsl(40 40% 98%)',
                    }}
                  />
                  </FormField>
                </FormSectionCard>

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
          {sessionToken ? (
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
              className={`rounded-2xl border border-border py-3.5 items-center ${sessionToken ? 'flex-1' : 'w-full'}`}
            >
              <Text className="text-sm font-semibold text-foreground">
                {sessionToken ? 'Cancel' : 'Close'}
              </Text>
            </TouchableOpacity>
            {sessionToken ? (
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
