import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import type { MockHallOfFameWinner } from '@/src/screens/community/mock/challengeMockTypes';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export function HallOfFameWinnerCard({
  winner,
  compact,
}: {
  winner: MockHallOfFameWinner;
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/hall-of-fame-winner/${winner.id}` as never)}
      className="rounded-2xl border overflow-hidden mb-2"
      style={{
        backgroundColor: COMMUNITY_THEME.cardBg,
        borderColor: COMMUNITY_THEME.cardBorder,
      }}
    >
      <View className="flex-row">
        <Image
          source={winner.imageSource}
          style={{ width: compact ? 72 : 88, height: compact ? 72 : 88 }}
          contentFit="cover"
        />
        <View className="flex-1 p-3 justify-center">
          <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COMMUNITY_THEME.accent }}>
            {winner.trackTitle}
          </Text>
          <Text className="text-sm font-bold mt-0.5" style={{ color: COMMUNITY_THEME.ink }}>
            {winner.pieceTitle}
          </Text>
          <Text className="text-xs mt-1" style={{ color: COMMUNITY_THEME.inkSoft }}>
            {winner.artistName} · {winner.voteCount} votes
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function HallOfFameFeaturedHero({ winner }: { winner: MockHallOfFameWinner }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/hall-of-fame-winner/${winner.id}` as never)}
      className="rounded-3xl overflow-hidden border mb-4"
      style={{ borderColor: COMMUNITY_THEME.cardBorder }}
    >
      <Image source={winner.heroImage} style={{ width: '100%', height: 160 }} contentFit="cover" />
      <LinearGradient
        colors={['#2A6B7C', '#134252']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 18 }}
      >
        <View className="flex-row items-center gap-2 mb-2">
          <Trophy size={14} color={COMMUNITY_THEME.heroText} />
          <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COMMUNITY_THEME.heroLabel }}>
            Latest winners · {winner.challengeTitle}
          </Text>
        </View>
        <Text className="text-xl font-serif font-bold" style={{ color: COMMUNITY_THEME.heroText }}>
          {winner.trackTitle}, {winner.pieceTitle}
        </Text>
        <View className="flex-row items-center gap-2 mt-3">
          <UserAvatar initial={winner.artistName.slice(0, 1)} size={32} />
          <Text className="text-sm font-semibold" style={{ color: COMMUNITY_THEME.heroMuted }}>
            {winner.artistName} · {winner.studioName}
          </Text>
        </View>
        <View className="mt-4">
          <PrimaryButton
            label="View winner story"
            onPress={() => router.push(`/hall-of-fame-winner/${winner.id}` as never)}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
