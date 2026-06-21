import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronDown, Sparkles, Trophy, Zap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { groupBadgesByCategory } from './constants/badgeRegistry';
import { useBadgeStates } from './hooks/useBadgeStates';
import { useProfileLevel } from './hooks/useProfileLevel';
import { CollectionRing } from './components/trophyShelf/CollectionRing';
import { TrophyShelfSection } from './components/trophyShelf/TrophyShelfSection';
import { JOURNEY_ACCENTS, PROFILE_THEME } from './profileTheme';

type ShelfFilter = 'all' | 'earned' | 'locked';

const FILTER_OPTIONS: { id: ShelfFilter; label: string }[] = [
  { id: 'all', label: 'Full shelf' },
  { id: 'earned', label: 'Earned' },
  { id: 'locked', label: 'Still waiting' },
];

export default function TrophyShelfScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const badges = useBadgeStates();
  const level = useProfileLevel();
  const [filter, setFilter] = useState<ShelfFilter>('all');

  const earnedCount = badges.filter((badge) => badge.unlocked).length;
  const collectionPct = badges.length > 0 ? Math.round((earnedCount / badges.length) * 100) : 0;

  const groups = useMemo(() => {
    const filtered =
      filter === 'earned'
        ? badges.filter((badge) => badge.unlocked)
        : filter === 'locked'
          ? badges.filter((badge) => !badge.unlocked)
          : badges;

    return groupBadgesByCategory(filtered).filter((group) => group.badges.length > 0);
  }, [badges, filter]);

  return (
    <View className="flex-1" style={{ backgroundColor: PROFILE_THEME.pageBg }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          backgroundColor: PROFILE_THEME.pageBg,
          borderBottomWidth: 1,
          borderBottomColor: PROFILE_THEME.cardBorder,
        }}
      >
        <View className="px-4 pb-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full mr-3 border"
              style={{
                backgroundColor: PROFILE_THEME.accentSoft,
                borderColor: PROFILE_THEME.cardBorder,
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ChevronDown
                size={20}
                color={PROFILE_THEME.inkSoft}
                style={{ transform: [{ rotate: '90deg' }] }}
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                  color: PROFILE_THEME.inkMuted,
                  textTransform: 'uppercase',
                }}
              >
                Studio journey
              </Text>
              <Text className="font-serif text-[22px] leading-7" style={{ color: PROFILE_THEME.ink }}>
                Trophy shelf
              </Text>
            </View>
            <Trophy size={22} color={PROFILE_THEME.accent} />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <LinearGradient
          colors={['#F5E8C8', '#E8D4A8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 14,
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: 'rgba(255, 247, 236, 0.55)',
            shadowColor: PROFILE_THEME.shadow,
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.16,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Sparkles size={13} color={JOURNEY_ACCENTS.badges.color} />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 1.1,
                    color: JOURNEY_ACCENTS.badges.color,
                    textTransform: 'uppercase',
                  }}
                >
                  Your collection
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Zap size={16} color={PROFILE_THEME.gold} />
                <Text className="font-serif text-[24px] leading-8" style={{ color: PROFILE_THEME.ink }}>
                  {level.title}
                </Text>
              </View>
              <Text className="text-[12px] mt-1 leading-5" style={{ color: 'hsl(24 40% 32%)' }}>
                {level.nextTitle
                  ? `${level.badgesUntilNext} more badge${level.badgesUntilNext === 1 ? '' : 's'} until ${level.nextTitle}`
                  : 'Every trophy on the shelf — studio legend.'}
              </Text>
            </View>
            <CollectionRing earned={earnedCount} total={badges.length} size={78} stroke={7} />
          </View>

          <View className="h-2 rounded-full overflow-hidden mt-4 mb-2" style={{ backgroundColor: 'rgba(58, 40, 16, 0.12)' }}>
            <View
              className="h-full rounded-full"
              style={{ width: `${collectionPct}%`, backgroundColor: PROFILE_THEME.gold }}
            />
          </View>
          <Text className="text-[11px] font-semibold" style={{ color: JOURNEY_ACCENTS.badges.color }}>
            {collectionPct}% of the full set displayed
          </Text>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}
          className="mb-4"
        >
          {FILTER_OPTIONS.map((option) => {
            const active = filter === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => setFilter(option.id)}
                activeOpacity={0.82}
                className="rounded-full px-4 py-2 border"
                style={{
                  backgroundColor: active ? JOURNEY_ACCENTS.badges.color : PROFILE_THEME.chipIdleBg,
                  borderColor: active ? JOURNEY_ACCENTS.badges.color : PROFILE_THEME.cardBorder,
                }}
              >
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: active ? '#FFF7EC' : PROFILE_THEME.inkSoft }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="px-4">
          {groups.length > 0 ? (
            groups.map((group) => (
              <TrophyShelfSection
                key={group.category}
                category={group.category}
                label={group.label}
                badges={group.badges}
              />
            ))
          ) : (
            <View
              className="rounded-[24px] border px-5 py-8 items-center"
              style={{
                backgroundColor: PROFILE_THEME.cardBg,
                borderColor: PROFILE_THEME.cardBorder,
              }}
            >
              <Trophy size={28} color={PROFILE_THEME.inkMuted} />
              <Text className="font-serif text-lg mt-3" style={{ color: PROFILE_THEME.ink }}>
                Nothing on this shelf yet
              </Text>
              <Text className="text-[12px] text-center mt-1 leading-5" style={{ color: PROFILE_THEME.inkMuted }}>
                {filter === 'earned'
                  ? 'Keep making, firing, and logging — trophies will land here.'
                  : 'You have unlocked every badge in this view.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
