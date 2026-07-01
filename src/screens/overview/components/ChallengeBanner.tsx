import { Text } from '@/src/components/ui/text';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import { useChallengesQuery } from '@/src/screens/community/hooks/useChallengesQuery';
import {
  pickPrimaryChallenge,
  toChallengeDisplay,
} from '@/src/screens/community/utils/challengeDisplay';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Trophy } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';

type ChallengeBannerProps = {
  onPress: () => void;
};

export function ChallengeBanner({ onPress }: ChallengeBannerProps) {
  const challengesQuery = useChallengesQuery();

  const challenge = useMemo(() => {
    const primary = pickPrimaryChallenge(challengesQuery.data ?? []);
    if (!primary) return null;
    return toChallengeDisplay(primary);
  }, [challengesQuery.data]);

  if (challengesQuery.isLoading && !challengesQuery.data) {
    return null;
  }

  if (!challenge) {
    return null;
  }

  const emoji = challenge.emoji ?? '🏆';
  const daysLeft = challenge.daysLeft ?? 0;
  const participantLabel =
    challenge.participantCount > 0
      ? `${challenge.participantCount} potter${challenge.participantCount === 1 ? '' : 's'} joined`
      : 'Be the first to join';

  return (
    <View
      className="mb-4 rounded-[22px] overflow-hidden"
      style={{
        shadowColor: '#2d4a35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <LinearGradient
        colors={[...COMMUNITY_THEME.challengeHeroSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-start gap-3">
            <View
              className="w-10 h-10 rounded-2xl items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.22)' }}
            >
              <Trophy size={18} color="#F4FFE8" />
            </View>
            <View className="flex-1">
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  letterSpacing: 0.9,
                  color: 'rgba(244, 255, 232, 0.88)',
                  textTransform: 'uppercase',
                }}
              >
                Community challenge
              </Text>
              <Text className="font-serif text-[17px] leading-6 mt-1" style={{ color: '#F8FFF0' }}>
                {emoji} {challenge.title}
              </Text>
              <Text className="text-xs mt-1 leading-5" style={{ color: 'rgba(244, 255, 232, 0.86)' }}>
                {challenge.description}
              </Text>
              <Text className="text-[11px] mt-2 font-medium" style={{ color: 'rgba(244, 255, 232, 0.72)' }}>
                {daysLeft > 0 ? `${daysLeft} days left · ` : ''}
                {participantLabel}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.82}
            className="mt-3 rounded-xl py-2.5 flex-row items-center justify-center gap-1.5"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.92)' }}
          >
            <Sparkles size={14} color="hsl(150 35% 32%)" />
            <Text className="text-xs font-semibold" style={{ color: 'hsl(150 35% 28%)' }}>
              Join challenge
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}
