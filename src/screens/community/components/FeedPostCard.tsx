// src/screens/community/components/FeedPostCard.tsx
import { ConfirmSheet, PickSheet } from '@/src/components/AppSheets';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { PostReactionBar } from '@/src/screens/community/components/PostReactionBar';
import { SaveCommunityGlazeSheet } from '@/src/screens/community/components/SaveCommunityGlazeSheet';
import { parseCommunityPostMeta } from '@/src/screens/community/utils/communityPostPayload';
import {
  communityPostAskTopicLabel,
  communityPostChallengeTitle,
  communityPostKindLabel,
  stripCommunityPostPayload,
} from '@/src/screens/community/utils/feedDisplayContent';
import { communityGlazeToLibraryItem } from '@/src/screens/community/utils/saveCommunityGlaze';
import {
  isCommunityGlazePostSaved,
  isSavableGlazeRecipePayload,
  parseGlazeRecipeFromPost,
} from '@/src/screens/glazes/shareGlazeRecipe/glazePostPayload';
import {
  deriveCustomCollectionNames,
  sanitizeCustomCollections,
} from '@/src/screens/library/atlas/collections';
import { scheduleGlazesSync } from '@/src/screens/library/useGlazesSync';
import { removeCachedProfilePost } from '@/src/screens/overview/profile/utils/profilePostCache';
import { apiDeletePost } from '@/src/services/community';
import { apiSendFriendRequest } from '@/src/services/friends';
import { useAppStore } from '@/src/store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bookmark, Check, MoreHorizontal, Trash2, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import type { BackendFeedPost } from '../../../services/community';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface Props {
  post: BackendFeedPost;
  onDeleted?: (postId: string) => void;
}

