import { Text } from '@/src/components/ui/text';
import { glazeCardColor } from '@/src/screens/library/atlas/helpers';
import {
  GLAZE_RESULT_LABELS,
  type GlazeLibraryItem,
  type GlazeResultRating,
  type GlazeTestTile,
} from '@/src/screens/glazes/types';
import { formatDateShort } from '@/src/utils/dates';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight, FlaskConical } from 'lucide-react-native';
import React from 'react';
import { Animated, ScrollView, TouchableOpacity, View } from 'react-native';

type GlazeTestWallWidgetProps = {
  reveal: Animated.Value;
  glazes: GlazeLibraryItem[];
  glazeTests: GlazeTestTile[];
};

const CARD_BG = 'hsl(40 30% 99%)';
const HEADER_BG = 'hsl(38 28% 96%)';
const BORDER = 'hsl(34 28% 84%)';
const ACCENT = 'hsl(32 48% 36%)';
const PAGE_BG = 'hsl(35 62% 93%)';

const RESULT_STYLES: Record<GlazeResultRating, { bg: string; text: string; dot: string }> = {
  great: { bg: 'hsl(142 35% 90%)', text: 'hsl(142 45% 28%)', dot: 'hsl(142 50% 42%)' },
  interesting: { bg: 'hsl(44 70% 90%)', text: 'hsl(44 55% 28%)', dot: 'hsl(44 70% 45%)' },
  bad: { bg: 'hsl(0 45% 92%)', text: 'hsl(0 45% 35%)', dot: 'hsl(0 50% 48%)' },
};

function TestTileCard({
  test,
  photoUri,
  colorHex,
  onPress,
}: {
  test: GlazeTestTile;
  photoUri?: string;
  colorHex: string;
  onPress: () => void;
}) {
  const resultStyle = RESULT_STYLES[test.resultRating];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`${test.glazeNameSnapshot}, ${GLAZE_RESULT_LABELS[test.resultRating]}`}
      style={{
        width: 148,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: BORDER,
        backgroundColor: CARD_BG,
        shadowColor: '#3f2a12',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: 104, backgroundColor: colorHex }}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${colorHex}cc`,
            }}
          >
            <FlaskConical size={22} color="rgba(255,255,255,0.72)" />
          </View>
        )}
        <View
          style={{
            position: 'absolute',
            left: 8,
            bottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: resultStyle.bg,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.55)',
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: resultStyle.dot,
            }}
          />
          <Text style={{ fontSize: 10, fontWeight: '700', color: resultStyle.text }}>
            {GLAZE_RESULT_LABELS[test.resultRating]}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 11, paddingTop: 10, paddingBottom: 11 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '600', color: 'hsl(24 25% 15%)' }}
          numberOfLines={1}
        >
          {test.glazeNameSnapshot}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
          <Text style={{ fontSize: 10, color: 'hsl(32 28% 48%)', fontWeight: '500' }}>
            {formatDateShort(test.firingDate)}
          </Text>
          <ChevronRight size={13} color="hsl(32 28% 58%)" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function GlazeTestWallWidget({ reveal, glazes, glazeTests }: GlazeTestWallWidgetProps) {
  const router = useRouter();
  const glazeById = React.useMemo(
    () => new Map(glazes.map((glaze) => [glaze.id, glaze])),
    [glazes],
  );

  const recentTests = React.useMemo(
    () =>
      [...glazeTests]
        .sort((a, b) => b.firingDate.localeCompare(a.firingDate))
        .slice(0, 12),
    [glazeTests],
  );

  if (recentTests.length === 0) return null;

  return (
    <Animated.View
      style={{
        opacity: reveal,
        transform: [
          {
            translateY: reveal.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
      }}
    >
      <View
        className="rounded-[24px] overflow-hidden mb-4"
        style={{
          backgroundColor: CARD_BG,
          borderWidth: 1,
          borderColor: BORDER,
          shadowColor: '#3f2a12',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <View
          className="px-4 pt-4 pb-3"
          style={{ backgroundColor: HEADER_BG, borderBottomWidth: 1, borderBottomColor: BORDER }}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'hsl(35 42% 90%)',
                    borderWidth: 1,
                    borderColor: BORDER,
                  }}
                >
                  <FlaskConical size={14} color={ACCENT} />
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 1,
                    color: ACCENT,
                    textTransform: 'uppercase',
                  }}
                >
                  Test wall
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: 'hsl(32 30% 42%)', marginTop: 8, lineHeight: 17 }}>
                Recent glaze tests from your atlas, tap a tile to open the batch.
              </Text>
            </View>
            <View
              style={{
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
                backgroundColor: 'hsl(35 42% 90%)',
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: ACCENT }}>
                {recentTests.length}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, gap: 12 }}
        >
          {recentTests.map((test) => {
            const glaze = glazeById.get(test.glazeId);
            const photoUri =
              test.photoUri
              ?? glaze?.testTilePhotoUris[0]
              ?? glaze?.bucketPhotoUri;
            const colorHex = glazeCardColor(glaze?.colorFamily ?? 'neutral');

            return (
              <TestTileCard
                key={test.id}
                test={test}
                photoUri={photoUri}
                colorHex={colorHex}
                onPress={() => router.push(`/glaze/${test.glazeId}` as never)}
              />
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/library' as never)}
          activeOpacity={0.78}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: BORDER,
            backgroundColor: PAGE_BG,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: ACCENT }}>
            Open glaze atlas
          </Text>
          <ChevronRight size={14} color={ACCENT} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
