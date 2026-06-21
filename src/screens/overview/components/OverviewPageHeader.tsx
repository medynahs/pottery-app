import { Text } from '@/src/components/ui/text';
import { STAGE_CONFIG } from '@/src/screens/overview/studioRythm/studioRhythm';
import { STAGE_RHYTHM_ICONS } from '@/src/screens/overview/studioRythm/studioRhythmIcons';
import { BarChart2 } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

type TodayRhythm = {
  stages: string[];
  events: unknown[];
  isEmpty: boolean;
};

type OverviewPageHeaderProps = {
  paddingTop: number;
  greeting: string;
  todayLabel: string;
  isSetupMode: boolean;
  todayRhythm: TodayRhythm;
  user: {
    name: string;
    avatarImageUri?: string | null;
    avatarInitial: string;
  };
  onAnalyticsPress: () => void;
  onProfilePress: () => void;
};

export function OverviewPageHeader({
  paddingTop,
  greeting,
  todayLabel,
  isSetupMode,
  todayRhythm,
  user,
  onAnalyticsPress,
  onProfilePress,
}: OverviewPageHeaderProps) {
  return (
    <View style={{ backgroundColor: 'transparent', paddingTop }} className="px-5 pb-1">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-4">
          <Text className="text-xs font-medium" style={{ color: 'hsl(32 45% 52%)' }}>{greeting}</Text>
          <Text className="text-[31px] font-serif font-bold text-foreground mt-0.5">Studio Ledger</Text>
          <View className="flex-row flex-wrap items-center gap-1.5 mt-2">
            {isSetupMode ? (
              <Text className="text-xs text-muted-foreground">{todayLabel} · Let&apos;s get your studio set up</Text>
            ) : todayRhythm.isEmpty ? (
              <View className="flex-row items-center gap-1">
                <Text style={{ fontSize: 13 }}>☕</Text>
                <Text className="text-xs text-muted-foreground">{todayLabel} · Rest day</Text>
              </View>
            ) : (
              <>
                <Text className="text-xs text-muted-foreground">{todayLabel} ·</Text>
                {todayRhythm.stages.map((s) => {
                  const stageKey = s as keyof typeof STAGE_CONFIG;
                  const cfg = STAGE_CONFIG[stageKey];
                  const StageIcon = STAGE_RHYTHM_ICONS[stageKey];
                  return (
                  <View
                    key={s}
                    className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                    style={{ backgroundColor: 'hsl(35 55% 86%)' }}
                  >
                    <StageIcon size={11} color={cfg.text} />
                    <Text className="text-[11px] font-medium" style={{ color: 'hsl(32 60% 35%)' }}>
                      {cfg.label}
                    </Text>
                  </View>
                );})}
              </>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onAnalyticsPress}
            activeOpacity={0.8}
            className="h-9 w-9 rounded-full items-center justify-center bg-card border border-border"
            accessibilityRole="button"
            accessibilityLabel="Open analytics"
          >
            <BarChart2 size={17} color="hsl(24 20% 45%)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onProfilePress}
            activeOpacity={0.8}
            className="h-10 w-10 rounded-full border-2 bg-primary items-center justify-center overflow-hidden"
            style={{ borderColor: 'hsl(35 45% 80%)' }}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            {user.avatarImageUri ? (
              <Image source={{ uri: user.avatarImageUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="text-primary-foreground font-semibold text-sm">{user.avatarInitial}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