export function FeedPostCard({ post, onDeleted }: Props) {
  const router = useRouter();
  const backendUserId = useAppStore((s) => s.backendUserId);
  const user = useAppStore((s) => s.user);
  const glazes = useAppStore((s) => s.glazes);
  const glazeCollectionNames = useAppStore((s) => s.glazeCollectionNames);
  const addGlaze = useAppStore((s) => s.addGlaze);
  const registerGlazeCollections = useAppStore((s) => s.registerGlazeCollections);
  const recordCommunityPostSave = useAppStore((s) => s.recordCommunityPostSave);
  const communityPostSaveCounts = useAppStore((s) => s.communityPostSaveCounts);
  const showToast = useAppStore((s) => s.showToast);
  const markPostDeleted = useAppStore((s) => s.markPostDeleted);
  const { trackGlazeSavedFromCommunity } = useAnalytics();

  const recipePayload = React.useMemo(
    () => (post.content ? parseGlazeRecipeFromPost(post.content) : null),
    [post.content],
  );
  const displayContent = React.useMemo(
    () => (post.content ? stripCommunityPostPayload(post.content) : ''),
    [post.content],
  );
  const postKindLabel = React.useMemo(
    () => (post.content ? communityPostKindLabel(post.content) : null),
    [post.content],
  );
  const askTopicLabel = React.useMemo(
    () => (post.content ? communityPostAskTopicLabel(post.content) : null),
    [post.content],
  );
  const challengeTitle = React.useMemo(
    () => (post.content ? communityPostChallengeTitle(post.content) : null),
    [post.content],
  );
  const postMeta = React.useMemo(
    () => (post.content ? parseCommunityPostMeta(post.content) : null),
    [post.content],
  );
  const pieceJournalPayload = React.useMemo(() => {
    if (!postMeta?.pieceJournal) return null;
    return {
      pieceId: postMeta.pieceJournal.pieceId,
      pieceName: postMeta.pieceJournal.pieceName,
    };
  }, [postMeta]);
  const kilnPieceChips = postMeta?.kilnFiring?.pieceIds ?? [];
  const firstAsset = post.assets?.[0];
  const isOwnPost = Boolean(backendUserId && backendUserId === post.user_id);
  const initial = isOwnPost
    ? (user.avatarInitial?.trim() || user.name?.trim()?.[0]?.toUpperCase() || post.user_id.slice(0, 1).toUpperCase())
    : (post.user_name?.trim()?.[0]?.toUpperCase() || post.user_id.slice(0, 1).toUpperCase());
  const savedFromPost = isCommunityGlazePostSaved(post.id, glazes.map((g) => g.id));
  const canSaveRecipe = isSavableGlazeRecipePayload(recipePayload) && !savedFromPost;
  const collections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );
  const authorLabel = isOwnPost
    ? (user.studioName?.trim() || user.name?.trim() || post.user_name?.trim() || 'You')
    : (post.user_name?.trim() || 'Community Member');
  const authorStudioForProvenance = isOwnPost
    ? (user.studioName?.trim() || user.name?.trim() || post.user_name?.trim() || 'Your studio')
    : authorLabel;
  const authorAvatarUri = isOwnPost
    ? (user.avatarImageUri ?? post.user_avatar_url ?? null)
    : (post.user_avatar_url ?? null);
  const saveCount = Math.max(post.save_count ?? 0, communityPostSaveCounts[post.id] ?? 0);
  const isGlazeRecipePost = isSavableGlazeRecipePayload(recipePayload);
  const canSendFriendRequest = Boolean(backendUserId && backendUserId !== post.user_id);

  const [requestState, setRequestState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleSavePress = () => {
    if (!recipePayload || savedFromPost) return;
    setSaveSheetOpen(true);
  };

  const handleSaveToAtlas = (selectedCollections: string[]) => {
    if (!recipePayload || savedFromPost) return;

    const customCollections = sanitizeCustomCollections(selectedCollections);
    registerGlazeCollections(customCollections);
    const savedGlaze = communityGlazeToLibraryItem(recipePayload, {
      postId: post.id,
      sourceUserId: post.user_id,
      sourceStudioName: authorStudioForProvenance,
    }, customCollections);
    addGlaze(savedGlaze);
    recordCommunityPostSave(post.id);
    trackGlazeSavedFromCommunity({
      postId: post.id,
      glazeName: recipePayload.name,
      sourceStudio: authorStudioForProvenance,
    });
    scheduleGlazesSync();
    setSaveSheetOpen(false);
    showToast(`${recipePayload.name} saved to Glaze Atlas`, 'success');
    router.push(`/glaze/${savedGlaze.id}` as never);
  };

  const handleSendFriendRequest = async () => {
    if (!canSendFriendRequest || requestState !== 'idle') return;
    setRequestState('sending');
    try {
      await apiSendFriendRequest(post.user_id);
      setRequestState('sent');
      showToast('Friend request sent', 'success');
    } catch {
      setRequestState('idle');
      showToast('Unable to send request', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await apiDeletePost(post.id);
      removeCachedProfilePost(post.id);
      markPostDeleted();
      setDeleted(true);
      setDeleteConfirmOpen(false);
      onDeleted?.(post.id);
      showToast('Post deleted', 'success');
    } catch {
      showToast('Unable to delete post', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) return null;

  return (
    <>
      <SaveCommunityGlazeSheet
        payload={saveSheetOpen ? recipePayload : null}
        postId={saveSheetOpen ? post.id : null}
        collections={collections}
        onClose={() => setSaveSheetOpen(false)}
        onSave={handleSaveToAtlas}
      />

      <ConfirmSheet
        visible={deleteConfirmOpen}
        title="Delete post?"
        body="This will permanently remove your post from the community. This can't be undone."
        confirmLabel="Delete post"
        destructive
        loading={deleting}
        onConfirm={handleDeletePost}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <PickSheet
        visible={actionsOpen}
        title="Your post"
        options={[
          {
            label: 'Delete post',
            destructive: true,
            icon: Trash2,
            onPress: () => setDeleteConfirmOpen(true),
          },
        ]}
        onCancel={() => setActionsOpen(false)}
        layout="list"
      />

      <Card className="p-4 overflow-visible">
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-3">
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => router.push(`/user/${post.user_id}` as never)}
            className="flex-row items-center gap-3 flex-1"
          >
            <UserAvatar initial={initial} imageUri={authorAvatarUri} size={36} />
            <View className="flex-1">
              <Text className="text-xs font-bold text-foreground">{authorLabel}</Text>
              <Text className="text-xs text-muted-foreground">
                {timeAgo(post.created_at)}
                {isOwnPost ? ' · your post' : ''}
              </Text>
            </View>
          </TouchableOpacity>
          {canSendFriendRequest && (
            <TouchableOpacity
              onPress={handleSendFriendRequest}
              disabled={requestState !== 'idle'}
              className={`px-3 py-1.5 rounded-xl border ${requestState === 'sent' ? 'border-green-500 bg-green-50' : 'border-border bg-muted'}`}
              activeOpacity={0.75}
            >
              <Text className={`text-xs font-semibold ${requestState === 'sent' ? 'text-green-700' : 'text-muted-foreground'}`}>
                {requestState === 'sending' ? 'Sending...' : requestState === 'sent' ? 'Requested' : 'Add Friend'}
              </Text>
            </TouchableOpacity>
          )}
          {isOwnPost && (
            <TouchableOpacity
              onPress={() => setActionsOpen(true)}
              className="w-8 h-8 items-center justify-center -mr-1"
              activeOpacity={0.75}
              accessibilityLabel="Post options"
            >
              <MoreHorizontal size={18} color="hsl(24 20% 55%)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Image */}
        {firstAsset && (
          <Image
            source={{ uri: firstAsset.url }}
            style={{ height: 200, borderRadius: 12, marginBottom: 10 }}
            contentFit="cover"
            cachePolicy="memory-disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        )}

        {/* Content */}
        {postKindLabel ? (
          <View className="flex-row flex-wrap items-center gap-2 mb-2">
            <View className="self-start px-2.5 py-1 rounded-full bg-muted border border-border">
              <Text className="text-[10px] font-semibold text-muted-foreground">{postKindLabel}</Text>
            </View>
            {askTopicLabel ? (
              <View className="self-start px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                <Text className="text-[10px] font-semibold text-blue-700">{askTopicLabel}</Text>
              </View>
            ) : null}
            {challengeTitle ? (
              <View className="self-start px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25">
                <Text className="text-[10px] font-semibold text-primary">{challengeTitle}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
        {displayContent ? (
          <Text className="text-sm text-foreground leading-relaxed mb-3">{displayContent}</Text>
        ) : null}

        {isOwnPost && pieceJournalPayload ? (
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/pieces?openJournalPieceId=${pieceJournalPayload.pieceId}` as never)}
            activeOpacity={0.82}
            className="self-start mb-3 px-3 py-2 rounded-xl border border-primary/30 bg-primary/10"
          >
            <Text className="text-xs font-semibold text-primary">Open piece journal</Text>
          </TouchableOpacity>
        ) : null}

        {kilnPieceChips.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            className="mb-3"
          >
            {kilnPieceChips.map((pieceId, index) => {
              const name = postMeta?.kilnFiring?.pieceNames[index] ?? `Piece ${pieceId}`;
              const chip = (
                <View className="px-3 py-2 rounded-full border border-orange-300/50 bg-orange-50">
                  <Text className="text-xs font-semibold text-orange-900">{name}</Text>
                </View>
              );
              if (!isOwnPost) {
                return <View key={`${pieceId}-${index}`}>{chip}</View>;
              }
              return (
                <TouchableOpacity
                  key={`${pieceId}-${index}`}
                  onPress={() => router.push(`/(tabs)/pieces?openJournalPieceId=${pieceId}` as never)}
                  activeOpacity={0.82}
                >
                  {chip}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        {isGlazeRecipePost ? (
          <View className="mb-3">
            {saveCount > 0 ? (
              <View className="flex-row items-center gap-1.5 mb-2">
                <Users size={12} color="hsl(24 20% 55%)" />
                <Text className="text-[11px] text-muted-foreground">
                  Saved by {saveCount} potter{saveCount === 1 ? '' : 's'}
                </Text>
              </View>
            ) : null}
            {savedFromPost ? (
              <View className="flex-row items-center gap-2 rounded-xl border border-green-500/30 bg-green-50 px-3 py-2.5">
                <Check size={14} color="hsl(145 50% 38%)" />
                <Text className="text-xs font-semibold text-green-700">Saved to Glaze Atlas</Text>
              </View>
            ) : canSaveRecipe ? (
              <TouchableOpacity
                onPress={handleSavePress}
                activeOpacity={0.82}
                className="flex-row items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5"
              >
                <Bookmark size={14} color="hsl(39 57% 45%)" />
                <Text className="text-xs font-semibold text-primary">
                  Save {recipePayload.name} to atlas
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <PostReactionBar
          postId={post.id}
          initialCount={post.reaction_count ?? 0}
          initialHasReacted={post.has_reacted}
        />
      </Card>
    </>
  );
}