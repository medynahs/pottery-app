import { Text } from '@/src/components/ui/text';
import { ANALYTICS_THEME } from '@/src/screens/analytics/analyticsTheme';
import { Crown } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

const BAR_HEIGHTS = [7, 11, 15] as const;

function StatsBars({ muted }: { muted?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2.5, height: 15 }}>
      {BAR_HEIGHTS.map((height, index) => (
        <View
          key={height}
          style={{
            width: 3.5,
            height,
            borderRadius: 1.5,
            backgroundColor: index === BAR_HEIGHTS.length - 1
              ? ANALYTICS_THEME.gold
              : ANALYTICS_THEME.accent,
            opacity: muted ? 0.55 : 1,
          }}
        />
      ))}
    </View>
  );
}

type StudioStatsHeaderButtonProps = {
  onPress: () => void;
  isPremium?: boolean;
};

export function StudioStatsHeaderButton({
  onPress,
  isPremium = false,
}: StudioStatsHeaderButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={isPremium ? 'Studio Stats' : 'Studio Stats, Premium feature'}
      className="h-10 flex-row items-center gap-2 pl-2.5 pr-3 rounded-2xl border"
      style={{
        backgroundColor: ANALYTICS_THEME.accentSoft,
        borderColor: isPremium ? ANALYTICS_THEME.cardBorder : 'hsl(39 45% 72%)',
        shadowColor: ANALYTICS_THEME.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        className="w-7 h-7 rounded-xl items-center justify-center"
        style={{
          backgroundColor: ANALYTICS_THEME.cardBg,
          borderWidth: 1,
          borderColor: ANALYTICS_THEME.cardBorder,
        }}
      >
        <StatsBars muted={!isPremium} />
      </View>
      <Text
        className="text-xs font-semibold"
        style={{ color: ANALYTICS_THEME.inkSoft }}
      >
        Stats
      </Text>
      {!isPremium ? (
        <View
          className="absolute -top-1 -right-1 flex-row items-center gap-0.5 px-1.5 py-0.5 rounded-full border"
          style={{
            backgroundColor: ANALYTICS_THEME.gold,
            borderColor: ANALYTICS_THEME.cardBg,
          }}
        >
          <Crown size={8} color={ANALYTICS_THEME.ink} strokeWidth={2.5} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
