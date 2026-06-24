import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

const PROMO = {
  bg: '#FFFBF2',
  border: '#E8D9BE',
  warningBg: 'hsl(0 40% 97%)',
  warningBorder: 'hsl(0 45% 82%)',
  iconBg: 'hsl(39 55% 96%)',
  ink: 'hsl(24 25% 15%)',
  muted: 'hsl(24 20% 45%)',
  accent: 'hsl(39 57% 51%)',
} as const;

type ProfilePromoCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'default' | 'warning';
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ProfilePromoCard({
  icon,
  title,
  subtitle,
  ctaLabel = 'See plans →',
  onPress,
  accessibilityLabel,
  variant = 'default',
  footer,
  style,
}: ProfilePromoCardProps) {
  const isWarning = variant === 'warning';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          marginHorizontal: 16,
          marginBottom: 10,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: isWarning ? PROMO.warningBorder : PROMO.border,
          backgroundColor: isWarning ? PROMO.warningBg : PROMO.bg,
          paddingHorizontal: 14,
          paddingVertical: 12,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: PROMO.iconBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: PROMO.ink }}>{title}</Text>
          <Text style={{ fontSize: 12, color: PROMO.muted, marginTop: 2, lineHeight: 17 }} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '600', color: PROMO.accent, flexShrink: 0 }}>
          {ctaLabel}
        </Text>
      </View>
      {footer ? <View style={{ marginTop: 10 }}>{footer}</View> : null}
    </TouchableOpacity>
  );
}

type CloudStorageBarProps = {
  fillPct: number;
  variant: 'default' | 'warning';
};

export function ProfilePromoProgressBar({ fillPct, variant }: CloudStorageBarProps) {
  const barColor =
    variant === 'warning'
      ? 'hsl(0 55% 52%)'
      : fillPct >= 85
        ? 'hsl(32 70% 48%)'
        : PROMO.accent;

  return (
    <View
      style={{
        height: 6,
        borderRadius: 99,
        backgroundColor: 'hsl(34 30% 90%)',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.min(100, fillPct)}%`,
          height: '100%',
          borderRadius: 99,
          backgroundColor: barColor,
        }}
      />
    </View>
  );
}
