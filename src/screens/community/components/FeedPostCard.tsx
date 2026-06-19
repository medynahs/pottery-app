// src/screens/community/components/FeedPostCard.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { SaveCommunityGlazeSheet } from '@/src/screens/community/components/SaveCommunityGlazeSheet';
import { communityGlazeToLibraryItem } from '@/src/screens/community/utils/saveCommunityGlaze';
import {
  deriveCustomCollectionNames,
  sanitizeCustomCollections,
} from '@/src/screens/library/atlas/collections';
import { scheduleGlazesSync } from '@/src/screens/library/useGlazesSync';
import {
  isCommunityGlazePostSaved,
  isSavableGlazeRecipePayload,
  parseGlazeRecipeFromPost,
  stripPayloadFromDisplay,
} from '@/src/screens/glazes/shareGlazeRecipe/glazePostPayload';
import { apiAddReaction, apiRemoveReaction } from '@/src/services/community';
import { apiSendFriendRequest } from '@/src/services/friends';
import { useAppStore } from '@/src/store';
import { canAddGlaze, PremiumFeature } from '@/src/utils/premiumGate';
import { Image } from 'expo-image';
import { Bookmark, Check, MessageCircle, Users } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { BackendFeedPost } from '../../../services/community';

// ─── Pottery reactions ────────────────────────────────────────────────────────

type ReactionKey = 'fired' | 'glazed' | 'centered' | 'thrown';

const REACTIONS: { key: ReactionKey; emoji: string; label: string; activeColor: string }[] = [
  { key: 'fired',    emoji: '🔥', label: 'Kiln it!',       activeColor: 'hsl(39 57% 51%)'  },
  { key: 'glazed',   emoji: '✨', label: 'Glaze-mazing!',  activeColor: 'hsl(213 75% 52%)' },
  { key: 'centered', emoji: '🎯', label: 'Well Centered!', activeColor: 'hsl(145 50% 42%)' },
  { key: 'thrown',   emoji: '💫', label: 'Spin the Wheel!', activeColor: 'hsl(270 55% 52%)' },
];

// ─── Single reaction button ───────────────────────────────────────────────────

