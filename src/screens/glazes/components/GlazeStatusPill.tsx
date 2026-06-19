import { Text } from '@/src/components/ui/text';
import { GlazeStatusOrb } from '@/src/screens/glazes/components/GlazeStatusOrb';
import { GLAZE_STATUS_LABELS, type GlazeStatus } from '@/src/screens/glazes/types';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type GlazeStatusPillProps = {
  status: GlazeStatus;
  active?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

const WARM = {
  activeBg: '#3A2810',
  activeBorder: '#3A2810',
  activeText: '#FFFBF4',
  idleBg: '#FFFBF4',
  idleBorder: '#E8D9BE',
  idleText: '#7A6040',
};

/** Status chip with gradient orb — matches atlas card indicators. */
export function GlazeStatusPill({
  status,
  active = false,
  onPress,
  accessibilityLabel,
}: GlazeStatusPillProps) {
  const label = GLAZE_STATUS_LABELS[status];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Status: ${label}`}
      accessibilityState={{ selected: active }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 6,
        paddingRight: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: active ? WARM.activeBorder : WARM.idleBorder,
        backgroundColor: active ? WARM.activeBg : WARM.idleBg,
      }}
    >
      <GlazeStatusOrb status={status} size="sm" />
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: active ? WARM.activeText : WARM.idleText,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** Plain text pill for "All" and non-status filters. */
export function GlazeFilterPill({
  label,
  active,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: active ? WARM.activeBorder : WARM.idleBorder,
        backgroundColor: active ? WARM.activeBg : WARM.idleBg,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: active ? WARM.activeText : WARM.idleText,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function GlazeStatusPillRow({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap gap-2">{children}</View>;
}
