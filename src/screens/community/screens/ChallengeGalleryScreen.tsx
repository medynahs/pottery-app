import { Text } from '@/src/components/ui/text';
import { UserAvatar } from '@/src/components/UserAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import { ChallengeTrackTabs } from '@/src/screens/community/components/challenge/ChallengePhaseUI';
import { ChallengeEntryCard } from '@/src/screens/community/components/challenge/ChallengeEntryCard';
import { ACTIVE_FESTIVAL } from '@/src/screens/community/data';
import { MOCK_UNDERWATER_CHALLENGE } from '@/src/screens/community/utils/mockUnderwaterChallenge';
import { useMockChallengeStore } from '@/src/screens/community/mock/mockChallengeStore';
import { useAppStore } from '@/src/store';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChallengeGalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useAppStore((s) => s.showToast);
  const mock = useMockChallengeStore();
  const [activeTrackId, setActiveTrackId] = useState(ACTIVE_FESTIVAL.tracks[0]?.id ?? 'beginner');

  const entries = mock.getEntriesForTrack(activeTrackId);

  const canVote = mock.phase === 'voting';
  const votedEntryId = mock.getVotedEntryId(activeTrackId);

  const handleVote = (entryId: string) => {
    if (!canVote) return;
    const ok = mock.vote(activeTrackId, entryId);
    showToast(ok ? 'Vote recorded' : 'Already your pick in this track', ok ? 'success' : 'error');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1" style={{ backgroundColor: COMMUNITY_THEME.pageBg, paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3 border-b" style={{ borderColor: COMMUNITY_THEME.cardBorder }}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full border mr-2"
            style={{ backgroundColor: COMMUNITY_THEME.accentSoft, borderColor: COMMUNITY_THEME.cardBorder }}
          >
            <ChevronLeft size={20} color={COMMUNITY_THEME.inkSoft} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-serif font-bold" style={{ color: COMMUNITY_THEME.ink }}>
              {MOCK_UNDERWATER_CHALLENGE.title}
            </Text>
            <Text className="text-xs" style={{ color: COMMUNITY_THEME.inkMuted }}>
              {mock.phase === 'voting' ? 'Pick your favourite in each track' : 'Community submissions'}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {mock.phase === 'voting' ? (
            <View
              className="rounded-2xl border p-3 mb-4"
              style={{ backgroundColor: COMMUNITY_THEME.accentSoft, borderColor: COMMUNITY_THEME.cardBorder }}
            >
              <Text className="text-sm leading-relaxed" style={{ color: COMMUNITY_THEME.inkSoft }}>
                One vote per track. Your picks help choose the Beginner, Intermediate, and Advanced winners for the Hall of Fame.
              </Text>
            </View>
          ) : null}

          <ChallengeTrackTabs
            tracks={ACTIVE_FESTIVAL.tracks.map((t) => ({ id: t.id, title: t.title }))}
            activeTrackId={activeTrackId}
            onChange={setActiveTrackId}
          />

          <View className="mt-4">
            {entries.map((entry) => (
              <ChallengeEntryCard
                key={entry.id}
                entry={entry}
                voteCount={mock.getEntryVoteCount(entry.id, entry.baseVoteCount)}
                voted={votedEntryId === entry.id}
                canVote={canVote}
                onVote={() => handleVote(entry.id)}
              />
            ))}
          </View>

          {mock.phase === 'closed' ? (
            <PrimaryButton
              label="View Hall of Fame winners"
              onPress={() => router.push('/(tabs)/community' as never)}
            />
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}
