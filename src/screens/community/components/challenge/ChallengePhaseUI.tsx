import { Text } from '@/src/components/ui/text';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import type { ChallengePhase } from '@/src/screens/community/types';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

const PHASE_STYLES: Record<ChallengePhase, { bg: string; text: string; label: string }> = {
  open: {
    bg: 'hsl(142 40% 90%)',
    text: 'hsl(142 45% 28%)',
    label: 'Submissions open',
  },
  voting: {
    bg: 'hsl(213 45% 92%)',
    text: 'hsl(213 50% 32%)',
    label: 'Voting open',
  },
  closed: {
    bg: 'hsl(44 70% 90%)',
    text: 'hsl(35 65% 30%)',
    label: 'Winners announced',
  },
};

export function ChallengePhaseChip({
  phase,
  subtitle,
}: {
  phase: ChallengePhase;
  subtitle?: string;
}) {
  const style = PHASE_STYLES[phase];
  return (
    <View
      className="self-start rounded-full px-3 py-1.5"
      style={{ backgroundColor: style.bg }}
    >
      <Text className="text-[11px] font-bold" style={{ color: style.text }}>
        {style.label}
        {subtitle ? ` · ${subtitle}` : ''}
      </Text>
    </View>
  );
}

export function ChallengeTrackTabs({
  tracks,
  activeTrackId,
  onChange,
}: {
  tracks: { id: string; title: string }[];
  activeTrackId: string;
  onChange: (trackId: string) => void;
}) {
  return (
    <View className="flex-row gap-2 flex-wrap">
      {tracks.map((track) => {
        const active = track.id === activeTrackId;
        return (
          <TouchableOpacity
            key={track.id}
            onPress={() => onChange(track.id)}
            activeOpacity={0.82}
            className="rounded-2xl px-3.5 py-2 border"
            style={{
              backgroundColor: active ? COMMUNITY_THEME.chipActiveBg : COMMUNITY_THEME.chipIdleBg,
              borderColor: active ? COMMUNITY_THEME.chipActiveBg : COMMUNITY_THEME.cardBorder,
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: active ? COMMUNITY_THEME.heroText : COMMUNITY_THEME.inkSoft }}
            >
              {track.title.replace(' Track', '')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function ChallengePhaseDevBar({
  phase,
  onChange,
}: {
  phase: ChallengePhase;
  onChange: (phase: ChallengePhase) => void;
}) {
  if (!__DEV__) return null;

  const options: ChallengePhase[] = ['open', 'voting', 'closed'];
  return (
    <View
      className="rounded-2xl border p-3 mb-3 gap-2"
      style={{ backgroundColor: 'hsl(195 40% 94%)', borderColor: 'hsl(195 30% 82%)' }}
    >
      <Text className="text-[11px] font-bold" style={{ color: 'hsl(195 45% 32%)' }}>
        Preview, switch challenge phase
      </Text>
      <View className="flex-row gap-2">
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            className="flex-1 rounded-xl py-2 items-center border"
            style={{
              backgroundColor: phase === option ? COMMUNITY_THEME.chipActiveBg : '#fff',
              borderColor: phase === option ? COMMUNITY_THEME.chipActiveBg : COMMUNITY_THEME.cardBorder,
            }}
          >
            <Text
              className="text-[11px] font-bold capitalize"
              style={{ color: phase === option ? COMMUNITY_THEME.heroText : COMMUNITY_THEME.inkSoft }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
