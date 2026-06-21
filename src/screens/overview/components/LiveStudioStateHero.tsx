import { Text } from '@/src/components/ui/text';
import type { QueuePreview } from '@/src/screens/overview/utils/buildQueuePreview';
import type { PulseCard } from '@/src/screens/overview/utils/oneThingCard';
import type { PetMood } from '@/src/screens/overview/utils/petMood';
import { PET_MOOD_META } from '@/src/screens/overview/utils/petMood';
import { LinearGradient } from 'expo-linear-gradient';
import type { Href } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Animated, Image, TouchableOpacity, View } from 'react-native';

const HERO_CREAM = '#FFF7EC';
const HERO_CREAM_MUTED = 'rgba(255, 244, 224, 0.82)';
const HERO_LABEL = 'rgba(255, 244, 224, 0.85)';

type StageChip = {
  label: string;
  count: number;
  route: string;
  emoji: string;
  urgent: boolean;
};

type LiveStudioStateHeroProps = {
  heroReveal: Animated.Value;
  oneThingCard: PulseCard | null;
  queuePreview: QueuePreview | null;
  pieceCount: number;
  missionsCompleted: number;
  missionsTotal: number;
  stageChips: StageChip[];
  kilnkinNudge: string;
  kilnkinName: string;
  petMood: PetMood;
  patReaction: string | null;
  onOneThingPress: (route: Href) => void;
  onStageChipPress: (route: Href) => void;
  onKilnkinPress: () => void;
  onPat: () => void;
  finishedThisMonth: number;
  onAnalyticsPress: () => void;
};

