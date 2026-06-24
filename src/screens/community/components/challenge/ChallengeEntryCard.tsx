import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import type { ChallengeEntryDisplay } from '@/src/screens/community/types';
import { Image } from 'expo-image';
import { Heart, Trophy } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type Props = {
  entry: ChallengeEntryDisplay;
  voteCount: number;
  voted: boolean;
  canVote: boolean;
  onPress?: () => void;
  onVote?: () => void;
  showRank?: boolean;
};

export function ChallengeEntryCard({
  entry,
  voteCount,
  voted,
  canVote,
  onPress,
  onVote,
  showRank = true,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.88 : 1}
      onPress={onPress}
      disabled={!onPress}
      className="rounded-3xl border overflow-hidden mb-3"
      style={{
        backgroundColor: COMMUNITY_THEME.cardBg,
        borderColor: voted ? COMMUNITY_THEME.accent : COMMUNITY_THEME.cardBorder,
      }}
    >
      <Image
        source={entry.imageSource}
        style={{ width: '100%', height: 180 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-2 mb-2">
          <View className="flex-1">
            {showRank && entry.rank ? (
              <View className="flex-row items-center gap-1.5 mb-1">
                {entry.rank === 1 ? <Trophy size={12} color={COMMUNITY_THEME.accent} /> : null}
                <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COMMUNITY_THEME.inkMuted }}>
                  #{entry.rank} · {entry.trackTitle}
                </Text>
              </View>
            ) : (
              <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: COMMUNITY_THEME.inkMuted }}>
                {entry.trackTitle}
              </Text>
            )}
            <Text className="text-base font-bold" style={{ color: COMMUNITY_THEME.ink }}>
              {entry.pieceTitle}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Heart size={14} color={voted ? COMMUNITY_THEME.accent : COMMUNITY_THEME.inkMuted} fill={voted ? COMMUNITY_THEME.accent : 'transparent'} />
            <Text className="text-sm font-bold" style={{ color: COMMUNITY_THEME.inkSoft }}>
              {voteCount}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mb-2">
          <UserAvatar initial={entry.artistName.slice(0, 1)} size={28} />
          <View>
            <Text className="text-xs font-bold" style={{ color: COMMUNITY_THEME.ink }}>
              {entry.artistName}
            </Text>
            {entry.studioName ? (
              <Text className="text-[11px]" style={{ color: COMMUNITY_THEME.inkMuted }}>
                {entry.studioName}
              </Text>
            ) : null}
          </View>
        </View>

        {entry.processNote ? (
          <Text className="text-xs leading-relaxed mb-3" style={{ color: COMMUNITY_THEME.inkSoft }} numberOfLines={3}>
            {entry.processNote}
          </Text>
        ) : null}

        {canVote ? (
          <TouchableOpacity
            onPress={onVote}
            activeOpacity={0.85}
            className="rounded-2xl py-3 items-center border"
            style={{
              backgroundColor: voted ? COMMUNITY_THEME.accentSoft : COMMUNITY_THEME.chipIdleBg,
              borderColor: voted ? COMMUNITY_THEME.accent : COMMUNITY_THEME.cardBorder,
            }}
          >
            <Text className="text-sm font-bold" style={{ color: voted ? COMMUNITY_THEME.accent : COMMUNITY_THEME.inkSoft }}>
              {voted ? 'Your vote' : 'Vote for this piece'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
