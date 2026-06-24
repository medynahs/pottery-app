import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import { findMockWinner } from '@/src/screens/community/mock/challengeMockData';
import { mockWinnerToDisplay } from '@/src/screens/community/utils/challengeWinners';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChevronLeft, Heart, Trophy } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HallOfFameWinnerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const rawWinner = id ? findMockWinner(id) : null;
  const winner = rawWinner ? mockWinnerToDisplay(rawWinner) : null;

  if (!winner) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COMMUNITY_THEME.pageBg }}>
        <Text className="text-base font-bold" style={{ color: COMMUNITY_THEME.ink }}>
          Winner not found
        </Text>
      </View>
    );
  }

  const wonDate = new Date(winner.wonAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1" style={{ backgroundColor: COMMUNITY_THEME.pageBg }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={{ paddingTop: insets.top }}>
            <Image source={winner.heroImage} style={{ width: '100%', height: 220 }} contentFit="cover" />
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: 'absolute',
                top: insets.top + 8,
                left: 16,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,251,242,0.92)',
                borderWidth: 1,
                borderColor: COMMUNITY_THEME.cardBorder,
              }}
            >
              <ChevronLeft size={20} color={COMMUNITY_THEME.inkSoft} />
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={['#2A6B7C', '#134252']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 20, paddingVertical: 22 }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Text style={{ fontSize: 22 }}>{winner.challengeEmoji}</Text>
              <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: COMMUNITY_THEME.heroLabel }}>
                {winner.challengeLabel}
              </Text>
            </View>
            <Text className="text-2xl font-serif font-bold" style={{ color: COMMUNITY_THEME.heroText }}>
              {winner.challengeTitle}
            </Text>
            <Text className="text-sm leading-relaxed mt-2" style={{ color: COMMUNITY_THEME.heroMuted }}>
              {winner.challengeDescription}
            </Text>
          </LinearGradient>

          <View className="px-5 pt-5">
            <View className="flex-row items-center gap-2 mb-4">
              <Trophy size={16} color={COMMUNITY_THEME.accent} />
              <Text className="text-sm font-bold" style={{ color: COMMUNITY_THEME.ink }}>
                {winner.trackTitle} winner
              </Text>
            </View>

            <Image
              source={winner.imageSource}
              style={{ width: '100%', height: 260, borderRadius: 20 }}
              contentFit="cover"
            />

            <Text className="text-2xl font-serif font-bold mt-4" style={{ color: COMMUNITY_THEME.ink }}>
              {winner.pieceTitle}
            </Text>

            <View className="flex-row items-center gap-3 mt-3 mb-4">
              <UserAvatar initial={winner.artistName.slice(0, 1)} size={40} />
              <View className="flex-1">
                <Text className="text-sm font-bold" style={{ color: COMMUNITY_THEME.ink }}>
                  {winner.artistName}
                </Text>
                <Text className="text-xs" style={{ color: COMMUNITY_THEME.inkMuted }}>
                  {winner.studioName}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mb-5">
              <View
                className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5 border"
                style={{ borderColor: COMMUNITY_THEME.cardBorder, backgroundColor: COMMUNITY_THEME.cardBg }}
              >
                <Heart size={12} color={COMMUNITY_THEME.accent} fill={COMMUNITY_THEME.accent} />
                <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.inkSoft }}>
                  {winner.voteCount} community votes
                </Text>
              </View>
              <View
                className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5 border"
                style={{ borderColor: COMMUNITY_THEME.cardBorder, backgroundColor: COMMUNITY_THEME.cardBg }}
              >
                <Calendar size={12} color={COMMUNITY_THEME.inkMuted} />
                <Text className="text-xs font-semibold" style={{ color: COMMUNITY_THEME.inkSoft }}>
                  {wonDate}
                </Text>
              </View>
            </View>

            <Text
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: COMMUNITY_THEME.inkMuted }}
            >
              Artist statement
            </Text>
            <Text className="text-sm leading-relaxed" style={{ color: COMMUNITY_THEME.inkSoft }}>
              {winner.processNote}
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
