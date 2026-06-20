import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { BadgeState } from '../constants/badgeRegistry';
import { JOURNEY_ACCENTS, PROFILE_THEME } from '../profileTheme';
import { CollectionRing } from './trophyShelf/CollectionRing';

function BadgeIconStack({ badges }: { badges: BadgeState[] }) {
  const preview = useMemo(() => {
    const earned = badges.filter((badge) => badge.unlocked).slice(0, 4);
    const locked = badges
      .filter((badge) => !badge.unlocked)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, Math.max(0, 5 - earned.length));

    return [...earned, ...locked].slice(0, 5);
  }, [badges]);

  if (preview.length === 0) return null;

  return (
    <View className="flex-row items-center mt-3">
      {preview.map((badge, index) => {
        const Icon = badge.icon;
        const earned = badge.unlocked;

        return (
          <View
            key={badge.id}
            style={{
              marginLeft: index > 0 ? -9 : 0,
              zIndex: preview.length - index,
            }}
          >
            <View
              className="w-9 h-9 rounded-full items-center justify-center border-2"
              style={{
                backgroundColor: earned ? '#FFF7EC' : 'rgba(255, 247, 236, 0.72)',
                borderColor: earned ? JOURNEY_ACCENTS.badges.border : 'rgba(255, 247, 236, 0.55)',
                opacity: earned ? 1 : 0.88,
              }}
            >
              <Icon size={15} color={badge.iconColor} />
            </View>
          </View>
        );
      })}
      {badges.length > preview.length ? (
        <View
          className="w-9 h-9 rounded-full items-center justify-center border-2 -ml-2"
          style={{
            backgroundColor: 'rgba(58, 40, 16, 0.12)',
            borderColor: 'rgba(255, 247, 236, 0.35)',
          }}
        >
          <Text className="text-[10px] font-bold" style={{ color: JOURNEY_ACCENTS.badges.color }}>
            +{badges.length - preview.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function ViewAllBadgesCard({
  badges,
  onPress,
}: {
  badges: BadgeState[];
  onPress: () => void;
}) {
  const earnedCount = badges.filter((badge) => badge.unlocked).length;
  const remaining = badges.length - earnedCount;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open badge collection, ${earnedCount} of ${badges.length} earned`}
      className="mb-4 overflow-hidden rounded-[24px]"
      style={{
        shadowColor: PROFILE_THEME.shadow,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={['#F7E4B8', '#EAC477', '#C98352']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255, 247, 236, 0.55)',
          padding: 16,
        }}
      >
        <View
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full items-center justify-center"
          style={{
            backgroundColor: 'rgba(58, 40, 16, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(255, 247, 236, 0.45)',
          }}
        >
          <ChevronRight size={16} color={JOURNEY_ACCENTS.badges.color} />
        </View>

        <View className="flex-row items-center justify-between gap-3 pr-8">
          <View className="flex-1 min-w-0">
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
                Badge collection
              </Text>
            </View>

            <Text
              className="font-serif text-[20px] leading-7"
              style={{ color: PROFILE_THEME.ink }}
            >
              Open your trophy shelf
            </Text>

            <Text className="text-[11px] mt-1 leading-4 pr-2" style={{ color: 'hsl(24 40% 32%)' }}>
              {earnedCount > 0
                ? `${earnedCount} earned${remaining > 0 ? ` · ${remaining} still waiting` : ' · full set complete'}`
                : `${badges.length} milestones ready to chase`}
            </Text>

            <BadgeIconStack badges={badges} />
          </View>

          <CollectionRing earned={earnedCount} total={badges.length} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
