import { Text } from '@/src/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const STONE_WIDTH = 252;
const STONE_BOTTOM = 262;
const PLINTH_HEIGHT = 14;
const PLINTH_BOTTOM = STONE_BOTTOM + PLINTH_HEIGHT;
const GROUND_HEIGHT = 22;
const INSCRIPTION_TOP = 70;
const INSCRIPTION_SIDE = 44;

/** Classic arched tombstone + footing slab. */
const STONE_PATH = `
  M 42 98
  C 42 46, 82 18, 126 18
  C 170 18, 210 46, 210 98
  L 210 ${STONE_BOTTOM}
  L 42 ${STONE_BOTTOM}
  Z
`;

const PLINTH_PATH = `
  M 28 ${STONE_BOTTOM}
  L 224 ${STONE_BOTTOM}
  L 224 ${PLINTH_BOTTOM}
  L 28 ${PLINTH_BOTTOM}
  Z
`;

const INSET_FRAME_PATH = `
  M 54 108
  C 54 62, 86 38, 126 38
  C 166 38, 198 62, 198 108
  L 198 252
  L 54 252
  Z
`;

type MemorialHeadstoneProps = {
  pieceName: string;
  epitaph?: string;
  causeOfDeath?: string;
  imageUri?: string;
  /** When true, show placeholder copy for empty fields. */
  preview?: boolean;
  /** Render width in px (scales the monument proportionally). */
  width?: number;
  /** Hide the per-stone grass strip when sitting on a shared garden plot. */
  showGround?: boolean;
};

export const MEMORIAL_HEADSTONE_BASE_WIDTH = STONE_WIDTH;
export const MEMORIAL_HEADSTONE_BASE_HEIGHT = PLINTH_BOTTOM + GROUND_HEIGHT;

export function getMemorialHeadstoneHeight(width = STONE_WIDTH, showGround = true) {
  const scale = width / STONE_WIDTH;
  const height = PLINTH_BOTTOM + (showGround ? GROUND_HEIGHT : 0);
  return height * scale;
}

function OfferingMedallion({ imageUri }: { imageUri?: string }) {
  return (
    <View style={styles.medallionRing}>
      <View style={styles.medallion}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.medallionImage} resizeMode="cover" />
        ) : (
          <Text style={styles.medallionEmoji}>🏺</Text>
        )}
        <View style={styles.medallionVeil}>
          <Text style={styles.medallionShroud}>🪦</Text>
        </View>
      </View>
    </View>
  );
}

