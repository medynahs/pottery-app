import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

const SILHOUETTE_COLOR = '#B8653A';
const SILHOUETTE_OPACITY = 0.52;

type SilhouetteProps = {
  size?: number;
  color?: string;
  opacity?: number;
};

function BowlSilhouette({
  size = 36,
  color = SILHOUETTE_COLOR,
  opacity = SILHOUETTE_OPACITY,
}: SilhouetteProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4.5 12.5C4.5 9.5 12 7 19.5 12.5C18.5 17.5 12.5 19.5 6 17.5C4.8 16.2 4.5 14.2 4.5 12.5Z"
        fill={color}
        opacity={opacity}
      />
      <Path
        d="M6 12.5C12 14.5 18 12.5 18 12.5"
        stroke={color}
        strokeWidth={1.2}
        opacity={opacity * 0.7}
        fill="none"
      />
    </Svg>
  );
}

function MugSilhouette({
  size = 36,
  color = SILHOUETTE_COLOR,
  opacity = SILHOUETTE_OPACITY,
}: SilhouetteProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6.5 8.5H15.5V20.5H6.5V8.5Z"
        fill={color}
        opacity={opacity}
      />
      <Path
        d="M15.5 10.5C19 11.5 19.5 15 16.5 17C15.5 17.8 15.5 16.5 15.5 15.5V10.5Z"
        fill={color}
        opacity={opacity}
      />
      <Path
        d="M8 8.5V7C8 5.8 9.2 5 11 5H12"
        stroke={color}
        strokeWidth={1.4}
        opacity={opacity * 0.85}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function VaseSilhouette({
  size = 36,
  color = SILHOUETTE_COLOR,
  opacity = SILHOUETTE_OPACITY,
}: SilhouetteProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9.5 4.5H14.5L16.5 19.5C15.5 21 8.5 21 7.5 19.5L9.5 4.5Z"
        fill={color}
        opacity={opacity}
      />
      <Path
        d="M9.5 4.5H14.5"
        stroke={color}
        strokeWidth={1.2}
        opacity={opacity * 0.9}
      />
    </Svg>
  );
}

function PlateSilhouette({
  size = 36,
  color = SILHOUETTE_COLOR,
  opacity = SILHOUETTE_OPACITY,
}: SilhouetteProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Ellipse cx={12} cy={12} rx={9.5} ry={3.8} fill={color} opacity={opacity} />
      <Ellipse
        cx={12}
        cy={11.2}
        rx={6.5}
        ry={2.2}
        fill={color}
        opacity={opacity * 0.45}
      />
    </Svg>
  );
}

function WireToolSilhouette({
  size = 36,
  color = SILHOUETTE_COLOR,
  opacity = SILHOUETTE_OPACITY,
}: SilhouetteProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5.5 17.5C8 13.5 16 10.5 18.5 6.5"
        stroke={color}
        strokeWidth={1.5}
        opacity={opacity}
        fill="none"
        strokeLinecap="round"
      />
      <Ellipse cx={5.5} cy={17.5} rx={2.2} ry={1.6} fill={color} opacity={opacity} />
      <Ellipse cx={18.5} cy={6.5} rx={2.2} ry={1.6} fill={color} opacity={opacity} />
    </Svg>
  );
}

function RibSilhouette({
  size = 36,
  color = SILHOUETTE_COLOR,
  opacity = SILHOUETTE_OPACITY,
}: SilhouetteProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7 5.5C16 8.5 16 15.5 7 18.5C9 13 9 11 7 5.5Z"
        fill={color}
        opacity={opacity}
      />
    </Svg>
  );
}

const RING_ITEMS: Array<{
  angle: number;
  Silhouette: React.ComponentType<SilhouetteProps>;
  size: number;
}> = [
  { angle: -90, Silhouette: BowlSilhouette, size: 38 },
  { angle: -30, Silhouette: MugSilhouette, size: 36 },
  { angle: 30, Silhouette: VaseSilhouette, size: 34 },
  { angle: 90, Silhouette: PlateSilhouette, size: 40 },
  { angle: 150, Silhouette: WireToolSilhouette, size: 36 },
  { angle: 210, Silhouette: RibSilhouette, size: 34 },
];

type SplashPotteryRingProps = {
  size?: number;
};

export function SplashPotteryRing({ size = 320 }: SplashPotteryRingProps) {
  const center = size / 2;
  const radius = size * 0.4125;

  return (
    <View style={[styles.ring, { width: size, height: size }]}>
      {RING_ITEMS.map(({ angle, Silhouette, size: iconSize }) => {
        const rad = (angle * Math.PI) / 180;
        const left = center + radius * Math.cos(rad) - iconSize / 2;
        const top = center + radius * Math.sin(rad) - iconSize / 2;

        return (
          <View
            key={angle}
            style={[
              styles.item,
              {
                left,
                top,
                width: iconSize,
                height: iconSize,
              },
            ]}
          >
            <Silhouette size={iconSize} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    height: '100%',
    width: '100%',
  },
  item: {
    position: 'absolute',
  },
});
