import { GLAZE_STATUS_ORB_THEME } from '@/src/screens/glazes/glazeStatusTheme';
import type { GlazeStatus } from '@/src/screens/glazes/types';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, type ViewStyle } from 'react-native';

type GlazeStatusOrbProps = {
  status: GlazeStatus;
  size?: 'sm' | 'md';
  style?: ViewStyle;
};

const SIZES = {
  sm: { shell: 30, orb: 20, ring: 2, shine: 6, speck: 3 },
  md: { shell: 36, orb: 26, ring: 2.5, shine: 7, speck: 4 },
} as const;

/** Glossy studio orb — celadon, honey, or blush depending on glaze status. */
export function GlazeStatusOrb({ status, size = 'sm', style }: GlazeStatusOrbProps) {
  const theme = GLAZE_STATUS_ORB_THEME[status];
  const dim = SIZES[size];
  const shellRadius = dim.shell / 2;
  const orbRadius = dim.orb / 2;

  return (
    <View
      style={[
        {
          width: dim.shell,
          height: dim.shell,
          borderRadius: shellRadius,
          backgroundColor: theme.shell,
          borderWidth: 1,
          borderColor: theme.shellBorder,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.ring,
          shadowOpacity: 0.35,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        style,
      ]}
    >
      <View
        style={{
          width: dim.orb + dim.ring * 2,
          height: dim.orb + dim.ring * 2,
          borderRadius: (dim.orb + dim.ring * 2) / 2,
          borderWidth: dim.ring,
          borderColor: theme.ring,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.glow,
        }}
      >
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={{
            width: dim.orb,
            height: dim.orb,
            borderRadius: orbRadius,
            overflow: 'hidden',
          }}
        >
          {/* Glaze shine */}
          <View
            style={{
              position: 'absolute',
              top: 2,
              left: 3,
              width: dim.shine,
              height: dim.shine,
              borderRadius: dim.shine / 2,
              backgroundColor: theme.shine,
            }}
          />
          {/* Tiny bubble speck */}
          <View
            style={{
              position: 'absolute',
              bottom: 3,
              right: 4,
              width: dim.speck,
              height: dim.speck,
              borderRadius: dim.speck / 2,
              backgroundColor: theme.speck,
            }}
          />
        </LinearGradient>
      </View>
    </View>
  );
}