function ReactionButton({
  emoji,
  label,
  activeColor,
  isActive,
  count,
  disabled,
  onPress,
}: {
  emoji: string;
  label: string;
  activeColor: string;
  isActive: boolean;
  count: number;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [showLabel, setShowLabel] = useState(false);
  const labelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = () => {
    if (disabled) return;
    onPress();
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.5, duration: 100, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
    // keep the label visible for at least 2.5s regardless of API outcome
    if (labelTimer.current) clearTimeout(labelTimer.current);
    setShowLabel(true);
    labelTimer.current = setTimeout(() => setShowLabel(false), 2500);
  };

  const labelVisible = isActive || showLabel;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
    >
      <Animated.Text style={{ fontSize: 20, transform: [{ scale }] }}>
        {emoji}
      </Animated.Text>
      {labelVisible && (
        <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? activeColor : 'hsl(24 20% 50%)' }}>
          {isActive && count > 0 ? `${count} · ${label}` : label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

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
  sessionToken: string;
}

export function FeedPostCard({ post, sessionToken }: Props) {
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
  const { requestAccess, PaywallGate } = usePremiumGate();
  const { trackGlazeSavedFromCommunity } = useAnalytics();

  const recipePayload = React.useMemo(
    () => (post.content ? parseGlazeRecipeFromPost(post.content) : null),
    [post.content],
  );
  const displayContent = React.useMemo(
    () => (post.content ? stripPayloadFromDisplay(post.content) : ''),
    [post.content],
  );
  const firstAsset = post.assets?.[0];
  const initial = post.user_id.slice(0, 1).toUpperCase();
  const isOwnPost = Boolean(backendUserId && backendUserId === post.user_id);
  const savedFromPost = isCommunityGlazePostSaved(post.id, glazes.map((g) => g.id));
  const canSaveRecipe = isSavableGlazeRecipePayload(recipePayload) && !savedFromPost;
  const collections = React.useMemo(
    () => deriveCustomCollectionNames(glazes, glazeCollectionNames),
    [glazes, glazeCollectionNames],
  );
  const authorLabel = isOwnPost
    ? (user.studioName?.trim() || user.name?.trim() || 'You')
    : 'Community Member';
  const authorStudioForProvenance = isOwnPost
    ? (user.studioName?.trim() || user.name?.trim() || 'Your studio')
    : authorLabel;
  const saveCount = Math.max(post.save_count ?? 0, communityPostSaveCounts[post.id] ?? 0);
  const isGlazeRecipePost = isSavableGlazeRecipePayload(recipePayload);
  const canSendFriendRequest = Boolean(backendUserId && backendUserId !== post.user_id);

  const [selectedReaction, setSelectedReaction] = useState<ReactionKey | null>(
    post.has_reacted ? 'fired' : null,
  );
  const [reactionCount, setReactionCount] = useState(post.reaction_count ?? 0);
  const [reacting, setReacting] = useState(false);
  const [requestState, setRequestState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);

  const handleSavePress = () => {
    if (!recipePayload || savedFromPost) return;
    if (!canAddGlaze(glazes)) {
      requestAccess(PremiumFeature.FullGlazeAtlas);
      return;
    }
    setSaveSheetOpen(true);
  };

  const handleSaveToAtlas = (selectedCollections: string[]) => {
    if (!recipePayload || savedFromPost) return;
    if (!canAddGlaze(glazes)) {
      requestAccess(PremiumFeature.FullGlazeAtlas);
      return;
    }

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
      await apiSendFriendRequest(sessionToken, post.user_id);
      setRequestState('sent');
      showToast('Friend request sent', 'success');
    } catch {
      setRequestState('idle');
      showToast('Unable to send request', 'error');
    }
  };

  const handleReaction = async (key: ReactionKey) => {
    if (reacting) return;
    setReacting(true);

    const isSame = selectedReaction === key;
    const wasReacted = selectedReaction !== null;

    setSelectedReaction(isSame ? null : key);
    setReactionCount((c) => {
      if (isSame) return Math.max(0, c - 1);
      if (!wasReacted) return c + 1;
      return c;
    });

    try {
      if (isSame) {
        await apiRemoveReaction(sessionToken, post.id);
      } else if (!wasReacted) {
        await apiAddReaction(sessionToken, post.id);
      }
    } catch {
      setSelectedReaction(wasReacted ? (isSame ? key : selectedReaction) : null);
      setReactionCount((c) => {
        if (isSame) return c + 1;
        if (!wasReacted) return Math.max(0, c - 1);
        return c;
      });
    } finally {
      setReacting(false);
    }
  };

  return (
    <>
      {PaywallGate}
      <SaveCommunityGlazeSheet
        payload={saveSheetOpen ? recipePayload : null}
        postId={saveSheetOpen ? post.id : null}
        collections={collections}
        onClose={() => setSaveSheetOpen(false)}
        onSave={handleSaveToAtlas}
      />

      <Card className="p-4">
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-3">
        <UserAvatar initial={initial} size={36} />
        <View className="flex-1">
          <Text className="text-xs font-bold text-foreground">{authorLabel}</Text>
          <Text className="text-xs text-muted-foreground">
            {timeAgo(post.created_at)}
            {isOwnPost ? ' · your post' : ''}
          </Text>
        </View>
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
      {displayContent ? (
        <Text className="text-sm text-foreground leading-relaxed mb-3">{displayContent}</Text>
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

      {/* Reactions row */}
      <View className="flex-row items-center">
        <View className="flex-row items-center gap-5">
          {REACTIONS.map(({ key, emoji, label, activeColor }) => (
            <ReactionButton
              key={key}
              emoji={emoji}
              label={label}
              activeColor={activeColor}
              isActive={selectedReaction === key}
              count={reactionCount}
              disabled={reacting}
              onPress={() => handleReaction(key)}
            />
          ))}
        </View>

        {/* Comment count — right side */}
        <View style={{ flex: 1 }} />
        <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
          <MessageCircle size={16} color="hsl(24 20% 55%)" />
          <Text className="text-xs text-muted-foreground">{post.comment_count ?? 0}</Text>
        </TouchableOpacity>
      </View>
    </Card>
    </>
  );
}