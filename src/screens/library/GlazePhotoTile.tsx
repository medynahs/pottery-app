import { Text } from '@/src/components/ui/text';
import { GlazeStatusOrb } from '@/src/screens/glazes/components/GlazeStatusOrb';
import {
  GLAZE_STATUS_LABELS,
  type GlazeStatus,
} from '@/src/screens/glazes/types';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Star } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

export type GlazePhotoTileProps = {
  width: number;
  name: string;
  coneLabel: string;
  /** Card one-liner — clay, temp, finish. Falls back to finishLabel when omitted. */
  subtitle?: string;
  finishLabel: string;
  /** Batch ID + days since mixed. */
  metaLine?: string;
  status?: GlazeStatus;
  previewUri?: string;
  colorHex: string;
  matchesCone?: boolean;
  favorite?: boolean;
  /** Corner badge on the photo, e.g. "Saved" on Discover tiles. */
  cornerBadge?: { label: string; tone?: 'neutral' | 'success' | 'accent' };
  onPress: () => void;
};

const WARM = {
  card: '#FFFBF4',
  border: '#E5D5B8',
  ink: '#3A2810',
  muted: '#8A7355',
  pill: 'rgba(255, 251, 244, 0.94)',
  pillBorder: 'rgba(217, 201, 168, 0.85)',
};

function PhotoBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'accent';
}) {
  const bg =
    tone === 'success'
      ? 'rgba(236, 253, 245, 0.94)'
      : tone === 'accent'
        ? 'rgba(255, 247, 230, 0.94)'
        : WARM.pill;
  const border =
    tone === 'success' ? 'rgba(134, 197, 150, 0.7)' : WARM.pillBorder;
  const color = tone === 'success' ? '#166534' : WARM.ink;

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '700', color }}>{label}</Text>
    </View>
  );
}

/** Masonry photo card — shared by Discover and My Atlas grids. */
export function GlazePhotoTile({
  width,
  name,
  coneLabel,
  subtitle,
  finishLabel,
  metaLine,
  status,
  previewUri,
  colorHex,
  matchesCone = false,
  favorite = false,
  cornerBadge,
  onPress,
}: GlazePhotoTileProps) {
  const detailLine = subtitle ?? finishLabel;
  const imageHeight = width * 1.05;
  const statusLabel = status ? GLAZE_STATUS_LABELS[status] : null;
  const accessibilityParts = [
    name,
    statusLabel,
    coneLabel,
    detailLine,
    metaLine,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityParts.join(', ')}
      style={{
        width,
        marginBottom: 12,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: WARM.border,
        backgroundColor: WARM.card,
        shadowColor: '#3A2810',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View style={{ width, height: imageHeight, position: 'relative' }}>
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: colorHex }} />
        )}

        {/* Soft fade at bottom of photo so badges read cleanly — not a grey caption bar */}
        <LinearGradient
          colors={['transparent', 'rgba(58, 40, 16, 0.12)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 36,
          }}
          pointerEvents="none"
        />

        <View
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <View style={{ flexShrink: 1, maxWidth: '55%' }}>
            <PhotoBadge label={coneLabel} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start', flexShrink: 0 }}>
            {cornerBadge ? (
              <PhotoBadge label={cornerBadge.label} tone={cornerBadge.tone ?? 'success'} />
            ) : null}
            {status ? (
              <GlazeStatusOrb status={status} size="sm" />
            ) : matchesCone ? (
              <PhotoBadge label="Your cone" tone="success" />
            ) : null}
            {favorite ? (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: WARM.pill,
                  borderWidth: 1,
                  borderColor: WARM.pillBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Star size={13} color="hsl(38 80% 50%)" fill="hsl(38 80% 50%)" />
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: WARM.ink,
            fontFamily: 'Fraunces_600SemiBold',
          }}
        >
          {name}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            fontSize: 11,
            lineHeight: 15,
            color: WARM.muted,
            marginTop: 3,
          }}
        >
          {detailLine}
        </Text>
        {metaLine ? (
          <Text
            numberOfLines={1}
            style={{
              fontSize: 10,
              color: '#A68555',
              marginTop: 4,
              fontWeight: '600',
            }}
          >
            {metaLine}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
