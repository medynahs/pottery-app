import { STUDIO_BACKDROP_COLOR } from '@/src/components/potteryStudioArt';
import { StudioOrnamentBackdrop } from '@/src/components/StudioOrnamentBackdrop';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

type StudioTabScreenProps = ViewProps & {
  children: React.ReactNode;
  ornamentOpacity?: number;
};

export function StudioTabScreen({
  children,
  ornamentOpacity = 0.34,
  style,
  ...props
}: StudioTabScreenProps) {
  return (
    <View className="flex-1" style={[{ backgroundColor: STUDIO_BACKDROP_COLOR }, style]} {...props}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <StudioOrnamentBackdrop opacity={ornamentOpacity} />
      </View>
      {children}
    </View>
  );
}
