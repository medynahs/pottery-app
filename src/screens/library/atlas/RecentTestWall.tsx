import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import {
  GLAZE_RESULT_LABELS,
  GLAZE_THICKNESS_LABELS,
} from '@/src/screens/glazes/types';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { formatShortDate, glazeCardColor } from './helpers';
import { GlazeThumbnail } from './MediaSlot';

function resultStyle(result: GlazeTestTile['resultRating']) {
  if (result === 'great') return { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D' };
  if (result === 'bad') return { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C' };
  return { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' };
}

function TestRow({
  test,
  glaze,
  onPress,
}: {
  test: GlazeTestTile;
  glaze: GlazeLibraryItem | undefined;
  onPress: () => void;
}) {
  const style = resultStyle(test.resultRating);
  const photo = test.photoUri ?? glaze?.testTilePhotoUris[0] ?? glaze?.bucketPhotoUri;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center gap-3 px-6 py-3 border-b border-border"
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <GlazeThumbnail
          uri={photo}
          colorHex={glazeCardColor(glaze?.colorFamily ?? test.glazeNameSnapshot)}
          size={52}
          rounded={0}
        />
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <Text
          className="text-sm font-semibold text-foreground"
          numberOfLines={1}
          style={{ fontFamily: 'Fraunces_600SemiBold' }}
        >
          {test.glazeNameSnapshot}
        </Text>
        <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
          {formatShortDate(test.firingDate)} · {test.clayBody} · {test.cone}
          {test.thickness ? ` · ${GLAZE_THICKNESS_LABELS[test.thickness]}` : ''}
        </Text>
        {test.notes ? (
          <Text className="text-[11px] text-muted-foreground italic" numberOfLines={1}>
            {test.notes}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          paddingHorizontal: 9,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: style.bg,
          borderWidth: 1,
          borderColor: style.border,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '700', color: style.text }}>
          {GLAZE_RESULT_LABELS[test.resultRating]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function RecentTestWall({
  recentTests,
  glazes,
  onLogTest,
  onPressTest,
}: {
  recentTests: GlazeTestTile[];
  glazes: GlazeLibraryItem[];
  onLogTest: () => void;
  onPressTest: (glazeId: string) => void;
}) {
  return (
    <View className="mt-8">
      <View className="px-6 mb-1 flex-row items-center justify-between">
        <View>
          <Text className="text-lg text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
            Test Log
          </Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            Recent firings across your studio
          </Text>
        </View>

        <TouchableOpacity
          onPress={onLogTest}
          activeOpacity={0.85}
          className="px-3 py-2 rounded-xl border border-border bg-card"
        >
          <Text className="text-xs font-semibold text-foreground">+ Log tile</Text>
        </TouchableOpacity>
      </View>

      {recentTests.length === 0 ? (
        <View className="mx-6 mt-3 rounded-2xl border border-dashed border-border bg-card/50 px-5 py-8 items-center">
          <Text className="text-sm text-muted-foreground text-center leading-5">
            No test tiles yet. After a firing, log the result here to track what worked.
          </Text>
        </View>
      ) : (
        <View className="mt-2 border-t border-border">
          {recentTests.map((test) => {
            const glaze = glazes.find((g) => g.id === test.glazeId);
            return (
              <TestRow
                key={test.id}
                test={test}
                glaze={glaze}
                onPress={() => onPressTest(test.glazeId)}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