export function MemorialHeadstone({
  pieceName,
  epitaph,
  causeOfDeath,
  imageUri,
  preview = false,
  width = STONE_WIDTH,
  showGround = true,
}: MemorialHeadstoneProps) {
  const gradientKey = React.useId().replace(/:/g, '');
  const trimmedEpitaph = epitaph?.trim();
  const trimmedCause = causeOfDeath?.trim();

  const epitaphText = trimmedEpitaph
    ? `“${trimmedEpitaph}”`
    : preview
      ? '“Awaiting final words.”'
      : null;

  const causeText = trimmedCause
    ? trimmedCause
    : preview
      ? 'Still under divine review.'
      : null;

  const svgHeight = PLINTH_BOTTOM;
  const monumentHeight = PLINTH_BOTTOM + (showGround ? GROUND_HEIGHT : 0);
  const scale = width / STONE_WIDTH;
  const scaledHeight = monumentHeight * scale;

  const monument = (
    <View style={styles.wrap}>
      <View style={[styles.monument, { width: STONE_WIDTH, height: monumentHeight }]}>
        <Svg
          width={STONE_WIDTH}
          height={svgHeight}
          viewBox={`0 0 ${STONE_WIDTH} ${svgHeight}`}
          style={styles.svg}
        >
          <Defs>
            <SvgLinearGradient id={`stoneFace-${gradientKey}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#7A6554" />
              <Stop offset="0.35" stopColor="#544436" />
              <Stop offset="1" stopColor="#352B23" />
            </SvgLinearGradient>
            <SvgLinearGradient id={`plinthFace-${gradientKey}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#43372D" />
              <Stop offset="1" stopColor="#2A221C" />
            </SvgLinearGradient>
          </Defs>

          <Path d={STONE_PATH} fill={`url(#stoneFace-${gradientKey})`} />
          <Path
            d={INSET_FRAME_PATH}
            fill="none"
            stroke="rgba(255, 232, 205, 0.14)"
            strokeWidth={1.2}
          />
          <Path
            d={STONE_PATH}
            fill="none"
            stroke="#A08970"
            strokeWidth={1.5}
          />
          <Path d={PLINTH_PATH} fill={`url(#plinthFace-${gradientKey})`} />
          <Path
            d={PLINTH_PATH}
            fill="none"
            stroke="#7A6652"
            strokeWidth={1}
          />
        </Svg>

        <View
          style={[
            styles.inscription,
            { bottom: GROUND_HEIGHT + PLINTH_HEIGHT + 8 },
          ]}
          pointerEvents="none"
        >
          <OfferingMedallion imageUri={imageUri} />

          <Text style={styles.name} numberOfLines={2}>
            {pieceName}
          </Text>

          {epitaphText ? <Text style={styles.epitaph}>{epitaphText}</Text> : null}

          {causeText ? (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerDot} />
                <View style={styles.dividerLine} />
                <Text style={styles.cross}>✝</Text>
                <View style={styles.dividerLine} />
                <View style={styles.dividerDot} />
              </View>
              <Text style={styles.cause}>{causeText}</Text>
            </>
          ) : null}
        </View>

        {showGround ? (
          <LinearGradient
            colors={['#4D5F3C', '#3A4A2E', '#2C3824']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.ground, { top: PLINTH_BOTTOM - 1, height: GROUND_HEIGHT + 1 }]}
          >
            {preview ? (
              <Text style={styles.groundLabel}>Kiln Gods&apos; Garden</Text>
            ) : (
              <View style={styles.groundTufts}>
                <View style={styles.tuft} />
                <View style={[styles.tuft, styles.tuftTall]} />
                <View style={styles.tuft} />
                <View style={[styles.tuft, styles.tuftMid]} />
                <View style={styles.tuft} />
              </View>
            )}
          </LinearGradient>
        ) : null}
      </View>
    </View>
  );

  if (scale === 1) return monument;

  return (
    <View style={{ width, height: scaledHeight, overflow: 'hidden', alignItems: 'center' }}>
      <View
        style={{
          width: STONE_WIDTH,
          transform: [{ scale }],
          marginTop: -(monumentHeight * (1 - scale)) / 2,
        }}
      >
        {monument}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 2,
  },
  monument: {
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#1A1008',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  inscription: {
    position: 'absolute',
    top: INSCRIPTION_TOP,
    left: INSCRIPTION_SIDE,
    right: INSCRIPTION_SIDE,
    alignItems: 'center',
  },
  medallionRing: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 219, 174, 0.12)',
    marginBottom: 8,
  },
  medallion: {
    width: 56,
    height: 56,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(18, 10, 6, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 174, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionImage: {
    width: '100%',
    height: '100%',
    opacity: 0.84,
  },
  medallionEmoji: {
    fontSize: 26,
  },
  medallionVeil: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 12, 8, 0.3)',
  },
  medallionShroud: {
    fontSize: 22,
    opacity: 0.58,
  },
  name: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 16,
    lineHeight: 21,
    color: 'rgba(255, 244, 232, 0.95)',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  epitaph: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 232, 205, 0.78)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  divider: {
    width: '88%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 219, 174, 0.3)',
  },
  cross: {
    fontSize: 10,
    color: 'rgba(255, 219, 174, 0.35)',
    lineHeight: 12,
  },
  cause: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255, 232, 205, 0.5)',
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  groundLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(214, 228, 196, 0.75)',
  },
  groundTufts: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 10,
  },
  tuft: {
    width: 14,
    height: 5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: 'rgba(167, 194, 132, 0.5)',
  },
  tuftMid: {
    height: 7,
  },
  tuftTall: {
    height: 9,
  },
});