export function LiveStudioStateHero({
  heroReveal,
  oneThingCard,
  queuePreview,
  pieceCount,
  missionsCompleted,
  missionsTotal,
  stageChips,
  kilnkinNudge,
  kilnkinName,
  petMood,
  patReaction,
  onOneThingPress,
  onStageChipPress,
  onKilnkinPress,
  onPat,
  finishedThisMonth,
  onAnalyticsPress,
}: LiveStudioStateHeroProps) {
  const moodMeta = PET_MOOD_META[petMood];

  return (
    <Animated.View
      className="rounded-[28px] mb-4 overflow-hidden"
      style={{
        shadowColor: '#3a2310',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.24,
        shadowRadius: 16,
        elevation: 6,
        opacity: heroReveal,
        transform: [{
          translateY: heroReveal.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
          }),
        }],
      }}
    >
      <LinearGradient
        colors={['#B86A3C', '#7A4022']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="px-4 pt-4 pb-3">
          <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: HERO_LABEL, textTransform: 'uppercase' }}>
            Live Studio State
          </Text>
          <View className="flex-row items-start gap-3 mt-2">
            <View
              className="w-11 h-11 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 247, 236, 0.18)',
                borderWidth: 1,
                borderColor: 'rgba(255, 244, 224, 0.22)',
              }}
            >
              <Text style={{ fontSize: 21 }}>{oneThingCard?.emoji ?? '🏺'}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-serif text-[22px] leading-6" style={{ color: HERO_CREAM }}>
                {oneThingCard?.title ?? (pieceCount === 0 ? 'A quiet bench, ready to begin' : 'Steady clay day in motion')}
              </Text>
              <Text className="text-[12px] mt-1" style={{ color: HERO_CREAM_MUTED }}>
                {oneThingCard?.subtitle ?? `${pieceCount} piece${pieceCount !== 1 ? 's' : ''} currently in your studio flow`}
              </Text>
            </View>
          </View>

          {oneThingCard ? (
            <TouchableOpacity
              onPress={() => onOneThingPress(oneThingCard.route)}
              activeOpacity={0.82}
              className="rounded-2xl px-3 py-2 mt-3 self-start"
              style={{ backgroundColor: '#F2C25E' }}
            >
              <Text className="text-[11px] font-semibold" style={{ color: 'hsl(24 55% 22%)' }}>Open live status</Text>
            </TouchableOpacity>
          ) : null}

          {pieceCount > 0 ? (
            <TouchableOpacity
              onPress={onAnalyticsPress}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={`Studio Stats, ${finishedThisMonth} finished this month`}
              className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1 mt-2.5 self-start"
              style={{
                backgroundColor: 'rgba(255, 247, 236, 0.16)',
                borderWidth: 1,
                borderColor: 'rgba(255, 244, 224, 0.28)',
              }}
            >
              <TrendingUp size={12} color="#F2C25E" strokeWidth={2.5} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: HERO_CREAM }}>
                {finishedThisMonth} finished this month
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="px-4 py-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.14)' }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[10px] uppercase" style={{ letterSpacing: 0.8, color: HERO_LABEL }}>Now · Next · Blocked</Text>
            <Text className="text-[11px] font-semibold" style={{ color: '#FFEFD0' }}>{missionsCompleted}/{Math.max(missionsTotal, 1)} done</Text>
          </View>

          <View className="flex-row flex-wrap gap-1.5 mb-2.5">
            {stageChips.filter((c) => c.count > 0).slice(0, 4).map((chip) => (
              <TouchableOpacity
                key={chip.label}
                onPress={() => onStageChipPress(chip.route as Href)}
                activeOpacity={0.75}
                className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                style={{
                  backgroundColor: chip.urgent ? 'rgba(255, 220, 190, 0.24)' : 'rgba(255, 247, 236, 0.16)',
                  borderWidth: 1,
                  borderColor: chip.urgent ? 'rgba(255, 190, 140, 0.45)' : 'rgba(255, 244, 224, 0.28)',
                }}
              >
                <Text style={{ fontSize: 11 }}>{chip.emoji}</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: chip.urgent ? '#FFD4A8' : HERO_CREAM }}>{chip.count}</Text>
                <Text style={{ fontSize: 10, color: chip.urgent ? 'rgba(255, 220, 190, 0.92)' : HERO_CREAM_MUTED }}>{chip.label.toLowerCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {queuePreview ? (
            <TouchableOpacity
              onPress={() => onOneThingPress(queuePreview.route)}
              activeOpacity={0.82}
              className="flex-row items-center justify-between rounded-2xl px-3 py-2 mb-2.5"
              style={{
                backgroundColor: 'rgba(255, 247, 236, 0.14)',
                borderWidth: 1,
                borderColor: 'rgba(255, 244, 224, 0.28)',
              }}
              accessibilityRole="button"
              accessibilityLabel={queuePreview.label}
            >
              <View className="flex-row items-center gap-2 flex-1 pr-2">
                <Text style={{ fontSize: 13 }}>📋</Text>
                <Text className="text-[12px] font-medium flex-1" style={{ color: HERO_CREAM }}>
                  {queuePreview.label}
                </Text>
              </View>
              <Text className="text-[10px] font-semibold" style={{ color: '#FFD4A8' }}>View queue</Text>
            </TouchableOpacity>
          ) : null}

          <View className="rounded-2xl px-3 py-2.5 mt-1" style={{ backgroundColor: 'rgba(255, 252, 245, 0.94)' }}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-[10px] uppercase" style={{ letterSpacing: 0.8, color: 'hsl(32 35% 46%)' }}>Kilnkin note</Text>
              <Text className="text-[12px] mt-1 leading-5 text-foreground">{kilnkinNudge}</Text>
              <TouchableOpacity
                onPress={onKilnkinPress}
                activeOpacity={0.8}
                className="self-start mt-2 rounded-full px-2.5 py-1"
                style={{ backgroundColor: 'hsl(35 54% 87%)' }}
              >
                <Text className="text-[11px] font-medium" style={{ color: 'hsl(33 45% 30%)' }}>Visit {kilnkinName}</Text>
              </TouchableOpacity>
            </View>

            <View className="items-center">
              <TouchableOpacity
                onPress={onKilnkinPress}
                onLongPress={onPat}
                delayLongPress={400}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`${kilnkinName}, ${moodMeta.label}. Tap to visit.`}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: moodMeta.avatarBg,
                  borderWidth: 2,
                  borderColor: moodMeta.cardBorder,
                }}
              >
                <Image
                  source={require('../../../../assets/images/clay-pet.png')}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: moodMeta.cardBorder,
                  }}
                >
                  <Text style={{ fontSize: 8 }}>{moodMeta.badge}</Text>
                </View>
              </TouchableOpacity>
              {patReaction ? (
                <Text
                  numberOfLines={1}
                  style={{ maxWidth: 92, marginTop: 6, fontSize: 10, color: 'hsl(32 60% 34%)', fontWeight: '600' }}
                >
                  {patReaction}
                </Text>
              ) : null}
            </View>
          </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
